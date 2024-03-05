import { z } from 'zod';

/**
 * This is the FormSchema object which validates the form inputs.
 * It checks if the email is in the correct format and if the password is at least 8 characters long.
 */
export const FormSchema = z.object({
    email: z.string().describe('Email').email({message:'Invalid Email'}),
    password: z.string().describe('Password').min(8,'Password is required'),
});