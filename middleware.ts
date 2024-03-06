import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextRequest, NextResponse } from 'next/server';

/**
 * This file contains a middleware function for a Next.js server that uses Supabase for authentication.
 * The middleware function, `middleware`, is exported from this file and is designed to handle incoming
 * HTTP requests and produce appropriate responses based on the request's URL and the user's authentication status.
 *
 * The `middleware` function works as follows:
 * 1. It creates a new `NextResponse` object, which will be used to build the HTTP response.
 * 2. It creates a Supabase client using the `createMiddlewareClient` function from the `@supabase/auth-helpers-nextjs` package.
 *    This client is created using the incoming request and the response object.
 * 3. It retrieves the session data from Supabase's authentication system.
 * 4. It checks if the requested URL starts with '/dashboard' and if there is no active session.
 *    If both conditions are met, it redirects the user to the login page.
 * 5. It checks if the URL contains an error message indicating that an email link is invalid or has expired,
 *    and if the path is not '/signup'. If both conditions are met, it redirects the user to the signup page with the error description.
 * 6. It checks if the path is '/login' or '/signup' and if there is an active session.
 *    If both conditions are met, it redirects the user to the dashboard page.
 * 7. Finally, it returns the response object.
 *
 * This middleware function is crucial for managing user access to different parts of the application based on their authentication status.
 * It ensures that only authenticated users can access certain routes (like '/dashboard'), and that users are redirected to the appropriate
 * pages when they try to access routes they shouldn't be able to (like trying to access the login or signup pages while already logged in).
 */

/**
 * Middleware function that handles requests and responses.
 * @param req - The NextRequest object representing the incoming request.
 * @returns A Promise that resolves to a NextResponse object representing the response.
 */
export async function middleware(req: NextRequest) {
    // Create a new NextResponse object
    const res = NextResponse.next();

    // Create a Supabase client using the request and response objects
    const supabase = createMiddlewareClient({ req, res });

    // Get the session data from Supabase authentication
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Check if the requested URL starts with '/dashboard' and there is no active session
    if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
        // Redirect to the login page
        return NextResponse.redirect(new URL('/login', req.url));
    }

    // Define an error message for an invalid or expired email link
    const emailLinkError = 'Email link is invalid or has expired';

    // Check if the URL contains the email link error and the path is not '/signup'
    if (
        req.nextUrl.searchParams.get('error_description') === emailLinkError &&
        req.nextUrl.pathname !== '/signup'
    ) {
        // Redirect to the signup page with the error description
        return NextResponse.redirect(
            new URL(
                `/signup?error_description=${req.nextUrl.searchParams.get(
                    'error_description'
                )}`,
                req.url
            )
        );
    }

    // Check if the path is '/login' or '/signup' and there is an active session
    if (['/login', '/signup'].includes(req.nextUrl.pathname) && session) {
        // Redirect to the dashboard page
        return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Return the response object
    return res;
}