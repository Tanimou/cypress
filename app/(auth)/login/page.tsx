/**
 * The login page component.
 * 
 * This component represents the login page of the application. It allows users to enter their email and password to authenticate and access the dashboard.
 * 
 * The login page uses the following components and libraries:
 * - `next/navigation` for routing within the Next.js application.
 * - `react` and `react-hook-form` for managing form state and validation.
 * - `zod` and `@hookform/resolvers/zod` for form validation using schema.
 * - `next/image` for displaying the Cypress logo.
 * - `@/components/ui` for reusable UI components such as form fields, buttons, and loaders.
 * - `@/lib/server-actions/authActions` for performing the login action on the server.
 * 
 * The login page consists of the following main parts:
 * - A form that allows users to enter their email and password.
 * - Form validation using the `react-hook-form` library and the `zod` schema.
 * - Error handling and display of submit errors.
 * - Redirecting the user to the dashboard upon successful login.
 * 
 * The login page follows the following flow:
 * 1. The user enters their email and password in the form fields.
 * 2. The form is validated using the `zod` schema.
 * 3. If there are validation errors, they are displayed to the user.
 * 4. If the form is valid, the `actionLoginUser` function is called to perform the login action on the server.
 * 5. If there is an error during login, the error message is displayed to the user and the form is reset.
 * 6. If login is successful, the user is redirected to the dashboard.
 * 
 * @returns {JSX.Element} The rendered login page component.
 */
'use client'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { FormSchema } from '../../../lib/types'
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form'
import Link from 'next/link'
import Logo from '../../../public/cypresslogo.svg'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Loader from '@/components/global/Loader'
import { actionLoginUser } from '@/lib/server-actions/authActions'


const LoginPage = () => {
    const router = useRouter()
    const [submitError, setSubmitError] = useState('')

    /**
     * Initializes the form with the specified configuration.
     *
     * @param {object} config - The configuration options for the form.
     * @param {string} config.mode - The mode of the form. Possible values are 'onChange', 'onBlur', and 'onSubmit'.
     * @param {object} config.resolver - The resolver object used to validate the form values.
     * @param {object} config.defaultValues - The default values for the form fields.
     * @returns {object} - The form object.
     */
    const form = useForm<z.infer<typeof FormSchema>>({
        mode: 'onChange',
        resolver: zodResolver(FormSchema),
        defaultValues: { email: '', password: '' },
    });


    const isLoading = form.formState.isSubmitting

    /**
     * Handles the form submission.
     * @param formData The form data to be submitted.
     */
    const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (formData) => {
        // Call the actionLoginUser function to perform the login action.
        const { error } = await actionLoginUser(formData);
        
        // If there is an error, set the submit error message and reset the form.
        if (error) {
            setSubmitError(error.message);
            form.reset();
        } else {
            // If there is no error, redirect the user to the dashboard.
            router.replace('/dashboard');
        }
    }
    

    return (
        <Form {...form}>
            <form
                onChange={() => {
                    if (submitError) setSubmitError('');
                }}
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col"
            >
                <Link href="/" className="w-full flex justify-left items-center">
                    <Image
                        src={Logo}
                        alt="cypress Logo"
                        width={50}
                        height={50}
                    />
                    <span className="font-semibolddark:text-white text-4xl first-letter:ml-2">
                        cypress.
                    </span>
                </Link>

                <FormDescription className="text-foreground/60">
                    An all-In-One Collaboration and Productivity Platform
                </FormDescription>
                
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
                {submitError && <FormMessage>{submitError}</FormMessage>}
                <Button
                    type="submit"
                    className="w-full p-6"
                    size="lg"
                    disabled={isLoading}
                >
                    {!isLoading ? 'Login' : <Loader />}
                </Button>
                <span className="self-container">
                    Dont have an account?{' '}
                    <Link
                        href="/signup"
                        className="text-primary"
                    >
                        Sign Up
                    </Link>
                </span>
            </form>
        </Form>
    )
}

export default LoginPage