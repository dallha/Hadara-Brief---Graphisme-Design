import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const inputBaseClass = [
  'w-full rounded-xl text-sm transition-all duration-200',
  'bg-[#0d131f]/90 border',
  'text-[#F8F8F8] placeholder-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-[#816C07]/40 focus:border-[#816C07]',
].join(' ');

export const Input = React.forwardRef<HTMLInputElement, InputProps>((
  { label, error, helperText, icon, className = '', id, ...props }, ref
) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-serif font-bold text-[#F5F5DC] tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-[#816C07]/80 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`${inputBaseClass} py-2.5 ${icon ? 'pl-10' : 'px-4'} pr-4 ${
            error ? 'border-[#A6472F]/70 focus:ring-[#A6472F]/30 focus:border-[#A6472F]' : 'border-[#335A79]/40'
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[11px] font-semibold text-[#A6472F] flex items-center gap-1 mt-1">
          <span>⚠</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-[#D4C9BF]/70 mt-1">{helperText}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>((
  { label, error, helperText, className = '', id, ...props }, ref
) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-serif font-bold text-[#F5F5DC] tracking-wide">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        ref={ref}
        className={`${inputBaseClass} p-3.5 resize-none min-h-[90px] ${
          error ? 'border-[#A6472F]/70 focus:ring-[#A6472F]/30 focus:border-[#A6472F]' : 'border-[#335A79]/40'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[11px] font-semibold text-[#A6472F] flex items-center gap-1 mt-1">
          <span>⚠</span> {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-[11px] text-[#D4C9BF]/70 mt-1">{helperText}</p>
      )}
    </div>
  );
});
Textarea.displayName = 'Textarea';
