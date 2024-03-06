'use server'
import { Subscription, workspace } from "./supabase.types";
import db from "./db";
import { workspaces } from "@/migrations/schema";

/**
 * Retrieves the subscription status of a user.
 * @param userId - The ID of the user.
 * @returns An object containing the subscription data and any potential error.
 */
export const getUserSubscriptionStatus = async (userId: string) => {
    try {
        // Query the database to find the first subscription that matches the given userId
        const data = await db.query.subscriptions.findFirst({
            where: (s, { eq }) => eq(s.userId, userId),
        });
        // If a subscription is found, return it as subscription data along with no error
        if (data) return { data: data as Subscription, error: null };
        // If no subscription is found, return null as data along with no error
        else return { data: null, error: null };
    } catch (error) {
        // If an error occurs during the database query, return null as data along with the error message
        return { data: null, error: `Error ${error}` };
    }
}

export const createWorkspace = async (workspace: workspace) => {
    try {
        const response = await db.insert(workspaces).values(workspace);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};