-- Keep the development fixtures usable with the 12-digit account-number rule.
UPDATE account
SET account_number = CASE account_number
    WHEN 'PF100001' THEN '100000000001'
    WHEN 'PF100002' THEN '100000000002'
    WHEN 'PF100003' THEN '100000000003'
    ELSE account_number
END
WHERE account_number IN ('PF100001', 'PF100002', 'PF100003');

UPDATE beneficiary
SET account_number = '100000000003'
WHERE account_number = 'PF100003';
