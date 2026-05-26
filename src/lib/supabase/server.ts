import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
            global: {
                fetch: async (url, options) => {
                    try {
                        // Use AbortSignal to timeout quickly if hanging (3 seconds)
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), 3000);
                        
                        const response = await fetch(url, {
                            ...options,
                            signal: controller.signal
                        });
                        clearTimeout(id);
                        return response;
                    } catch (err) {
                        // Intercept network errors (like ENOTFOUND when Supabase is paused)
                        // and return a 400 Bad Request to prevent Supabase JS from infinitely retrying 
                        // and causing a 25s Vercel Function timeout.
                        return new Response(JSON.stringify({ error: 'Network fetch failed or timed out' }), {
                            status: 400,
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                }
            }
        }
    )
}
