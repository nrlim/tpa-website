import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'

export default async function DebugPage() {
    const supabase = await createClient()

    // Get all users from database
    const dbUsers = await prisma.user.findMany({
        include: {
            role: true,
            parent: {
                include: {
                    students: true
                }
            }
        }
    })

    // Try to get current auth user
    const { data: { user: authUser } } = await supabase.auth.getUser()

    return (
        <div className="container mx-auto p-8">
            <h1 className="text-2xl font-bold mb-4">Debug: Users Status</h1>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Current Auth User:</h2>
                <pre className="bg-gray-100 p-4 rounded overflow-auto">
                    {JSON.stringify(authUser, null, 2)}
                </pre>
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Database Users ({dbUsers.length}):</h2>
                {dbUsers.map((user) => (
                    <div key={user.id} className="bg-white border p-4 mb-4 rounded">
                        <p><strong>ID:</strong> {user.id}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role.name}</p>
                        {user.parent?.students?.map((student) => (
                            <p key={student.id}><strong>Student Name:</strong> {student.fullName}</p>
                        ))}
                    </div>
                ))}
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
                <h3 className="font-bold">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2 mt-2">
                    <li>Go to Supabase Dashboard → Authentication → Users</li>
                    <li>Check if users appear there</li>
                    <li>Compare the UUIDs between Supabase Auth and Database</li>
                    <li>If they don't match, there's a sync issue</li>
                </ol>
            </div>
        </div>
    )
}
