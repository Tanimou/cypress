/**
 * Handles a GET request to exchange a code for a session and redirect to the dashboard.
 * 
 * This function is responsible for handling a GET request to exchange a code for a session using Supabase authentication.
 * It retrieves the 'code' query parameter from the request URL, exchanges the code for a session using Supabase client,
 * and redirects the user to the dashboard.
 * 
 */
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';



/**
 * Asynchronously handles a GET request to exchange a code for a session and redirect to the dashboard.
 * 
 * @param {NextRequest} req - The Next.js request object.
 * @returns {Promise<NextResponse>} - A promise resolving to a Next.js response object for redirecting to the dashboard.
 */
export async function GET(req: NextRequest) {
    // Create a new URL object from the request URL
    const requestUrl = new URL(req.url);

    // Get the 'code' query parameter from the URL
    const code = requestUrl.searchParams.get('code');

    // If a code is present
    if (code) {
        // Create a new Supabase client for handling routes, passing in the cookies
        const supabase = createRouteHandlerClient({ cookies });

        // Exchange the code for a session
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Redirect the user to the dashboard
    return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
