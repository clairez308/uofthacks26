import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Convert cva variants to plain object
const buttonStyles = {
    base: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        whiteSpace: 'nowrap',
        borderRadius: 'calc(var(--radius) - 2px)',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all 0.15s',
        outline: 'none',
        flexShrink: 0,
        cursor: 'pointer',
        border: 'none',
        fontFamily: 'inherit',
    },
    disabled: {
        pointerEvents: 'none',
        opacity: 0.5,
    },
    variants: {
        default: {
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
        },
        destructive: {
            backgroundColor: 'var(--destructive)',
            color: 'white',
        },
        outline: {
            border: '1px solid var(--border)',
            backgroundColor: 'var(--background)',
            color: 'var(--foreground)',
        },
        secondary: {
            backgroundColor: 'var(--secondary)',
            color: 'var(--secondary-foreground)',
        },
        ghost: {
            backgroundColor: 'transparent',
            color: 'var(--foreground)',
        },
        link: {
            backgroundColor: 'transparent',
            color: 'var(--primary)',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
        },
    },
    sizes: {
        default: {
            height: '2.25rem',
            padding: '0.5rem 1rem',
        },
        sm: {
            height: '2rem',
            padding: '0 0.75rem',
            borderRadius: 'calc(var(--radius) - 4px)',
            gap: '0.375rem',
        },
        lg: {
            height: '2.5rem',
            padding: '0 1.5rem',
            borderRadius: 'calc(var(--radius) - 2px)',
        },
        icon: {
            width: '2.25rem',
            height: '2.25rem',
            borderRadius: 'calc(var(--radius) - 2px)',
        },
    },
    hoverStates: {
        default: {
            backgroundColor: 'color-mix(in srgb, var(--primary) 90%, transparent)',
        },
        destructive: {
            backgroundColor: 'color-mix(in srgb, var(--destructive) 90%, transparent)',
        },
        outline: {
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
        },
        secondary: {
            backgroundColor: 'color-mix(in srgb, var(--secondary) 80%, transparent)',
        },
        ghost: {
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
        },
        link: {
            textDecoration: 'underline',
        },
    },
    focusStyles: {
        borderColor: 'var(--ring)',
        boxShadow: '0 0 0 3px color-mix(in oklch, var(--ring) 50%, transparent)',
    },
    invalidStyles: {
        borderColor: 'var(--destructive)',
        boxShadow: '0 0 0 3px color-mix(in oklch, var(--destructive) 20%, transparent)',
    },
};

export function Button({
    className,
    variant = "default",
    size = "default",
    asChild = false,
    disabled = false,
    style,
    children,
    ...props
}) {
    const Comp = asChild ? Slot : "button";

    // Check if has SVG children to adjust padding
    const hasSvg = React.Children.toArray(children).some(
        child => React.isValidElement(child) && child.type === 'svg'
    );

    const baseStyle = {
        ...buttonStyles.base,
        ...buttonStyles.variants[variant],
        ...buttonStyles.sizes[size],
    };

    // Adjust padding for buttons with icons
    if (hasSvg) {
        if (size === 'default') {
            baseStyle.paddingLeft = '0.75rem';
            baseStyle.paddingRight = '0.75rem';
        } else if (size === 'sm') {
            baseStyle.paddingLeft = '0.625rem';
            baseStyle.paddingRight = '0.625rem';
        } else if (size === 'lg') {
            baseStyle.paddingLeft = '1rem';
            baseStyle.paddingRight = '1rem';
        }
    }

    if (disabled) {
        Object.assign(baseStyle, buttonStyles.disabled);
    }

    // Add hover state via CSS variables or inline styles for non-disabled states
    const hoverStyle = !disabled ? buttonStyles.hoverStates[variant] : {};

    return (
        <Comp
            data-slot="button"
            style={{
                ...baseStyle,
                ...style,
                // Apply hover styles conditionally
                ...(props.onMouseEnter || props.onMouseLeave ? {} : hoverStyle),
            }}
            className={className}
            disabled={disabled}
            {...props}
        >
            {React.Children.map(children, (child) => {
                if (!React.isValidElement(child)) return child;

                // Handle SVG styling
                if (child.type === 'svg') {
                    return React.cloneElement(child, {
                        style: {
                            pointerEvents: 'none',
                            width: '1rem',
                            height: '1rem',
                            flexShrink: 0,
                            ...child.props.style,
                        },
                    });
                }

                return child;
            })}
        </Comp>
    );
}

// Export button styles for other components to use
export const buttonVariants = buttonStyles;

// Default export for convenience
export default { Button, buttonVariants };