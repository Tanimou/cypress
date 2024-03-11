

/**
 * The `CollaboratorSearch` component is responsible for rendering a sheet that allows users to search for and add collaborators.
 * 
 * Summary:
 * - The CollaboratorSearch page provides a user interface for searching and adding collaborators to a project.
 * - It is related to other pages/components in the application that involve collaboration and user management.
 * 
 * Steps:
 * 1. The component imports necessary dependencies and custom hooks.
 * 2. It defines the props interface for the CollaboratorSearch component.
 * 3. The component initializes state variables and a timer reference using the useState and useRef hooks.
 * 4. It defines a useEffect cleanup function to clear the timer reference.
 * 5. The component defines a getUserData function (currently empty).
 * 6. It defines an onChangeHandler function to handle input changes and perform a search after a delay.
 * 7. The component defines an addCollaborator function to pass the selected collaborator to the parent component.
 * 8. The component renders a sheet with a trigger element and content.
 * 9. Inside the sheet content, it renders a header with a title and description.
 * 10. The component renders a search input and an input for entering collaborator email.
 * 11. It renders a scrollable area to display search results.
 * 12. The component filters and maps the search results to display each user's information and an "Add" button.
 * 
 * Purpose:
 * - The CollaboratorSearch component allows users to search for and add collaborators to a project.
 * - It enhances collaboration and user management within the application.
 * - By providing a user-friendly interface, it simplifies the process of adding collaborators and improves project collaboration.
 * - The component helps streamline project management and facilitates effective collaboration among team members.
 * 
 * @component CollaboratorSearch
 * @param {User[]} existingCollaborators - An array of existing collaborators.
 * @param {(collaborator: User) => void} getCollaborator - A callback function to receive the selected collaborator.
 * @param {React.ReactNode} children - The trigger element for the CollaboratorSearch sheet.
 * @returns {React.ReactElement} The CollaboratorSearch component.
 */
'use client';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { User } from '@/lib/supabase/supabase.types';
import React, { useEffect, useRef, useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '../ui/label';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { getUsersFromSearch } from '@/lib/supabase/queries';

/**
 * Props for the CollaboratorSearch component.
 */
interface CollaboratorSearchProps {
    /**
     * An array of existing collaborators.
     */
    existingCollaborators: User[] | [];
    
    /**
     * A callback function to get the selected collaborator.
     * @param collaborator - The selected collaborator.
     */
    getCollaborator: (collaborator: User) => void;
    
    /**
     * The children of the CollaboratorSearch component.
     */
    children: React.ReactNode;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
    children,
    existingCollaborators,
    getCollaborator,
}) => {
    // Using the Supabase User hook to get the current authenticated user
    const { user } = useSupabaseUser();
    const [searchResults, setSearchResults] = useState<User[] | []>([]);
    const timerRef = useRef<ReturnType<typeof setTimeout>>();

    // This useEffect hook is used to clear the timeout when the component unmounts.
    // This is to prevent memory leaks and potential errors if the component unmounts before the timeout finishes.
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [timerRef]);

    const getUserData = () => { }

    /**
     * Handles the change event of the input element and performs a search after a delay.
     * @param {React.ChangeEvent<HTMLInputElement>} e - The change event object.
     */
    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Clear the previous timer if it exists
        if (timerRef) clearTimeout(timerRef.current);

        // Set a new timer to perform the search after a delay
        timerRef.current = setTimeout(async () => {
            // Perform the search using the input value by calling the getUsersFromSearch function.
            
            const res = await getUsersFromSearch(e.target.value);
            setSearchResults(res);
        }, 450);
    };

    /**
     * Adds a collaborator.
     * 
     * @param user - The user to be added as a collaborator.
     */
    const addCollaborator = (user: User) => {
        // Explanation: This function calls the `getCollaborator` function to add the specified user as a collaborator.
        getCollaborator(user);
    };

    return (
        <Sheet>
            <SheetTrigger className="w-full">{children}</SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px]">
                <SheetHeader>
                    <SheetTitle>Search Collaborator</SheetTitle>
                    <SheetDescription>
                        <p className="text-sm text-muted-foreground">
                            You can also remove collaborators after adding them from the
                            settings tab.
                        </p>
                    </SheetDescription>
                </SheetHeader>
                <div className="flex justify-center items-center gap-2 mt-2">
                    <Search />
                    <Input
                        name="name"
                        className="dark:bg-background"
                        placeholder="Email"
                        onChange={onChangeHandler}
                    />
                </div>
                <ScrollArea className="mt-6 overflow-y-scroll w-full rounded-md">
                    {searchResults
                        .filter(
                            (result) =>
                                !existingCollaborators.some(
                                    (existing) => existing.id === result.id
                                )
                        )
                        .filter((result) => result.id !== user?.id)
                        .map((user) => (
                            <div key={user.id} className=" p-4 flex justify-between items-center">
                                <div className="flex gap-4 items-center">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src="/avatars/7.png" />
                                        <AvatarFallback>CP</AvatarFallback>
                                    </Avatar>
                                    <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                                        {user.email}
                                    </div>
                                </div>
                                <Button
                                    variant="secondary"
                                    onClick={() => addCollaborator(user)}
                                >
                                    Add
                                </Button>
                            </div>
                        ))}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default CollaboratorSearch;
