'use server'

import { cookies } from "next/headers";
import { FormSchema } from "../types";
import { z } from 'zod'
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

/**
 * Logs in a user with the provided email and password.
 * @param {Object} credentials - The user's email and password.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<any>} - A promise that resolves to the result of the login operation.
 */
export async function actionLoginUser({ email, password }: z.infer<typeof FormSchema>) {
    const supabase = createRouteHandlerClient({ cookies })
    return await supabase.auth.signInWithPassword({ email, password });
}


/**
 * Asynchronously signs up a user with the provided email and password.
 * Checks if the user already exists in the database before signing up.
 * 
 * @param {Object} FormSchema - The schema defining the structure of the form data.
 * @param {string} email - The email of the user to sign up.
 * @param {string} password - The password of the user to sign up.
 * @returns {Promise<{error: {message: string, data: any}} | any>} - An object containing an error message if the user already exists, otherwise the sign up response.
 */
export async function actionSignUpUser({ email, password }: z.infer<typeof FormSchema>) {
    const supabase = createRouteHandlerClient({ cookies })
    const { data } = await supabase.from('profiles').select('*').eq('email', email)
    // sourcery skip: use-braces
    if (data?.length) return { error: { message: 'User already exists', data } }

    return await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback` } });
}
