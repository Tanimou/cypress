

/**
 * Renders a dropdown menu for selecting a workspace. The `WorkspaceDropdown` component
 * is responsible for displaying the available private, shared, and collaborating workspaces,
 * allowing the user to select a workspace, and creating new workspaces.
 *
 * This component is related to other components such as `SelectedWorkspace`, `CustomDialogTrigger`,
 * and `WorkspaceCreator`. It relies on the `useAppState` hook from the `state-provider` module
 * to manage the application state.
 *
 * The `WorkspaceDropdown` component follows these steps:
 * 1. Receives the private, shared, and collaborating workspaces as props.
 * 2. Initializes the selected option state with the default value.
 * 3. Manages the open/closed state of the dropdown menu.
 * 4. Uses the `useEffect` hook to set the workspaces in the application state if they are not already set.
 * 5. Handles the selection of a workspace by updating the selected option state and closing the dropdown menu.
 * 6. Uses another `useEffect` hook to find the selected workspace in the application state based on the default value.
 * 7. Renders the dropdown menu with the selected workspace, private workspaces, shared workspaces,
 *    collaborating workspaces, and the option to create a new workspace.
 *
 * The purpose of the `WorkspaceDropdown` component is to provide a user-friendly interface for selecting
 * and managing workspaces in the application. It allows users to switch between different workspaces,
 * create new workspaces, and view the details of each workspace.
 */
'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { workspace } from '@/lib/supabase/supabase.types';
import React, { useEffect, useState } from 'react';
import SelectedWorkspace from './SelectedWorkspace';
import CustomDialogTrigger from '../global/CustomDialogTrigger';
import WorkspaceCreator from '../global/WorkspaceCreator';

interface WorkspaceDropdownProps {
    privateWorkspaces: workspace[] | [];
    sharedWorkspaces: workspace[] | [];
    collaboratingWorkspaces: workspace[] | [];
    defaultValue: workspace | undefined;
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
    privateWorkspaces,
    collaboratingWorkspaces,
    sharedWorkspaces,
    defaultValue,
}) => {
    const { dispatch, state } = useAppState();
    const [selectedOption, setSelectedOption] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!state.workspaces.length) {
            dispatch({
                type: 'SET_WORKSPACES',
                payload: {
                    workspaces: [
                        ...privateWorkspaces,
                        ...sharedWorkspaces,
                        ...collaboratingWorkspaces,
                    ].map((workspace) => ({ ...workspace, folders: [] })),
                },
            });
        }
    }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces, state.workspaces.length, dispatch]);

    const handleSelect = (option: workspace) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const findSelectedWorkspace = state.workspaces.find(
            (workspace) => workspace.id === defaultValue?.id
        );
        if (findSelectedWorkspace) setSelectedOption(findSelectedWorkspace);
    }, [state, defaultValue]);

    return (
        <div className=" relative inline-block text-left">
            <div>
                <span onClick={() => setIsOpen(!isOpen)}>
                    {selectedOption ? (
                        <SelectedWorkspace workspace={selectedOption} />
                    ) : (
                        'Select a workspace'
                    )}
                </span>
            </div>
            {isOpen && (
                <div className="origin-top-right absolute w-full rounded-md shadow-md z-50 h-[190px] bg-black/10 backdrop-blur-lg group overflow-scroll border-[1px] border-muted">
                    <div className="rounded-md flex flex-col">
                        <div className="!p-2">
                            {!!privateWorkspaces.length && (
                                <>
                                    <p className="text-muted-foreground">Private</p>
                                    <hr></hr>
                                    {privateWorkspaces.map((option) => (
                                        <SelectedWorkspace
                                            key={option.id}
                                            workspace={option}
                                            onClick={handleSelect}
                                        />
                                    ))}
                                </>
                            )}
                            {!!sharedWorkspaces.length && (
                                <>
                                    <p className="text-muted-foreground">Shared</p>
                                    <hr />
                                    {sharedWorkspaces.map((option) => (
                                        <SelectedWorkspace
                                            key={option.id}
                                            workspace={option}
                                            onClick={handleSelect}
                                        />
                                    ))}
                                </>
                            )}
                            {!!collaboratingWorkspaces.length && (
                                <>
                                    <p className="text-muted-foreground">Collaborating</p>
                                    <hr />
                                    {collaboratingWorkspaces.map((option) => (
                                        <SelectedWorkspace
                                            key={option.id}
                                            workspace={option}
                                            onClick={handleSelect}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                        <CustomDialogTrigger
                            header="Create A Workspace"
                            content={<WorkspaceCreator />}
                            description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
                        >
                            <div className="flex transition-all hover:bg-muted justify-center items-center gap-2 p-2 w-full">
                                <article className="text-slate-500 rounded-full bg-slate-800 w-4 h-4 flex items-center justify-center">
                                    +
                                </article>
                                Create workspace
                            </div>
                        </CustomDialogTrigger>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceDropdown;
