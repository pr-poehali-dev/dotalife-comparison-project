-- Создаём системного пользователя для гостей
INSERT INTO users (provider, provider_id, name, email, avatar)
VALUES ('guest', 'system', 'guest_system', '', '')
ON CONFLICT (provider, provider_id) DO NOTHING;

-- Создаём новую таблицу с nullable user_id
CREATE TABLE reviews_new (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    guest_name VARCHAR(50),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Переносим данные
INSERT INTO reviews_new (id, user_id, guest_name, rating, text, created_at)
SELECT id, user_id, guest_name, rating, text, created_at FROM reviews;

-- Меняем таблицы
ALTER TABLE reviews RENAME TO reviews_old;
ALTER TABLE reviews_new RENAME TO reviews;

-- Синхронизируем sequence
SELECT setval('reviews_new_id_seq', COALESCE((SELECT MAX(id) FROM reviews), 0) + 1, false);
