"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Tabs({ className, style, ...props }) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        ...style,
      }}
      className={className}
      {...props}
    />
  );
}

export function TabsList({ className, style, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      style={{
        backgroundColor: 'var(--muted)',
        color: 'var(--muted-foreground)',
        display: 'inline-flex',
        height: '2.25rem',
        width: 'fit-content',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 'calc(var(--radius) + 0.25rem)',
        padding: '3px',
        ...style,
      }}
      className={className}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  style,
  children,
  value,
  disabled,
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      style={{
        display: 'inline-flex',
        height: 'calc(100% - 1px)',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.375rem',
        borderRadius: 'calc(var(--radius) + 0.25rem)',
        border: '1px solid transparent',
        padding: '0.25rem 0.5rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        transition: 'color 0.15s, box-shadow 0.15s',
        outline: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
        color: 'var(--foreground)',
        ...style,
      }}
      className={className}
      value={value}
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
              flexShrink: 0,
              width: '1rem',
              height: '1rem',
              ...child.props.style,
            },
          });
        }

        return child;
      })}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, style, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      style={{
        flex: 1,
        outline: 'none',
        ...style,
      }}
      className={className}
      {...props}
    />
  );
}

// Default export for convenience
export default { Tabs, TabsList, TabsTrigger, TabsContent };