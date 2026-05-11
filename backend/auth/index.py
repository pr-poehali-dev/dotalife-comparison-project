"""
Авторизация через Google и VK OAuth.
Поддерживает: GET /auth?provider=google|vk — редирект на OAuth
              GET /auth?code=...&state=... — callback после авторизации
              GET /auth?action=me — получить текущего пользователя по сессии
              POST /auth?action=logout — выход
"""
import os
import json
import secrets
import psycopg2
import urllib.parse
import urllib.request

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

GOOGLE_CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
VK_CLIENT_ID = os.environ.get("VK_CLIENT_ID", "")
VK_CLIENT_SECRET = os.environ.get("VK_CLIENT_SECRET", "")
REDIRECT_BASE = os.environ.get("REDIRECT_BASE", "")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}

def get_db():
    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    conn.autocommit = True
    return conn

def json_response(data, status=200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False, default=str)}

def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    headers = event.get("headers") or {}

    # Получить текущего пользователя
    if params.get("action") == "me":
        token = headers.get("X-Session-Token") or params.get("token")
        if not token:
            return json_response({"user": None})
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, name, email, avatar, provider FROM {SCHEMA}.users WHERE session_token = %s", (token,))
        row = cur.fetchone()
        conn.close()
        if not row:
            return json_response({"user": None})
        return json_response({"user": {"id": row[0], "name": row[1], "email": row[2], "avatar": row[3], "provider": row[4]}})

    # Logout
    if method == "POST" and params.get("action") == "logout":
        token = headers.get("X-Session-Token")
        if token:
            conn = get_db()
            cur = conn.cursor()
            cur.execute(f"UPDATE {SCHEMA}.users SET session_token = NULL WHERE session_token = %s", (token,))
            conn.close()
        return json_response({"ok": True})

    # Редирект на Google
    if params.get("provider") == "google":
        redirect_uri = f"{REDIRECT_BASE}?callback=google"
        url = (
            "https://accounts.google.com/o/oauth2/v2/auth?"
            + urllib.parse.urlencode({
                "client_id": GOOGLE_CLIENT_ID,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "state": "google",
            })
        )
        return {"statusCode": 302, "headers": {**CORS, "Location": url}, "body": ""}

    # Редирект на VK
    if params.get("provider") == "vk":
        redirect_uri = f"{REDIRECT_BASE}?callback=vk"
        url = (
            "https://oauth.vk.com/authorize?"
            + urllib.parse.urlencode({
                "client_id": VK_CLIENT_ID,
                "redirect_uri": redirect_uri,
                "response_type": "code",
                "scope": "email",
                "state": "vk",
            })
        )
        return {"statusCode": 302, "headers": {**CORS, "Location": url}, "body": ""}

    # Google callback
    if params.get("callback") == "google" and params.get("code"):
        redirect_uri = f"{REDIRECT_BASE}?callback=google"
        token_data = urllib.parse.urlencode({
            "code": params["code"],
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }).encode()
        req = urllib.request.Request("https://oauth2.googleapis.com/token", data=token_data, method="POST")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        with urllib.request.urlopen(req) as resp:
            token_resp = json.loads(resp.read())
        access_token = token_resp.get("access_token")
        req2 = urllib.request.Request(f"https://www.googleapis.com/oauth2/v2/userinfo?access_token={access_token}")
        with urllib.request.urlopen(req2) as resp:
            user_info = json.loads(resp.read())
        return _upsert_user("google", str(user_info["id"]), user_info.get("name", ""), user_info.get("email"), user_info.get("picture"))

    # VK callback
    if params.get("callback") == "vk" and params.get("code"):
        redirect_uri = f"{REDIRECT_BASE}?callback=vk"
        token_url = (
            "https://oauth.vk.com/access_token?"
            + urllib.parse.urlencode({
                "client_id": VK_CLIENT_ID,
                "client_secret": VK_CLIENT_SECRET,
                "redirect_uri": redirect_uri,
                "code": params["code"],
            })
        )
        with urllib.request.urlopen(token_url) as resp:
            token_resp = json.loads(resp.read())
        access_token = token_resp.get("access_token")
        vk_user_id = str(token_resp.get("user_id", ""))
        email = token_resp.get("email", "")
        fields_url = f"https://api.vk.com/method/users.get?user_ids={vk_user_id}&fields=photo_200&access_token={access_token}&v=5.131"
        with urllib.request.urlopen(fields_url) as resp:
            vk_resp = json.loads(resp.read())
        vk_user = vk_resp["response"][0]
        name = f"{vk_user.get('first_name','')} {vk_user.get('last_name','')}".strip()
        avatar = vk_user.get("photo_200", "")
        return _upsert_user("vk", vk_user_id, name, email, avatar)

    return json_response({"error": "unknown action"}, 400)

def _upsert_user(provider, provider_id, name, email, avatar):
    session_token = secrets.token_hex(32)
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        f"""INSERT INTO {SCHEMA}.users (provider, provider_id, name, email, avatar, session_token)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (provider, provider_id)
            DO UPDATE SET name=EXCLUDED.name, email=EXCLUDED.email, avatar=EXCLUDED.avatar, session_token=EXCLUDED.session_token
            RETURNING id, name, email, avatar, provider""",
        (provider, provider_id, name, email or "", avatar or "", session_token)
    )
    row = cur.fetchone()
    conn.close()
    user = {"id": row[0], "name": row[1], "email": row[2], "avatar": row[3], "provider": row[4]}
    return json_response({"user": user, "token": session_token})
