/**
 * `CustomDialogTrigger` is a reusable component that encapsulates the functionality of a dialog box in the application.
 * It is designed to be used across multiple pages, wherever a dialog box is needed.
 *
 * The component receives several props:
 * - `header`: The title of the dialog box.
 * - `content`: The main content of the dialog box, which can be any React node.
 * - `children`: The elements that will trigger the dialog box when interacted with.
 * - `description`: A brief description that appears under the title in the dialog box.
 * - `className`: Additional CSS classes to apply to the dialog trigger.
 *
 * The component works as follows:
 * 1. It wraps the `children` prop with a `DialogTrigger` component. When the `children` are clicked, the dialog box opens.
 * 2. It uses the `header` and `description` props to populate the `DialogTitle` and `DialogDescription` components respectively, which are displayed at the top of the dialog box.
 * 3. It displays the `content` prop inside the `DialogContent` component, which forms the main body of the dialog box.
 *
 * The purpose of this component is to provide a consistent, reusable way to trigger dialog boxes in the application. By encapsulating the dialog box functionality in a single component, we can ensure a consistent user experience across different parts of the application, and make it easier to maintain and update the code.
 * It is used to display All differents workspaces information in the application.
 */
import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import clsx from 'clsx';

interface CustomDialogTriggerProps {
    header?: string;
    content?: React.ReactNode;
    children: React.ReactNode;
    description?: string;
    className?: string;
}

const CustomDialogTrigger: React.FC<CustomDialogTriggerProps> = ({
    header,
    content,
    children,
    description,
    className,
}) => {
    return (
        <Dialog>
            <DialogTrigger className={clsx('', className)}>{children}</DialogTrigger>
            <DialogContent className="h-screen block sm:h-[440px] overflow-scroll w-full">
                <DialogHeader>
                    <DialogTitle>{header}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {content}
            </DialogContent>
        </Dialog>
    );
};

export default CustomDialogTrigger;