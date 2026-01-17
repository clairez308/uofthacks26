"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Mock buttonVariants from button.jsx
const buttonVariants = () => ({
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
});

export function Calendar({
    className,
    classNames = {},
    showOutsideDays = true,
    style,
    ...props
}) {
    const defaultClassNames = {
        months: {
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
        },
        month: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
        },
        caption: {
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '0.25rem',
            position: 'relative',
            alignItems: 'center',
            width: '100%',
        },
        caption_label: {
            fontSize: '0.875rem',
            fontWeight: 500,
        },
        nav: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
        },
        nav_button: {
            ...buttonVariants(),
            variant: 'outline',
            width: '1.75rem',
            height: '1.75rem',
            backgroundColor: 'transparent',
            padding: 0,
            opacity: 0.5,
        },
        nav_button_previous: {
            position: 'absolute',
            left: '0.25rem',
        },
        nav_button_next: {
            position: 'absolute',
            right: '0.25rem',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        head_row: {
            display: 'flex',
        },
        head_cell: {
            color: 'var(--muted-foreground)',
            borderRadius: 'calc(var(--radius) - 4px)',
            width: '2rem',
            fontWeight: 400,
            fontSize: '0.8rem',
        },
        row: {
            display: 'flex',
            width: '100%',
            marginTop: '0.5rem',
        },
        cell: {
            position: 'relative',
            padding: 0,
            textAlign: 'center',
            fontSize: '0.875rem',
        },
        day: {
            ...buttonVariants(),
            variant: 'ghost',
            width: '2rem',
            height: '2rem',
            padding: 0,
            fontWeight: 400,
        },
        day_selected: {
            backgroundColor: 'var(--primary)',
            color: 'var(--primary-foreground)',
        },
        day_today: {
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-foreground)',
        },
        day_outside: {
            color: 'var(--muted-foreground)',
        },
        day_disabled: {
            color: 'var(--muted-foreground)',
            opacity: 0.5,
        },
        day_hidden: {
            visibility: 'hidden',
        },
    };

    // Merge custom classNames with defaults
    const mergedClassNames = { ...defaultClassNames, ...classNames };

    const components = {
        IconLeft: ({ className, style: iconStyle, ...iconProps }) => (
            <ChevronLeft
                style={{
                    width: '1rem',
                    height: '1rem',
                    ...iconStyle,
                }}
                className={className}
                {...iconProps}
            />
        ),
        IconRight: ({ className, style: iconStyle, ...iconProps }) => (
            <ChevronRight
                style={{
                    width: '1rem',
                    height: '1rem',
                    ...iconStyle,
                }}
                className={className}
                {...iconProps}
            />
        ),
    };

    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            style={{
                padding: '0.75rem',
                ...style,
            }}
            className={className}
            classNames={mergedClassNames}
            components={components}
            {...props}
        />
    );
}

// Default export for convenience
export default { Calendar };