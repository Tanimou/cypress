'use client';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Logo from '../../../public/cypresslogo.svg';
import Loader from '@/components/global/Loader';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MailCheck } from 'lucide-react';
import { FormSchema, SignUpFormSchema } from '@/lib/types';
import { actionSignUpUser } from '@/lib/server-actions/authActions';



const Signup = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [submitError, setSubmitError] = useState('');
    const [confirmation, setConfirmation] = useState(false);

    /**
     * Retrieves the error description from the search parameters.
     * @returns The error description or an empty string if it doesn't exist.
     */
    const codeExchangeError = useMemo(() => {
        // sourcery skip: use-braces
        if (!searchParams) return '';
        return searchParams.get('error_description');
    }, [searchParams]);

    /**
     * Styles for the confirmation and error section.
     * The background color, border color, and text color are determined based on the value of `codeExchangeError`.
     *
     * @param {boolean} codeExchangeError - Indicates whether there is a code exchange error.
     * @returns {string} - The computed styles for the confirmation and error section.
     */
    const confirmationAndErrorStyles = useMemo(() =>
        clsx('bg-primary', {
            'bg-red-500/10': codeExchangeError,
            'border-red-500/50': codeExchangeError,
            'text-red-700': codeExchangeError,
        }),
        [codeExchangeError]
    );

    /**
     * Initializes the form with the specified default values and validation schema.
     *
     * @template T - The type of the form data.
     * @param {Object} options - The options for initializing the form.
     * @param {string} options.mode - The mode for validating the form.
     * @param {Function} options.resolver - The resolver function for validating the form.
     * @param {T} options.defaultValues - The default values for the form fields.
     * @returns {Object} - The initialized form object.
     */
    const form = useForm<z.infer<typeof SignUpFormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(SignUpFormSchema),
        defaultValues: { email: '', password: '', confirmPassword: '' },
    });

    const isLoading = form.formState.isSubmitting;

    /**
     * Handles the form submission event.
     * @param {Object} values - The form values.
     * @returns {Promise<void>} - A promise that resolves when the submission is complete.
     */
    const onSubmit = async ({ email, password }: z.infer<typeof FormSchema>) => {
        // Call the actionSignUpUser function to sign up the user with the provided email and password.
        const { error } = await actionSignUpUser({ email, password });

        // If an error occurred during the sign up process, display the error message, reset the form, and return.
        if (error) {
            setSubmitError(error.message);
            form.reset();
            return;
        }

        // Set the confirmation state to true to indicate that the sign up was successful.
        setConfirmation(true);
    };

    return (
        <Form {...form}>
            <form
                onChange={() => {
                    if (submitError) setSubmitError('');
                }}
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col">
                <Link
                    href="/"
                    className="w-full flex justify-left items-center">
                    <Image
                        src={Logo}
                        alt="cypress Logo"
                        width={50}
                        height={50}
                    />
                    <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">
                        cypress.
                    </span>
                </Link>
                <FormDescription className="text-foreground/60">
                    An all-In-One Collaboration and Productivity Platform
                </FormDescription>
                {!confirmation && !codeExchangeError && (
                    <>
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder="Email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={isLoading}
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="Confirm Password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full p-6"
                            disabled={isLoading}
                        >
                            {!isLoading ? 'Create Account' : <Loader />}
                        </Button>
                    </>
                )}

                {submitError && <FormMessage>{submitError}</FormMessage>}

                <span className="self-container">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-primary"
                    >
                        Login
                    </Link>
                </span>
                {(confirmation || codeExchangeError) && (
                    <>
                        <Alert className={confirmationAndErrorStyles}>
                            {!codeExchangeError && <MailCheck className="h-4 w-4" />}
                            <AlertTitle>
                                {codeExchangeError ? 'Invalid Link' : 'Check your email.'}
                            </AlertTitle>
                            <AlertDescription>
                                {codeExchangeError || 'An email confirmation has been sent.'}
                            </AlertDescription>
                        </Alert>
                    </>
                )}
            </form>
        </Form>
    );
};

export default Signup;