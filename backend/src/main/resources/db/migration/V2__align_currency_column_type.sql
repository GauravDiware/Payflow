ALTER TABLE account
    ALTER COLUMN currency TYPE VARCHAR(3) USING TRIM(currency);

ALTER TABLE payment_transaction
    ALTER COLUMN currency TYPE VARCHAR(3) USING TRIM(currency);
