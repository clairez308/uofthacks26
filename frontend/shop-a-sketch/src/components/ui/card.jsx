import * as React from "react";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Card({ className, style, ...props }) {
    return (
        <div
            data-slot="card"
            style={{
                backgroundColor: 'var(--card)',
                color: 'var(--card-foreground)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                borderRadius: 'calc(var(--radius) + 0.25rem)',
                border: '1px solid var(--border)',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function CardHeader({ className, style, children, ...props }) {
    // Check if there's a CardAction child
    const hasCardAction = React.Children.toArray(children).some(
        child => React.isValidElement(child) && child.props?.['data-slot'] === 'card-action'
    );

    return (
        <div
            data-slot="card-header"
            style={{
                display: 'grid',
                gridAutoRows: 'min-content',
                gridTemplateRows: 'auto auto',
                alignItems: 'start',
                gap: '0.375rem',
                padding: '1.5rem 1.5rem 0 1.5rem',
                ...(hasCardAction ? {
                    gridTemplateColumns: '1fr auto',
                } : {}),
                ...style,
            }}
            className={className}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardTitle({ className, style, ...props }) {
    return (
        <h4
            data-slot="card-title"
            style={{
                fontSize: '1rem',
                fontWeight: 500,
                lineHeight: 1.5,
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function CardDescription({ className, style, ...props }) {
    return (
        <p
            data-slot="card-description"
            style={{
                color: 'var(--muted-foreground)',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function CardAction({ className, style, ...props }) {
    return (
        <div
            data-slot="card-action"
            style={{
                gridColumnStart: 2,
                gridRow: 'span 2',
                gridRowStart: 1,
                alignSelf: 'start',
                justifySelf: 'end',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function CardContent({ className, style, ...props }) {
    return (
        <div
            data-slot="card-content"
            style={{
                padding: '0 1.5rem',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function CardFooter({ className, style, ...props }) {
    return (
        <div
            data-slot="card-footer"
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0 1.5rem 1.5rem 1.5rem',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

// Helper function to check border styling
function checkBorderStyling(element) {
    // This is a simplified check - in real implementation you might want
    // to check class names or props for border styling
    if (element.props && element.props.className &&
        element.props.className.includes('border')) {
        return {
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border)',
        };
    }
    return {};
}

// Default export for convenience
export default {
    Card,
    CardHeader,
    CardFooter,
    CardTitle,
    CardAction,
    CardDescription,
    CardContent,
};