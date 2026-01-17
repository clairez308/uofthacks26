"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Mock buttonVariants since we don't have the button file yet
const buttonVariants = (options = {}) => {
    const { variant = "default" } = options;
    const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'calc(var(--radius) - 2px)',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.15s',
        outline: 'none',
        border: '1px solid',
        cursor: 'pointer',
        height: '2.5rem',
        padding: '0 1rem',
    };

    const variants = {
        default: {
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
            borderColor: 'var(--primary)',
        },
        outline: {
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
            borderColor: 'var(--border)',
        },
    };

    return { ...baseStyles, ...variants[variant] };
};

export function AlertDialog(props) {
    return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

export function AlertDialogTrigger(props) {
    return (
        <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
    );
}

export function AlertDialogPortal(props) {
    return (
        <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
    );
}

export function AlertDialogOverlay({ className, style, ...props }) {
    return (
        <AlertDialogPrimitive.Overlay
            data-slot="alert-dialog-overlay"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function AlertDialogContent({ className, style, ...props }) {
    return (
        <AlertDialogPortal>
            <AlertDialogOverlay />
            <AlertDialogPrimitive.Content
                data-slot="alert-dialog-content"
                style={{
                    backgroundColor: 'var(--background)',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    zIndex: 50,
                    display: 'grid',
                    width: '100%',
                    maxWidth: 'calc(100% - 2rem)',
                    transform: 'translate(-50%, -50%)',
                    gap: '1rem',
                    borderRadius: 'var(--radius)',
                    border: '1px solid var(--border)',
                    padding: '1.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    ...style,
                }}
                className={className}
                {...props}
            />
        </AlertDialogPortal>
    );
}

export function AlertDialogHeader({ className, style, ...props }) {
    return (
        <div
            data-slot="alert-dialog-header"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                textAlign: 'center',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function AlertDialogFooter({ className, style, ...props }) {
    return (
        <div
            data-slot="alert-dialog-footer"
            style={{
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '0.5rem',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function AlertDialogTitle({ className, style, ...props }) {
    return (
        <AlertDialogPrimitive.Title
            data-slot="alert-dialog-title"
            style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                lineHeight: 1.75,
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function AlertDialogDescription({ className, style, ...props }) {
    return (
        <AlertDialogPrimitive.Description
            data-slot="alert-dialog-description"
            style={{
                color: 'var(--muted-foreground)',
                fontSize: '0.875rem',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function AlertDialogAction({ className, style, ...props }) {
    return (
        <AlertDialogPrimitive.Action
            style={{
                ...buttonVariants(),
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function AlertDialogCancel({ className, style, ...props }) {
    return (
        <AlertDialogPrimitive.Cancel
            style={{
                ...buttonVariants({ variant: "outline" }),
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

// Default export for convenience
export default {
    AlertDialog,
    AlertDialogPortal,
    AlertDialogOverlay,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
};