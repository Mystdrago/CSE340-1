-- task 1:1
insert into account
(account_firstname, account_lastname, account_email, account_password)
VALUES
('Tony', 'Stark', 'tony@starknet.com', 'Iam1ronM@n');

-- task 1:2
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;

-- task 1:3
DELETE FROM account
WHERE account_id = 1;

-- task 1:4
UPDATE inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10;

-- task 1:5
SELECT 
    i.inv_make,
    i.inv_model,
    c.classification_id,
    c.classification_name
FROM inventory AS i
INNER JOIN classification AS c
ON i.classification_id = c.classification_id
WHERE c.classification_id = 2;

-- task 1:6
UPDATE inventory
SET 
inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');