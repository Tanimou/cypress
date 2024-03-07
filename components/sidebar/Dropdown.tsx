/**
 * The Dropdown component is a reusable UI component that displays a list of items in a collapsible format.
 * It is used across various pages in the application where such functionality is required, such as in the sidebar for navigation.
 * 
 * Here's a step-by-step explanation of how it works:
 * 
 * 1. The component receives several props, including the title, id, listType, iconId, children, and a disabled state.
 * 2. It uses the Supabase client to interact with the backend and the useToast hook for displaying notifications.
 * 3. It also uses the useAppState hook to access the global state of the application.
 * 4. It maintains a local state called isEditing to control the editing state of the dropdown.
 * 5. Depending on the listType prop, it either fetches the folder title or the file title from the global state.
 * 6. The useMemo hook is used to optimize this operation, as it can be computationally expensive.
 * 7. The component renders an AccordionItem, which includes an AccordionTrigger and an AccordionContent.
 * 8. The AccordionTrigger controls the visibility of the AccordionContent.
 * 9. The AccordionContent contains the list of items, which can be either files or folders, depending on the listType prop.
 * 
 * The purpose of this component is to provide a consistent and efficient way to display a list of items that can be collapsed or expanded.
 * It also allows the user to navigate through different sections of the application (if used in a sidebar for example), or to organize content in a compact manner.
 */

'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import {
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../ui/accordion';
import clsx from 'clsx';
import EmojiPicker from '../global/EmojiPicker';
import { createFile, updateFile, updateFolder } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';
import TooltipComponent from '../global/TooltipComponent';
import { PlusIcon, Trash } from 'lucide-react';
import { File } from '@/lib/supabase/supabase.types';
import { v4 } from 'uuid';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';

/**
 * Props for the Dropdown component.
 */
interface DropdownProps {
    /**
     * The title of the dropdown.
     */
    title: string;
    
    /**
     * The ID of the dropdown.
     */
    id: string;
    
    /**
     * The type of the list in the dropdown.
     * It can be either 'folder' or 'file'.
     */
    listType: 'folder' | 'file';
    
    /**
     * The ID of the icon associated with the dropdown.
     */
    iconId: string;
    
    /**
     * The children components of the dropdown.
     */
    children?: React.ReactNode;
    
    /**
     * Specifies whether the dropdown is disabled or not.
     */
    disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
    title,
    id,
    listType,
    iconId,
    children,
    disabled,
    ...props
}) => {
    const supabase = createClientComponentClient();
    const { toast } = useToast();
    const { user } = useSupabaseUser();
    const { state, dispatch, workspaceId, folderId } = useAppState();
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    
    /**
     * Retrieves the folder title based on the provided parameters.
     * If the list type is 'folder', it checks if the folder title in the state matches the provided title.
     * If it does, it returns the provided title. Otherwise, it returns the folder title from the state.
     * @param state - The state object containing the workspaces and folders.
     * @param listType - The type of the list.
     * @param workspaceId - The ID of the workspace.
     * @param id - The ID of the folder.
     * @param title - The provided title.
     * @returns The folder title.
     */
    const folderTitle: string | undefined = useMemo(() => {
        if (listType === 'folder') {
            // Find the workspace in the state that matches the provided workspaceId
            const stateWorkspace = state.workspaces.find((workspace) => workspace.id === workspaceId)
            
            // Find the folder in the state that matches the provided id
            const stateFolderTitle = stateWorkspace?.folders.find((folder) => folder.id === id)?.title;
            
            // If the title matches the stateTitle or stateTitle is undefined, return the provided title
            if (title === stateFolderTitle || !stateFolderTitle) return title;
            
            // Otherwise, return the folder title from the state
            return stateFolderTitle;
        }
    }, [state, listType, workspaceId, id, title]);



    /**
     * Retrieves the file title based on the provided parameters.
     * If the list type is 'file', it searches for the corresponding file title in the state.
     * If the file title is found in the state, it returns the state title.
     * If the file title is not found in the state or the provided title is the same as the state title, it returns the provided title.
     * @param state - The state object containing the workspaces, folders, and files.
     * @param listType - The type of the list (e.g., 'file', 'folder').
     * @param workspaceId - The ID of the workspace.
     * @param id - The ID of the file or folder.
     * @param title - The title of the file or folder.
     * @returns The file title.
     * 
     * We use the useMemo() hook here to optimize performance by memoizing the file title and only re-computing it when necessary. 
     * This is particularly useful when dealing with large state objects or expensive computations.
     */
    const fileTitle: string | undefined = useMemo(() => {
        if (listType === 'file') {
            // Split the ID into file and folder IDs
            const fileAndFolderId = id.split('folder');

            // Find the workspace with the matching ID
            const stateWorkspace = state.workspaces.find((workspace) => workspace.id === workspaceId);

            // Find the folder with the matching ID within the workspace
            const stateFolder = stateWorkspace?.folders.find((folder) => folder.id === fileAndFolderId[0]);

            // Find the file with the matching ID within the folder and get the title of the file
            const stateFileTitle = stateFolder?.files.find((file) => file.id === fileAndFolderId[1])?.title;

            // If the provided title is the same as the state file title or the state file title is not found, return the provided title
            if (title === stateFileTitle || !stateFileTitle) {
                return title;
            }

            // Return the state file title
            return stateFileTitle;
        }
    }, [state, listType, workspaceId, id, title]);
    

    
    /**
     * Navigates to a specific page based on the accordionId and type.
     * If the type is 'folder', it navigates to the folder page.
     * If the type is 'file', it navigates to the file page.
     * @param accordionId - The ID of the accordion.
     * @param type - The type of the accordion ('folder' or 'file').
     */
    const navigatatePage = (accordionId: string, type: string) => {
        if (type === 'folder') {
            // Navigates to the folder page in the dashboard.
            router.push(`/dashboard/${workspaceId}/${accordionId}`);
        }
        if (type === 'file') {
            // Extracts the folderId from the accordionId and navigates to the file page in the dashboard.
            const fileId = accordionId.split('folder')[1];
            router.push(`/dashboard/${workspaceId}/${folderId}/${fileId}`);
        }
    };

    //double click handler
    const handleDoubleClick = () => {
        setIsEditing(true);
    };
    //blur

    /**
     * Handles the blur event for the dropdown component.
     * If the component is in editing mode, it updates the folder or file title and displays a toast notification.
     */
    const handleBlur = async () => {
        // If not in editing mode, return early
        if (!isEditing) return;

        // Exit editing mode
        setIsEditing(false);

        // Split the id to check if it represents a folder or a file
        const fId = id.split('folder');

        // If the id represents a folder
        if (fId?.length === 1) {
            // If folder title is not provided, return early
            if (!folderTitle) return;

            // Update the folder title
            const { data, error } = await updateFolder({ title }, fId[0]);

            // If there is an error, display an error toast notification
            if (error) {
                toast({
                    title: 'Error',
                    variant: 'destructive',
                    description: 'Could not update the title for this folder',
                });
            } else {
                // Display a success toast notification
                toast({
                    title: 'Success',
                    description: 'Folder title changed.',
                });
            }

        }

        // If the id represents a file
        if (fId.length === 2 && fId[1]) {
            // If file title is not provided, return early
            if (!fileTitle) return;

            // Update the file title
            const { data, error } = await updateFile({ title: fileTitle }, fId[1]);

            // If there is an error, display an error toast notification
            if (error) {
                toast({
                    title: 'Error',
                    variant: 'destructive',
                    description: 'Could not update the title for this file',
                });
            } else {
                // Display a success toast notification
                toast({
                    title: 'Success',
                    description: 'File title changed.',
                });
            }
        }
    };

    //onchanges
    /**
     * Handles the change of emoji for a folder in the sidebar dropdown.
     * 
     * @param selectedEmoji - The selected emoji to update the folder with.
     * @returns void
     */
    const onChangeEmoji = async (selectedEmoji: string): Promise<void> => {
        // Check if workspaceId is available
        if (!workspaceId) return;

        // Check if the listType is 'folder'
        if (listType === 'folder') {
            // Dispatch an action to update the folder's iconId in the state
            dispatch({
                type: 'UPDATE_FOLDER',
                payload: {
                    workspaceId,
                    folderId: id,
                    folder: { iconId: selectedEmoji },
                },
            });

            // Call the updateFolder API to update the folder's iconId in the database
            const { data, error } = await updateFolder({ iconId: selectedEmoji }, id);

            // Display a toast message based on the API response
            if (error) {
                toast({
                    title: 'Error',
                    variant: 'destructive',
                    description: 'Could not update the emoji for this folder',
                });
            } else {
                toast({
                    title: 'Success',
                    description: 'Updated emoji for the folder',
                });
            }
        }
    };

    /**
     * Handles the change event for the folder title input.
     * Updates the folder title in the Redux store.
     * 
     * @param {Event} e - The change event object.
     */
    const folderTitleChange = (e: any) => {
        // Check if workspaceId is not available
        if (!workspaceId) return;

        // Split the id to get the folder id
        const fid = id.split('folder');

        // Check if the folder id is valid
        if (fid.length === 1) {
            // Dispatch an action to update the folder title in the Redux store
            dispatch({
                type: 'UPDATE_FOLDER',
                payload: {
                    folder: { title: e.target.value },
                    folderId: fid[0],
                    workspaceId,
                },
            });
        }
    };
    
    /**
     * Handles the change event for the file title input.
     * Updates the file title in the Redux store.
     *
     * @param {Event} e - The change event object.
     */
    const fileTitleChange = (e: any) => {
        // Check if workspaceId or folderId is missing
        if (!workspaceId || !folderId) return;

        // Split the id to extract the fileId
        const fid = id.split('folder');

        // Check if the id is in the correct format
        if (fid.length === 2 && fid[1]) {
            // Dispatch an action to update the file title in the Redux store
            dispatch({
                type: 'UPDATE_FILE',
                payload: {
                    file: { title: e.target.value },
                    folderId,
                    workspaceId,
                    fileId: fid[1],
                },
            });
        }
    };


    /**
     * Moves a folder or file to the trash.
     * @remarks
     * This function updates the folder or file with the specified ID to indicate that it has been moved to the trash.
     * If the listType is 'folder', it dispatches an action to update the folder in the Redux store and makes an API call to update the folder in the database.
     * If the listType is 'file', it dispatches an action to update the file in the Redux store and makes an API call to update the file in the database.
     * If the update is successful, a success toast notification is displayed. Otherwise, an error toast notification is displayed.
     */
    const moveToTrash = async () => {
        if (!user?.email || !workspaceId) return;
        const pathId = id.split('folder');
        
        // Check if the listType is 'folder'
        if (listType === 'folder') {
            // Dispatch an action to update the folder in the Redux store
            dispatch({
            type: 'UPDATE_FOLDER',
            payload: {
                // Set the inTrash property of the folder to indicate who deleted it
                folder: { inTrash: `Deleted by ${user?.email}` },
                // The ID of the folder
                folderId: pathId[0],
                // The ID of the workspace
                workspaceId,
            },
            });
            // Make an API call to update the folder in the database
            const { data, error } = await updateFolder(
            // Set the inTrash property of the folder to indicate who deleted it
            { inTrash: `Deleted by ${user?.email}` },
            // The ID of the folder
            pathId[0]
            );
            // If there is an error with the API call
            if (error) {
            // Display a toast notification indicating that the folder could not be moved to the trash
            toast({
                title: 'Error',
                variant: 'destructive',
                description: 'Could not move the folder to trash',
            });
            } else {
            // If the API call is successful, display a toast notification indicating that the folder has been moved to the trash
            toast({
                title: 'Success',
                description: 'Moved folder to trash',
            });
            }
        }

        // Check if the listType is 'file'
        if (listType === 'file') {
            // Dispatch an action to update the file in the Redux store
            dispatch({
            type: 'UPDATE_FILE',
            payload: {
                // Set the inTrash property of the file to indicate who deleted it
                file: { inTrash: `Deleted by ${user?.email}` },
                // The ID of the folder that contains the file
                folderId: pathId[0],
                // The ID of the workspace
                workspaceId,
                // The ID of the file
                fileId: pathId[1],
            },
            });
            // Make an API call to update the file in the database
            const { data, error } = await updateFile(
            // Set the inTrash property of the file to indicate who deleted it
            { inTrash: `Deleted by ${user?.email}` },
            // The ID of the file
            pathId[1]
            );
            // If there is an error with the API call
            if (error) {
            // Display a toast notification indicating that the file could not be moved to the trash
            toast({
                title: 'Error',
                variant: 'destructive',
                description: 'Could not move the folder to trash',
            });
            } else {
            // If the API call is successful, display a toast notification indicating that the file has been moved to the trash
            toast({
                title: 'Success',
                description: 'Moved folder to trash',
            });
            }
        }
    };

    const isFolder = listType === 'folder';
    const groupIdentifies = clsx(
        'dark:text-white whitespace-nowrap flex justify-between items-center w-full relative',
        {
            'group/folder': isFolder,
            'group/file': !isFolder,
        }
    );

    const listStyles = useMemo(
        () =>
            clsx('relative', {
                'border-none text-md': isFolder,
                'border-none ml-6 text-[16px] py-1': !isFolder,
            }),
        [isFolder]
    );

    const hoverStyles = useMemo(
        () =>
            clsx(
                'h-full hidden rounded-sm absolute right-0 items-center justify-center',
                {
                    'group-hover/file:block': listType === 'file',
                    'group-hover/folder:block': listType === 'folder',
                }
            ),
        [listType]
    );

    /**
     * Adds a new file to the sidebar dropdown.
     * This function creates a new file object, dispatches an action to add the file to the state,
     * and makes an API call to create the file on the server.
     * If the API call is successful, a success toast is displayed. Otherwise, an error toast is displayed.
     */
    const addNewFile = async () => {
        // Check if workspaceId is available
        if (!workspaceId) return;

        // Create a new file object
        const newFile: File = {
            folderId: id,
            data: null,
            createdAt: new Date().toISOString(),
            inTrash: null,
            title: 'Untitled',
            iconId: '📄',
            id: v4(),
            workspaceId,
            bannerUrl: '',
        };

        // Dispatch an action to add the file to the state
        dispatch({
            type: 'ADD_FILE',
            payload: { file: newFile, folderId: id, workspaceId },
        });

        // Make an API call to create the file on the server
        const { data, error } = await createFile(newFile);

        // Check if there was an error during the API call
        if (error) {
            // Display an error toast
            toast({
                title: 'Error',
                variant: 'destructive',
                description: 'Could not create a file',
            });
        } else {
            // Display a success toast
            toast({
                title: 'Success',
                description: 'File created.',
            });
        }
    };

    return (
        <AccordionItem
            value={id}
            className={listStyles}
            onClick={(e) => {
                e.stopPropagation();
                navigatatePage(id, listType);
            }}
        >
            <AccordionTrigger
                id={listType}
                className="hover:no-underline p-2 dark:text-muted-foreground text-sm"
                disabled={listType === 'file'}
            >
                <div className={groupIdentifies}>
                    <div className="flex gap-4 items-center justify-center overflow-hidden">
                        <div className="relative">
                            <EmojiPicker getValue={onChangeEmoji}>{iconId}</EmojiPicker>
                        </div>
                        <input
                            type="text"
                            value={listType === 'folder' ? folderTitle : fileTitle}
                            className={clsx('outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7',{'bg-muted cursor-text': isEditing,'bg-transparent cursor-pointer': !isEditing,})}
                            readOnly={!isEditing}
                            onDoubleClick={handleDoubleClick}
                            onBlur={handleBlur}
                            onChange={listType === 'folder' ? folderTitleChange : fileTitleChange}
                        />
                    </div>
                    <div className={hoverStyles}>
                        <TooltipComponent message="Delete Folder">
                            <Trash
                                onClick={moveToTrash}
                                size={15}
                                className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
                            />
                        </TooltipComponent>
                        {listType === 'folder' && !isEditing && (
                            <TooltipComponent message="Add File">
                                <PlusIcon
                                    onClick={addNewFile}
                                    size={15}
                                    className="hover:dark:text-white dark:text-Neutrals/neutrals-7 transition-colors"
                                />
                            </TooltipComponent>
                        )}
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {state.workspaces
                    .find((workspace) => workspace.id === workspaceId)
                    ?.folders.find((folder) => folder.id === id)
                    ?.files.filter((file) => !file.inTrash)
                    .map((file) => {
                        const customFileId = `${id}folder${file.id}`;
                        return (
                            <Dropdown
                                key={file.id}
                                title={file.title}
                                listType="file"
                                id={customFileId}
                                iconId={file.iconId}
                            />
                        );
                    })}
            </AccordionContent>
        </AccordionItem>
    );
};

export default Dropdown;
