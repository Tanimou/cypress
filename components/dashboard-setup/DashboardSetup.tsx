/**
 * DashboardSetup is a React component that serves as the setup page for the user's dashboard.
 * It is responsible for creating a new workspace for the authenticated user.
 *
 * The component receives the authenticated user and their subscription as props.
 * It uses the `useToast` hook to display notifications, and the `useRouter` hook for navigation.
 * It also uses the `useState` hook to manage the selected emoji state.
 * The `createClientComponentClient` function is used to create a Supabase client.
 *
 * The `useForm` hook from `react-hook-form` is used to manage the form state.
 * It is configured with a schema `CreateWorkspaceFormSchema` for form validation using Zod.
 * The form has two fields: 'logo' and 'workspaceName', with default values as empty strings.
 *
 * The `onSubmit` function is defined to handle the form submission.
 * It is an asynchronous function that will be triggered when the form is submitted.
 * The function receives the form values as a parameter.
 *
 * The purpose of this setup page is to allow users to create a workspace where they can manage their work.
 * This is done by submitting a form with the necessary details.
 * The form submission will trigger a query to the Supabase backend to create a new workspace.
 * Once the workspace is successfully created, the user will be redirected to their new workspace.
 *
 * This setup process is necessary to ensure that each user has a dedicated workspace.
 * It allows for better organization and management of the user's work.
 */

'use client';
import { AuthUser } from '@supabase/supabase-js';
import React, { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { v4 } from 'uuid';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../ui/card';
import EmojiPicker from '../global/EmojiPicker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Subscription, workspace } from '@/lib/supabase/supabase.types';
import { Button } from '../ui/button';
import Loader from '../global/Loader';
import { createWorkspace } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
// import { useAppState } from '@/lib/providers/state-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { z } from 'zod';

interface DashboardSetupProps {
    user: AuthUser;
    subscription: Subscription | null;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
    subscription,
    user,
}) => {
    const { toast } = useToast();
    const router = useRouter();
    // const { dispatch } = useAppState();
    const [selectedEmoji, setSelectedEmoji] = useState('💼');
    const supabase = createClientComponentClient();
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting: isLoading, errors },
    } = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
        mode: 'onChange',
        defaultValues: {
            logo: '',
            workspaceName: '',
        },
    });

    /**
     * Handles the form submission for creating a new workspace.
     *
     * @param value - The form values.
     */
    // Define the onSubmit function which will be triggered when the form is submitted
    const onSubmit: SubmitHandler<z.infer<typeof CreateWorkspaceFormSchema>> = async (value) => {
        // Extract the logo file from the form values
        const file = value.logo?.[0];
        let filePath = null;
        // Generate a unique identifier for the workspace
        const workspaceUUID = v4();
        console.log(file);

        // If a file is provided, attempt to upload it to the 'workspace-logos' storage
        if (file) {
            try {
                const { data, error } = await supabase.storage
                    .from('workspace-logos')
                    .upload(`workspaceLogo.${workspaceUUID}`, file, {
                        cacheControl: '3600',
                        upsert: true,
                    });
                // If an error occurs during upload, throw an error
                if (error) throw new Error('');
                // If the upload is successful, store the file path
                filePath = data.path;
            } catch (error) {
                console.log('Error', error);
                // Display a toast notification to the user indicating the upload failed
                toast({
                    variant: 'destructive',
                    title: 'Error! Could not upload your workspace logo',
                });
            }
        }
        // Attempt to create a new workspace with the provided form values
        try {
            const newWorkspace: workspace = {
                data: null, // This field is for additional data related to the workspace
                createdAt: new Date().toISOString(), // This field stores the creation date of the workspace
                iconId: selectedEmoji, // This field stores the selected emoji for the workspace
                id: workspaceUUID, // This field stores the unique identifier for the workspace
                inTrash: '', // This field indicates whether the workspace is in the trash or not
                title: value.workspaceName, // This field stores the name of the workspace
                workspaceOwner: user.id, // This field stores the id of the user who owns the workspace
                logo: filePath || null, // This field stores the path to the logo of the workspace
                bannerUrl: '', // This field stores the URL of the banner image for the workspace
            };
            const { data, error: createError } = await createWorkspace(newWorkspace);
            // If an error occurs during workspace creation, throw an error
            if (createError) {
                throw new Error();
            }

            // Display a toast notification to the user indicating the workspace was created successfully
            toast({
                title: 'Workspace Created',
                description: `${newWorkspace.title} has been created successfully.`,
            });

            // Redirect the user to the new workspace
            router.replace(`/dashboard/${newWorkspace.id}`);
        } catch (error) {
            console.log(error, 'Error');
            // Display a toast notification to the user indicating the workspace creation failed
            toast({
                variant: 'destructive',
                title: 'Could not create your workspace',
                description:
                    "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
            });
        } finally {
            // Reset the form values
            reset();
        }
    };

    return (
        <Card className="w-[800px] h-screen sm:h-auto">
            <CardHeader>
                <CardTitle>Create A Workspace</CardTitle>
                <CardDescription>
                    Lets create a private workspace to get you started.You can add
                    collaborators later from the workspace settings tab.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">
                                <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                                    {selectedEmoji}
                                </EmojiPicker>
                            </div>
                            <div className="w-full ">
                                <Label htmlFor="workspaceName" className="text-sm text-muted-foreground">
                                    Name
                                </Label>
                                <Input
                                    id="workspaceName"
                                    type="text"
                                    placeholder="Workspace Name"
                                    disabled={isLoading}
                                    {...register('workspaceName', {
                                        required: 'Workspace name is required',
                                    })}
                                />
                                <small className="text-red-600">
                                    {errors?.workspaceName?.message?.toString()}
                                </small>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="logo" className="text-sm text-muted-foreground">
                                Workspace Logo
                            </Label>
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                placeholder="Workspace Name"
                                disabled={isLoading || subscription?.status !== 'active'}
                                {...register('logo', {
                                    required: false,
                                })}
                            />
                            <small className="text-red-600">
                                {errors?.logo?.message?.toString()}
                            </small>
                            {subscription?.status !== 'active' && (
                                <small className="text-muted-foreground block">
                                    To customize your workspace, you need to be on a Pro Plan
                                </small>
                            )}
                        </div>
                        <div className="self-end">
                            <Button
                                disabled={isLoading}
                                type="submit"
                            >
                                {!isLoading ? 'Create Workspace' : <Loader />}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default DashboardSetup;
