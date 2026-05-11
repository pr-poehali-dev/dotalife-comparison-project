import os
import json
import boto3
import urllib.request

def handler(event: dict, context) -> dict:
    """Скачивает mp3 с Mail.ru и загружает в S3 для использования на фронте."""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type'}, 'body': ''}

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    # Если файл уже в S3 — сразу отдаём URL
    try:
        s3.head_object(Bucket='files', Key='sounds/tango.mp3')
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/sounds/tango.mp3"
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*'}, 'body': json.dumps({"url": cdn_url, "cached": True})}
    except Exception:
        pass

    # Получаем dispatcher URL для скачивания
    disp_req = urllib.request.Request(
        "https://cloud.mail.ru/api/v2/dispatcher?api=2",
        headers={'User-Agent': 'Mozilla/5.0', 'Referer': 'https://cloud.mail.ru/'}
    )
    with urllib.request.urlopen(disp_req, timeout=10) as r:
        disp = json.loads(r.read())

    # weblink_get возвращает полный CDN URL файла (с токеном)
    download_url = disp['body']['weblink_get'][0]['url']
    print(f"Download URL: {download_url}")

    req = urllib.request.Request(download_url, headers={
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9',
        'Referer': 'https://cloud.mail.ru/',
        'Origin': 'https://cloud.mail.ru',
        'Connection': 'keep-alive',
    })
    with urllib.request.urlopen(req, timeout=30) as resp:
        audio_data = resp.read()

    s3.put_object(
        Bucket='files',
        Key='sounds/tango.mp3',
        Body=audio_data,
        ContentType='audio/mpeg'
    )

    cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/sounds/tango.mp3"

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({"url": cdn_url, "size": len(audio_data)})
    }