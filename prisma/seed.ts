import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    const adminUuid = '1743c9c7-7817-4f97-b881-e84498f71c9f'
    const adminEmail = 'admin@tpanuruliman.com'

    // 1. Ensure Roles (Duplicate of migration, but safe to verify)
    // Actually, roles are handled by migration now, but no harm ensuring.
    // We'll skip roles and focus on the User/Auth creation.

    // 2. Insert into auth.users using raw SQL
    // Notes: 
    // - Using a hardcoded bcrypt hash for 'admin123' to avoid pgcrypto dependency issues in some environments.
    // - Hash: $2a$10$YourHashHere... (Actually let's use the pgcrypto crypt() function since we know we are on postgres/supabase)

    console.log('Creating auth user...')
    try {
        // Enable pgcrypto (safe if exists)
        await prisma.$executeRawUnsafe(`create extension if not exists "pgcrypto";`)

        await prisma.$executeRawUnsafe(`
      INSERT INTO "auth"."users" (
        "instance_id",
        "id",
        "aud",
        "role",
        "email",
        "encrypted_password",
        "email_confirmed_at",
        "recovery_sent_at",
        "last_sign_in_at",
        "raw_app_meta_data",
        "raw_user_meta_data",
        "created_at",
        "updated_at",
        "confirmation_token",
        "email_change",
        "email_change_token_new",
        "recovery_token"
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        '${adminUuid}',
        'authenticated',
        'authenticated',
        '${adminEmail}',
        crypt('admin123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{}',
        NOW(),
        NOW(),
        '',
        '',
        '',
        ''
      ) ON CONFLICT ("id") DO NOTHING;
    `)
        console.log('Auth user created (or already exists).')
    } catch (e) {
        console.warn('Error creating auth user (might be permissions or already exists):', e)
    }

    // 3. Insert into public.User
    const adminRole = await prisma.role.findUnique({
        where: { name: 'admin' }
    })

    if (!adminRole) {
        throw new Error('Admin role not found. Please run migrations first.')
    }

    console.log('Creating public user...')
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            id: adminUuid,
            email: adminEmail,
            roleId: adminRole.id,
            isActive: true, // Assuming isActive is boolean (based on schema)
        }
    })

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
