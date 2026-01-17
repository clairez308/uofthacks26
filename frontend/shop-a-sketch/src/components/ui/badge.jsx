import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

// Mock cn utility for JSX context
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Convert cva variants to a plain object for JSX
const badgeStyles = {
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'calc(var(--radius) - 4px)',
        border: '1px solid transparent',
        padding: '0.125rem 0.5rem',
        fontSize: '0.75rem',
        lineHeight: '1rem',
        fontWeight: 500,
        width: 'fit-content',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        gap: '0.25rem',
        overflow: 'hidden',
        transition: 'color 0.15s, box-shadow 0.15s',
    },
    variants: {
        default: {
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
        },
        secondary: {
            backgroundColor: 'var(--secondary)',
            color: 'var(--secondary-foreground)',
        },
        destructive: {
            backgroundColor: 'var(--destructive)',
            color: 'white',
        },
        outline: {
            color: 'var(--foreground)',
            borderColor: 'var(--border)',
        },
    },
};

function Badge({
    className,
    variant = "default",
    asChild = false,
    style,
    ...props
}) {
    const Comp = asChild ? Slot : "span";

    const baseStyles = {
        ...badgeStyles.base,
        ...badgeStyles.variants[variant],
    };

    // Handle hover states for links
    const hoverStyles = variant === 'outline' ? {
        '&:hover': {
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
        }
    } : variant === 'default' ? {
        '&:hover': {
            backgroundColor: 'color-mix(in srgb, var(--primary) 90%, transparent)',
        }
    } : variant === 'secondary' ? {
        '&:hover': {
            backgroundColor: 'color-mix(in srgb, var(--secondary) 90%, transparent)',
        }
    } : variant === 'destructive' ? {
        '&:hover': {
            backgroundColor: 'color-mix(in srgb, var(--destructive) 90%, transparent)',
        }
    } : {};

    return (
        <Comp
            data-slot="badge"
            style={{
                ...baseStyles,
                ...style,
                ...(asChild ? {} : hoverStyles), // Only apply hover styles if not using Slot
            }}
            className={className}
            {...props}
        />
    );
}

export { Badge };
export const badgeVariants = badgeStyles; // Export for compatibility