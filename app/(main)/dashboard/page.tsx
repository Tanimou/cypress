/**
 * The DashboardPage component is an asynchronous function that serves as the main entry point for the user's dashboard.
 * 
 * Here's a step-by-step breakdown of what it does:
 * 
 * 1. It initializes a Supabase client using the `createServerComponentClient` function, which is designed to work in a server-side environment. This client is used to interact with the Supabase backend.
 * 
 * 2. It then attempts to retrieve the currently authenticated user's data using the `auth.getUser()` method from the Supabase client. If no user is found, the function returns immediately, effectively denying access to the dashboard.
 * 
 * 3. If a user is found, the function then queries the database for the first workspace that matches the user's ID. This is done using the `db.query.workspaces.findFirst()` method. The `eq` function is used to compare the `workspaceOwner` field of each workspace with the user's ID.
 * 
 * 4. The function then retrieves the user's subscription status using the `getUserSubscriptionStatus` function. If an error occurs during this process, the function returns immediately.
 * 
 * 5. If no workspace is found for the user, a `DashboardSetup` component is returned. This component is displayed to the user and allows them to set up their workspace. The user's data and subscription status are passed as props to this component.
 * 
 * 6. If a workspace is found, the function redirects the user to their workspace's dashboard using the `redirect` function from Next.js's navigation utilities. The workspace's ID is appended to the `/dashboard/` route to create a unique URL for each workspace.
 * 
 * This component ensures that only authenticated users with a valid workspace can access their dashboard. It also handles the setup process for new users who do not yet have a workspace.
 */

import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

import { cookies } from 'next/headers';
import db from '@/lib/supabase/db';
import { redirect } from 'next/navigation';
import DashboardSetup from '@/components/dashboard-setup/DashboardSetup';
import { getUserSubscriptionStatus } from '@/lib/supabase/queries';

const DashboardPage = async () => {
    const supabase = createServerComponentClient({ cookies });

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const workspace = await db.query.workspaces.findFirst({
        where: (workspace, { eq }) => eq(workspace.workspaceOwner, user.id),
    });
    console.log(workspace)

    const { data: subscription, error: subscriptionError } =
        await getUserSubscriptionStatus(user.id);

    if (subscriptionError) return;

    if (!workspace)
        return (
            <div className="bg-background h-screen w-screen flex justify-center items-center">
                <DashboardSetup
                    user={user}
                    subscription={subscription}
                />
            </div>
        );

    redirect(`/dashboard/${workspace.id}`);
};

export default DashboardPage;