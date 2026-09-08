CREATE TABLE app_user (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CUSTOMER', 'ADMIN', 'AUDITOR')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE account (
    id UUID PRIMARY KEY,
    account_number VARCHAR(32) NOT NULL UNIQUE,
    owner_id BIGINT NOT NULL REFERENCES app_user(id),
    type VARCHAR(20) NOT NULL CHECK (type IN ('SAVINGS', 'CHECKING', 'CURRENT')),
    currency CHAR(3) NOT NULL,
    balance NUMERIC(19,2) NOT NULL CHECK (balance >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BLOCKED', 'CLOSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE beneficiary (
    id UUID PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES app_user(id),
    name VARCHAR(120) NOT NULL,
    account_number VARCHAR(32) NOT NULL,
    nickname VARCHAR(80),
    verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(owner_id, account_number)
);

CREATE TABLE payment_transaction (
    id UUID PRIMARY KEY,
    reference VARCHAR(40) NOT NULL UNIQUE,
    from_account_id UUID NOT NULL REFERENCES account(id),
    to_account_id UUID NOT NULL REFERENCES account(id),
    amount NUMERIC(19,2) NOT NULL CHECK (amount > 0),
    currency CHAR(3) NOT NULL,
    description VARCHAR(100),
    status VARCHAR(20) NOT NULL CHECK (status IN ('INITIATED', 'VALIDATING', 'PROCESSING', 'SUCCESS', 'FAILED', 'FLAGGED')),
    failure_reason VARCHAR(255),
    flag_reason VARCHAR(255),
    risk_level VARCHAR(10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
    id UUID PRIMARY KEY,
    actor_id BIGINT REFERENCES app_user(id),
    action VARCHAR(60) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    result VARCHAR(20) NOT NULL CHECK (result IN ('SUCCESS', 'FAILED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_account_owner ON account(owner_id);
CREATE INDEX idx_beneficiary_owner ON beneficiary(owner_id);
CREATE INDEX idx_transaction_from ON payment_transaction(from_account_id);
CREATE INDEX idx_transaction_to ON payment_transaction(to_account_id);
CREATE INDEX idx_transaction_created ON payment_transaction(created_at DESC);
