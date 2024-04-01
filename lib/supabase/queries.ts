'use server'
import { File,Folder, Subscription, User, workspace } from "./supabase.types";
import db from "./db";
import { files, folders, users, workspaces } from "@/migrations/schema";
import { validate } from "uuid";
import { eq, notExists,and,ilike } from "drizzle-orm";
import { collaborators } from "./schema";
import { revalidatePath } from "next/cache";


/**                                                        ALL GET FUNCTIONS                                               */

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
 * Retrieves the folders associated with a workspace.
 * @param workspaceId - The ID of the workspace.
 * @returns An object containing the retrieved folders or an error message.
 */
export const getFolders = async (workspaceId: string) => {
    // Validate the workspaceId using the validate function from the "uuid" library.
    const isValid = validate(workspaceId);
    // If the workspaceId is not valid, return an error message.
    if (!isValid) return { data: null, error: 'Invalid workspace ID' };
    try {
        // Query the database to get all folders associated with the workspaceId.
        // The folders are ordered by their creation date.
        const data:Folder[]|[] = await db.select().from(folders).orderBy(folders.createdAt).where(eq(folders.workspaceId, workspaceId));
        
        // If the query is successful, return the data and null for the error.
        return { data, error: null };
    } catch (error) {
        // If there's an error in the try block, log the error and return an error message.
        console.log(error);
        return { data: null, error: 'Error' };
    }
}


/**
 * Retrieves private workspaces for a given user.
 * @param userId - The ID of the user.
 * @returns An array of private workspaces.
 */
export const getPrivateWorkspaces = async (userId: string) => {
    // If the userId is not provided, return an empty array
    if (!userId) return []

    // Define the data to be selected from the workspaces table
    const workspaceData = {
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

    // Return the result of the query
    // Select the workspaceData from the workspaces table
    // where there are no collaborators (i.e., the workspace is private)
    // and the workspace owner is the provided userId
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


/**
 * Retrieves the list of collaborating workspaces for a given user.
 * @param userId - The ID of the user.
 * @returns An array of workspace objects.
 */
export const getCollaboratingWorkspaces = async (userId: string) => {
    // If the userId is not provided, return an empty array
    if (!userId) return [];

    // Define the data structure for the collaborated workspaces
    const collaboratedWorkspacesData = {
        id: workspaces.id, // workspace id
        createdAt: workspaces.createdAt, // creation date of the workspace
        workspaceOwner: workspaces.workspaceOwner, // owner of the workspace
        title: workspaces.title, // title of the workspace
        iconId: workspaces.iconId, // icon id of the workspace
        data: workspaces.data, // data of the workspace
        inTrash: workspaces.inTrash, // flag indicating if the workspace is in trash
        logo: workspaces.logo, // logo of the workspace
        bannerUrl: workspaces.bannerUrl, // banner url of the workspace
    }

    // Return the list of collaborated workspaces for the given user
    return (await db
            .select(collaboratedWorkspacesData) // select the collaborated workspaces data
            .from(users) // from the users table
            .innerJoin(collaborators, eq(users.id, collaborators.userId)) // join with the collaborators table on user id
            .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id)) // join with the workspaces table on workspace id
            .where(eq(users.id, userId))) as workspace[]; // where the user id matches the provided user id
};


/**
 * Retrieves the shared workspaces for a given user.
 * @param userId - The ID of the user.
 * @returns An array of shared workspaces.
 */
export const getSharedWorkspaces = async (userId: string) => {
    // If the user ID is not provided, return an empty array
    if (!userId) return [];

    // Define the data structure for the shared workspaces
    const sharedWorkspacesData = {
        id: workspaces.id, // The ID of the workspace
        createdAt: workspaces.createdAt, // The creation date of the workspace
        workspaceOwner: workspaces.workspaceOwner, // The owner of the workspace
        title: workspaces.title, // The title of the workspace
        iconId: workspaces.iconId, // The ID of the icon associated with the workspace
        data: workspaces.data, // The data associated with the workspace
        inTrash: workspaces.inTrash, // Whether the workspace is in the trash or not
        logo: workspaces.logo, // The logo of the workspace
        bannerUrl: workspaces.bannerUrl, // The URL of the banner image for the workspace
    }

    // Return the list of shared workspaces for the given user
    return (await db
            .selectDistinct(sharedWorkspacesData) // Select distinct records with the defined data structure
            .from(workspaces) // From the workspaces table
            .orderBy(workspaces.createdAt) // Order the results by the creation date
            .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId)) // Join with the collaborators table where the workspace IDs match
            .where(eq(workspaces.workspaceOwner, userId))) as workspace[]; // Where the workspace owner matches the provided user ID
};


/**
 * Retrieves files from a specified folder.
 * @param folderId - The ID of the folder to retrieve files from.
 * @returns An object containing the retrieved files and any potential error.
 */
export const getFiles = async (folderId: string) => {
    // Validate the folderId to ensure it's a valid UUID
    const isValid = validate(folderId);
    // If the folderId is not valid, return an error
    if (!isValid) return { data: null, error: 'Error' };
    try {
        // Query the database to get files from the specified folder
        const results = (await db
            .select() // Select all columns
            .from(files) // From the 'files' table
            .orderBy(files.createdAt) // Order the results by the 'createdAt' column
            .where(eq(files.folderId, folderId))) as File[] | []; // Where the 'folderId' column matches the provided folderId
        // Return the results and no error
        return { data: results, error: null };
    } catch (error) {
        // If there's an error, log it and return an error
        console.log(error);
        return { data: null, error: 'Error' };
    }
};


/**
 * Retrieves the details of a workspace.
 * @param workspaceId - The ID of the workspace to retrieve details for.
 * @returns An object containing the workspace details and any error that occurred during retrieval.
 */
export const getWorkspaceDetails = async (workspaceId: string) => {
    // Validate the workspaceId to ensure it's a valid UUID
    const isValid = validate(workspaceId);
    // If the workspaceId is not valid, return an error
    if (!isValid)
        return {
            data: [],
            error: 'Error',
        };

    try {
        // Query the database to retrieve the workspace with the given workspaceId
        const response = (await db
            .select() // Select all columns
            .from(workspaces) // From the workspaces table
            .where(eq(workspaces.id, workspaceId)) // Where the workspace id matches the provided workspaceId
            .limit(1)) as workspace[]; // Limit the result to 1
        // Return the retrieved workspace details and null error
        return { data: response, error: null };
    } catch (error) {
        // Log any error that occurs during the database query
        console.log(error);
        // Return an empty data array and an error message
        return { data: [], error: 'Error' };
    }
};


/**
 * Retrieves the list of collaborators for a given workspace.
 * @param workspaceId The ID of the workspace.
 * @returns A Promise that resolves to an array of User objects representing the collaborators.
 */
export const getCollaborators = async (workspaceId: string) => {
    // Query the database to get all collaborators for the given workspaceId
    const response = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.workspaceId, workspaceId));

    // If there are no collaborators, return an empty array
    if (!response.length) return [];

    // For each collaborator, get the user information from the users table
    const userInformation: Promise<User | undefined>[] = response.map(
        async (user) => {
            // Query the users table to find the first user that matches the userId
            return await db.query.users.findFirst({
                            where: (u, { eq }) => eq(u.id, user.userId),
                        });
        }
    );

    // Wait for all user information promises to resolve
    const resolvedUsers = await Promise.all(userInformation);

    // Filter out any undefined users and cast the result to an array of Users
    return resolvedUsers.filter(Boolean) as User[];
};


/**
 * Retrieves users from the database based on a search query.
 * @param email - The email to search for.
 * @returns A promise that resolves to an array of users matching the search query.
 */
export const getUsersFromSearch = async (email: string) => {
    // If the email is not provided, return an empty array
    if (!email) return [];

    // Use the database instance to perform a select operation
    return db
            // Select all columns from the 'users' table
            .select()
            // Specify the table to select from
            .from(users)
            // Add a WHERE clause to the query. The ilike function is used to perform a case-insensitive search.
            // The '%' at the end of the email means that the search will match any users whose email starts with the provided email.
            .where(ilike(users.email, `${email}%`));
};


export const getFolderDetails = async (folderId: string) => {
    const isValid = validate(folderId);
    if (!isValid) {
        data: [];
        error: 'Error';
    }

    try {
        const response = (await db
            .select()
            .from(folders)
            .where(eq(folders.id, folderId))
            .limit(1)) as Folder[];

        return { data: response, error: null };
    } catch (error) {
        return { data: [], error: 'Error' };
    }
};


export const getFileDetails = async (fileId: string) => {
    const isValid = validate(fileId);
    if (!isValid) {
        data: [];
        error: 'Error';
    }
    try {
        const response = (await db
            .select()
            .from(files)
            .where(eq(files.id, fileId))
            .limit(1)) as File[];
        return { data: response, error: null };
    } catch (error) {
        console.log('🔴Error', error);
        return { data: [], error: 'Error' };
    }
};


export const getActiveProductsWithPrice = async () => {
    try {
        const res = await db.query.products.findMany({
            where: (pro, { eq }) => eq(pro.active, true),

            with: {
                prices: {
                    where: (pri, { eq }) => eq(pri.active, true),
                },
            },
        });
        if (res.length) return { data: res, error: null };
        return { data: [], error: null };
    } catch (error) {
        console.log(error);
        return { data: [], error };
    }
};


/*                                                      ALL CREATE FUNCTIONS                                    */
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



/*                                    ALL UPDATE FUNCTIONS                 */

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


export const updateWorkspace = async (workspace: Partial<workspace>,workspaceId: string) => {
    if (!workspaceId) return;
    try {
        await db
            .update(workspaces)
            .set(workspace)
            .where(eq(workspaces.id, workspaceId));
    
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};



/*                                      ALL DELETE FUNCTIONS               */
export const removeCollaborators = async (users: User[],workspaceId: string) => {
    const response = users.forEach(async (user: User) => {
        const userExists = await db.query.collaborators.findFirst({
            where: (u, { eq }) =>
                and(eq(u.userId, user.id), eq(u.workspaceId, workspaceId)),
        });
        if (userExists)
            await db
                .delete(collaborators)
                .where(
                    and(
                        eq(collaborators.workspaceId, workspaceId),
                        eq(collaborators.userId, user.id)
                    )
                );
    });
};


export const deleteWorkspace = async (workspaceId: string) => {
    if (!workspaceId) return;
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
};


export const deleteFile = async (fileId: string) => {
    if (!fileId) return;
    await db.delete(files).where(eq(files.id, fileId));
};


export const deleteFolder = async (folderId: string) => {
    if (!folderId) return;
    await db.delete(files).where(eq(files.id, folderId));
};



export const findUser = async (userId: string) => {
    return await db.query.users.findFirst({
            where: (u, { eq }) => eq(u.id, userId),
        });
};