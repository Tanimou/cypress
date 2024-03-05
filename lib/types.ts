import { z } from 'zod';

/**
 * This is the FormSchema object which validates the form inputs.
 * It checks if the email is in the correct format and if the password is at least 8 characters long.
 */
export const FormSchema = z.object({
    email: z.string().describe('Email').email({message:'Invalid Email'}),
    password: z.string().describe('Password').min(8,'Password is required'),
});

/**
 * Represents the schema for the sign-up form.
 */
export const SignUpFormSchema = z
    .object({
        /**
         * The email field of the sign-up form.
         * @description Represents the user's email address.
         * @format email
         * @example "example@example.com"
         */
        email: z.string().describe('Email').email({ message: 'Invalid Email' }),

        /**
         * The password field of the sign-up form.
         * @description Represents the user's password.
         * @minLength 6
         * @example "password123"
         */
        password: z
            .string()
            .describe('Password')
            .min(6, 'Password must be minimum 6 characters'),

        /**
         * The confirm password field of the sign-up form.
         * @description Represents the user's password confirmation.
         * @minLength 6
         * @example "password123"
         */
        confirmPassword: z
            .string()
            .describe('Confirm Password')
            .min(6, 'Password must be minimum 6 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match.",
        path: ['confirmPassword'],
    });