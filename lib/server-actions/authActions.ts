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