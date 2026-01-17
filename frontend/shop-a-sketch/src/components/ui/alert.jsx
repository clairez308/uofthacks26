import * as React from "react";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Convert cva variants to plain object
const alertStyles = {
    base: {
        position: 'relative',
        width: '100%',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        padding: '0.75rem 1rem',
        fontSize: '0.875rem',
        display: 'grid',
        gridTemplateColumns: '0 1fr',
        gap: '0.125rem 0',
        alignItems: 'start',
    },
    variants: {
        default: {
            backgroundColor: 'var(--card)',
            color: 'var(--card-foreground)',
        },
        destructive: {
            color: 'var(--destructive)',
            backgroundColor: 'var(--card)',
        },
    },
};

export function Alert({
    className,
    variant = "default",
    style,
    children,
    ...props
}) {
    const hasIcon = React.Children.toArray(children).some(
        child => React.isValidElement(child) &&
            (child.type === 'svg' || child.props?.children?.type === 'svg')
    );

    const styles = {
        ...alertStyles.base,
        ...alertStyles.variants[variant],
        ...(hasIcon ? {
            gridTemplateColumns: 'calc(var(--spacing, 0.25rem) * 4) 1fr',
            gap: '0 0.75rem',
        } : {}),
        ...style,
    };

    return (
        <div
            data-slot="alert"
            role="alert"
            style={styles}
            className={className}
            {...props}
        >
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;

                // Handle SVG icon styling
                if (child.type === 'svg') {
                    return React.cloneElement(child, {
                        style: {
                            width: '1rem',
                            height: '1rem',
                            transform: 'translateY(0.125rem)',
                            color: 'currentColor',
                            ...child.props.style,
                        },
                    });
                }

                return child;
            })}
        </div>
    );
}

export function AlertTitle({ className, style, ...props }) {
    return (
        <div
            data-slot="alert-title"
            style={{
                gridColumnStart: 2,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                minHeight: '1rem',
                fontWeight: 500,
                letterSpacing: '-0.025em',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

export function AlertDescription({ className, style, ...props }) {
    return (
        <div
            data-slot="alert-description"
            style={{
                color: 'var(--muted-foreground)',
                gridColumnStart: 2,
                display: 'grid',
                justifyContent: 'start',
                gap: '0.25rem',
                fontSize: '0.875rem',
                ...style,
            }}
            className={className}
            {...props}
        />
    );
}

// Default export for convenience
export default { Alert, AlertTitle, AlertDescription };