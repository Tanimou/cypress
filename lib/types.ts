import { z } from 'zod';
import { Socket, Server as NetServer } from 'net';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';


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

/**
 * Represents the schema for creating a workspace form.
 */
export const CreateWorkspaceFormSchema = z.object({
    /**
     * The name of the workspace.
     * @remarks Workspace name is required and must have a minimum length of 1.
     */
    workspaceName: z.string().describe('Workspace name').min(1, 'Workspace name is required'),

    /**
     * The logo of the workspace.
     */
    logo: z.any(),
});


export const UploadBannerFormSchema = z.object({
    banner: z.string().describe('Banner Image'),
});

export type NextApiResponseServerIo = NextApiResponse & {
    socket: Socket & {
        server: NetServer & {
            io: SocketIOServer;
        };
    };
};