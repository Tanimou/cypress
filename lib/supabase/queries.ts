'use server'
import { File,Folder, Subscription, User, workspace } from "./supabase.types";
import db from "./db";
import { files, folders, users, workspaces } from "@/migrations/schema";
import { validate } from "uuid";
import { eq, notExists,and,ilike } from "drizzle-orm";
import { collaborators } from "./schema";

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

/**
 * Creates a new workspace.
 * @param {workspace} workspace - The workspace object to be created.
 * @returns {Promise<{ data: null, error: null }>} - A promise that resolves to an object with data and error properties.
 */
export const createWorkspace = async (workspace: workspace) => {
    try {
        const response = await db.insert(workspaces).values(workspace);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const getFolders = async (workspaceId: string) => {
    const isValid = validate(workspaceId);
    if (!isValid) return { data: null, error: 'Invalid workspace ID' };
    try {
        const data:Folder[]|[] = await db.select().from(folders).orderBy(folders.createdAt).where(eq(folders.workspaceId, workspaceId));
        
        return { data, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
}

export const getPrivateWorkspaces = async (userId: string) => {
    if (!userId) return []
    const workspaceData = {
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
    }

        return await db.select(workspaceData).from(workspaces).where(
                    and(
                        notExists(
                            db.select()
                                .from(collaborators)
                                .where(eq(collaborators.workspaceId, workspaces.id))
                        ),
                                    eq(workspaces.workspaceOwner, userId)
                            
                    )
                ) as workspace[];
    
}

export const getCollaboratingWorkspaces = async (userId: string) => {
    if (!userId) return [];
    const collaboratedWorkspacesData = {
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
        bannerUrl: workspaces.bannerUrl,
    }
    return (await db
            .select(collaboratedWorkspacesData)
            .from(users)
            .innerJoin(collaborators, eq(users.id, collaborators.userId))
            .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
            .where(eq(users.id, userId))) as workspace[];
};

export const getSharedWorkspaces = async (userId: string) => {
    if (!userId) return [];
    const sharedWorkspacesData = {
        id: workspaces.id,
        createdAt: workspaces.createdAt,
        workspaceOwner: workspaces.workspaceOwner,
        title: workspaces.title,
        iconId: workspaces.iconId,
        data: workspaces.data,
        inTrash: workspaces.inTrash,
        logo: workspaces.logo,
        bannerUrl: workspaces.bannerUrl,
    } 
    return (await db
            .selectDistinct(sharedWorkspacesData)
            .from(workspaces)
            .orderBy(workspaces.createdAt)
            .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
            .where(eq(workspaces.workspaceOwner, userId))) as workspace[];
};


export const getFiles = async (folderId: string) => {
    const isValid = validate(folderId);
    if (!isValid) return { data: null, error: 'Error' };
    try {
        const results = (await db
            .select()
            .from(files)
            .orderBy(files.createdAt)
            .where(eq(files.folderId, folderId))) as File[] | [];
        return { data: results, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const addCollaborators = async (users: User[], workspaceId: string) => {
    const response = users.forEach(async (user: User) => {
        const userExists = await db.query.collaborators.findFirst({
            where: (u, { eq }) =>
                and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
        });
        if (!userExists)
            await db.insert(collaborators).values({ workspaceId, userId: user.id });
    });
};

export const getUsersFromSearch = async (email: string) => {
    if (!email) return [];
    return db
            .select()
            .from(users)
            .where(ilike(users.email, `${email}%`));
};


export const createFolder = async (folder: Folder) => {
    try {
        const results = await db.insert(folders).values(folder);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};


export const createFile = async (file: File) => {
    try {
        await db.insert(files).values(file);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};


export const updateFile = async (file: Partial<File>, fileId: string) => {
    try {
        const response = await db
            .update(files)
            .set(file)
            .where(eq(files.id, fileId));
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};


export const updateFolder = async (folder: Partial<Folder>,folderId: string) => {
    try {
        await db.update(folders).set(folder).where(eq(folders.id, folderId));
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};