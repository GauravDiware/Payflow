CREATE TABLE user_notification (
    id UUID PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES app_user(id),
    channel VARCHAR(10) NOT NULL CHECK (channel IN ('SMS', 'EMAIL')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('security', 'transaction', 'account')),
    title VARCHAR(120) NOT NULL,
    message VARCHAR(500) NOT NULL,
    recipient VARCHAR(255),
    status VARCHAR(10) NOT NULL CHECK (status IN ('QUEUED', 'SENT', 'FAILED')),
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_notification_user_created ON user_notification(user_id, created_at DESC);
