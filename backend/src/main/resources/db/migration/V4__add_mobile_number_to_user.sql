ALTER TABLE app_user ADD COLUMN mobile_number VARCHAR(15);
CREATE UNIQUE INDEX uq_app_user_mobile_number ON app_user (mobile_number) WHERE mobile_number IS NOT NULL;
