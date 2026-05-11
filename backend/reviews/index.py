"""
Отзывы пользователей DotaLife.
GET  /  — список всех отзывов
POST /  — добавить отзыв (авторизованный или гость)
"""
import os
import json
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

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

    # GET — список отзывов
    if method == "GET":
        conn = get_db()
        cur = conn.cursor()
        cur.execute(f"""
            SELECT
                r.id, r.rating, r.text, r.created_at,
                COALESCE(u.name, r.guest_name) AS user_name,
                COALESCE(u.avatar, '') AS user_avatar,
                COALESCE(u.provider, 'guest') AS provider
            FROM {SCHEMA}.reviews r
            LEFT JOIN {SCHEMA}.users u ON r.user_id = u.id
            ORDER BY r.created_at DESC
            LIMIT 100
        """)
        rows = cur.fetchall()
        conn.close()
        reviews = [
            {"id": r[0], "rating": r[1], "text": r[2], "created_at": r[3],
             "user_name": r[4], "user_avatar": r[5], "provider": r[6]}
            for r in rows
        ]
        return json_response({"reviews": reviews})

    # POST — добавить отзыв
    if method == "POST":
        headers = event.get("headers") or {}
        token = headers.get("X-Session-Token") or headers.get("x-session-token")

        body = json.loads(event.get("body") or "{}")
        rating = body.get("rating")
        text = (body.get("text") or "").strip()

        if not isinstance(rating, int) or rating < 1 or rating > 5:
            return json_response({"error": "Рейтинг должен быть от 1 до 5"}, 400)
        if not text or len(text) < 5:
            return json_response({"error": "Напишите отзыв (минимум 5 символов)"}, 400)
        if len(text) > 1000:
            return json_response({"error": "Отзыв слишком длинный (максимум 1000 символов)"}, 400)

        conn = get_db()
        cur = conn.cursor()

        # Авторизованный пользователь
        if token:
            cur.execute(f"SELECT id, name, avatar, provider FROM {SCHEMA}.users WHERE session_token = %s", (token,))
            user = cur.fetchone()
            if not user:
                conn.close()
                return json_response({"error": "Сессия недействительна"}, 401)

            cur.execute(f"SELECT id FROM {SCHEMA}.reviews WHERE user_id = %s", (user[0],))
            if cur.fetchone():
                conn.close()
                return json_response({"error": "Вы уже оставили отзыв"}, 409)

            cur.execute(
                f"INSERT INTO {SCHEMA}.reviews (user_id, rating, text) VALUES (%s, %s, %s) RETURNING id, created_at",
                (user[0], rating, text)
            )
            row = cur.fetchone()
            conn.close()
            return json_response({
                "review": {"id": row[0], "rating": rating, "text": text, "created_at": row[1],
                           "user_name": user[1], "user_avatar": user[2], "provider": user[3]}
            }, 201)

        # Гость — получаем следующий номер из sequence
        cur.execute(f"SELECT nextval('{SCHEMA}.guest_counter')")
        guest_num = cur.fetchone()[0]
        guest_name = f"#Гость{guest_num:05d}"

        cur.execute(
            f"INSERT INTO {SCHEMA}.reviews (user_id, guest_name, rating, text) VALUES (NULL, %s, %s, %s) RETURNING id, created_at",
            (guest_name, rating, text)
        )
        row = cur.fetchone()
        conn.close()
        return json_response({
            "review": {"id": row[0], "rating": rating, "text": text, "created_at": row[1],
                       "user_name": guest_name, "user_avatar": "", "provider": "guest"},
            "guest_name": guest_name
        }, 201)

    return json_response({"error": "Method not allowed"}, 405)