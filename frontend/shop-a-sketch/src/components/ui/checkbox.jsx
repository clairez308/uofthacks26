"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Checkbox({
    className,
    style,
    checked,
    onCheckedChange,
    disabled,
    ...props
}) {
    return (
        <CheckboxPrimitive.Root
            data-slot="checkbox"
            style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--input-background)',
                width: '1rem',
                height: '1rem',
                flexShrink: 0,
                borderRadius: '4px',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                outline: 'none',
                transition: 'box-shadow 0.15s',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                ...(checked ? {
                    backgroundColor: 'var(--primary)',
                    borderColor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                } : {}),
                ...style,
            }}
            className={className}
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            {...props}
        >
            <CheckboxPrimitive.Indicator
                data-slot="checkbox-indicator"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'currentColor',
                }}
            >
                <CheckIcon style={{ width: '0.875rem', height: '0.875rem' }} />
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
}

// Default export for convenience
export default { Checkbox };