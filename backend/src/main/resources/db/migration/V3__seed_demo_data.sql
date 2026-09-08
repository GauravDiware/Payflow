-- Development-only sample data for manual API verification.
INSERT INTO app_user (id, full_name, email, role, status, created_at) VALUES
    (1, 'Gaurav Diware', 'gaurav@example.com', 'CUSTOMER', 'ACTIVE', CURRENT_TIMESTAMP),
    (2, 'Rahul Sharma', 'rahul@example.com', 'CUSTOMER', 'ACTIVE', CURRENT_TIMESTAMP),
    (3, 'Admin User', 'admin@payflow.com', 'ADMIN', 'ACTIVE', CURRENT_TIMESTAMP),
    (4, 'Auditor User', 'auditor@payflow.com', 'AUDITOR', 'ACTIVE', CURRENT_TIMESTAMP);

SELECT setval(pg_get_serial_sequence('app_user', 'id'), 4, true);

INSERT INTO account (id, account_number, owner_id, type, currency, balance, status, created_at) VALUES
    ('00000000-0000-0000-0000-000000000001', 'PF100001', 1, 'SAVINGS', 'INR', 50000.00, 'ACTIVE', CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000002', 'PF100002', 1, 'CHECKING', 'INR', 25000.00, 'ACTIVE', CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000003', 'PF100003', 2, 'SAVINGS', 'INR', 120000.00, 'ACTIVE', CURRENT_TIMESTAMP);

INSERT INTO beneficiary (id, owner_id, name, account_number, nickname, verified, created_at) VALUES
    ('00000000-0000-0000-0000-000000000101', 1, 'Rahul Sharma', 'PF100003', 'Rahul', TRUE, CURRENT_TIMESTAMP);

INSERT INTO payment_transaction (id, reference, from_account_id, to_account_id, amount, currency, description, status, created_at) VALUES
    ('00000000-0000-0000-0000-000000000201', 'PF-TXN-DEMO-001', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 5000.00, 'INR', 'Sample payment', 'SUCCESS', CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000202', 'PF-TXN-DEMO-002', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 50000.00, 'INR', 'Sample flagged transfer', 'FLAGGED', CURRENT_TIMESTAMP);
