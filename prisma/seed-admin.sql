-- Step 1: First, create an admin user in Supabase Auth Dashboard
-- Go to: Authentication > Users > Add User
-- Email: admin@tpanuruliman.com
-- Password: Admin123!
-- After creating, copy the UUID from the user

-- Step 2: Then run this SQL in Supabase SQL Editor
-- Replace 'YOUR-ADMIN-UUID-HERE' with the actual UUID from Supabase Auth

-- Insert the admin role if it doesn't exist
INSERT INTO "Role" (name) VALUES ('admin')
ON CONFLICT (name) DO NOTHING;

-- Get the admin role ID
DO $$
DECLARE
    admin_role_id INT;
    admin_auth_id TEXT := '39422e4b-0859-4942-8516-cb3c62e1d693'; -- Replace with actual UUID from Supabase Auth
BEGIN
    -- Get the admin role ID
    SELECT id INTO admin_role_id FROM "Role" WHERE name = 'admin';
    
    -- Insert the admin user in our database
    INSERT INTO "User" (id, email, "roleId", "createdAt", "updatedAt")
    VALUES (
        admin_auth_id,
        'nuralim.mail@gmail.com',
        admin_role_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Verify the admin user was created
SELECT u.id, u.email, r.name as role 
FROM "User" u 
JOIN "Role" r ON u."roleId" = r.id 
WHERE u.email = 'admin@tpanuruliman.com';
