-- Complete the legacy demo profiles so the mock recovery flow can verify them.
UPDATE app_user SET mobile_number = '9876543210' WHERE id = 1 AND mobile_number IS NULL;
UPDATE app_user SET mobile_number = '9876543211' WHERE id = 2 AND mobile_number IS NULL;
UPDATE app_user SET mobile_number = '9876543212' WHERE id = 3 AND mobile_number IS NULL;
UPDATE app_user SET mobile_number = '9876543213' WHERE id = 4 AND mobile_number IS NULL;
