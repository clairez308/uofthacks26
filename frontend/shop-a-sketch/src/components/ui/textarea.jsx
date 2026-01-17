import * as React from "react";

// Mock cn utility
const cn = (...classes) => classes.filter(Boolean).join(' ');

export function Textarea({
  className,
  style,
  placeholder,
  disabled,
  value,
  onChange,
  rows = 4,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      style={{
        resize: 'none',
        border: '1px solid var(--border)',
        backgroundColor: 'var(--input-background)',
        color: 'var(--foreground)',
        borderRadius: 'calc(var(--radius) - 2px)',
        padding: '0.5rem 0.75rem',
        fontSize: '1rem',
        lineHeight: 1.5,
        fontFamily: 'inherit',
        transition: 'color 0.15s, box-shadow 0.15s',
        outline: 'none',
        minHeight: '4rem',
        width: '100%',
        boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'text',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
      className={className}
      placeholder={placeholder}
      disabled={disabled}
      value={value}
      onChange={onChange}
      rows={rows}
      {...props}
    />
  );
}

// Default export for convenience
export default { Textarea };