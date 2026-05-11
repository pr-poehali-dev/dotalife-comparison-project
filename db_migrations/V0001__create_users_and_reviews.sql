CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(20) NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    avatar VARCHAR(512),
    session_token VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(provider, provider_id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
