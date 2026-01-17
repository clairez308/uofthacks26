"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

// Mock toggleVariants from toggle.jsx
const toggleVariants = (options = {}) => {
  const { variant = "default", size = "default" } = options;

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

  const sizes = {
    default: {
      height: '2.25rem',
      padding: '0 1rem',
    },
    sm: {
      height: '2rem',
      padding: '0 0.75rem',
    },
    lg: {
      height: '2.5rem',
      padding: '0 1.5rem',
    },
  };

  return { ...baseStyles, ...variants[variant], ...sizes[size] };
};

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
});

export function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  children,
  style,
  ...props
}) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: 'fit-content',
        borderRadius: 'calc(var(--radius) - 2px)',
        boxShadow: variant === 'outline' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
        ...style,
      }}
      className={className}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

export function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  style,
  ...props
}) {
  const context = React.useContext(ToggleGroupContext);
  const finalVariant = variant || context.variant || "default";
  const finalSize = size || context.size || "default";

  const itemStyle = {
    ...toggleVariants({ variant: finalVariant, size: finalSize }),
    minWidth: 0,
    flex: 1,
    flexShrink: 0,
    borderRadius: 0,
    boxShadow: 'none',
    ...style,
  };

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={finalVariant}
      data-size={finalSize}
      style={itemStyle}
      className={className}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

// Default export for convenience
export default { ToggleGroup, ToggleGroupItem };