import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = [
    'inline-flex items-center justify-center',
    'font-serif font-bold tracking-wide',
    'transition-all duration-200 ease-out',
    'active:scale-[0.97]',
    'disabled:opacity-50 disabled:pointer-events-none disabled:transform-none',
    'focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent',
  ].join(' ');

  const sizeStyles = {
    sm: 'px-4 py-2 text-xs rounded-xl gap-1.5 focus:ring-[#816C07]/50',
    md: 'px-5 py-2.5 text-sm rounded-xl gap-2 shadow-md focus:ring-[#816C07]/50',
    lg: 'px-7 py-3.5 text-base rounded-2xl gap-2.5 shadow-xl focus:ring-[#816C07]/60',
  };

  const variantStyles = {
    primary: [
      'bg-gradient-to-r from-[#816C07] to-[#a38b12]',
      'hover:from-[#927b08] hover:to-[#b59b15]',
      'text-[#F8F8F8] font-extrabold',
      'border border-[#816C07]/50',
      'shadow-lg shadow-[#816C07]/20',
      'hover:shadow-[#816C07]/30 hover:scale-[1.02]',
    ].join(' '),
    secondary: [
      'bg-[#335A79]/20 hover:bg-[#335A79]/40',
      'text-[#F5F5DC]',
      'border border-[#335A79]/50 hover:border-[#335A79]/80',
    ].join(' '),
    outline: [
      'bg-transparent hover:bg-[#816C07]/10',
      'text-[#D4C9BF] hover:text-[#F8F8F8]',
      'border border-[#816C07]/40 hover:border-[#816C07]',
    ].join(' '),
    ghost: [
      'bg-transparent hover:bg-[#141c2e]',
      'text-[#D4C9BF] hover:text-[#F8F8F8]',
      'border border-transparent hover:border-[#335A79]/30',
    ].join(' '),
    danger: [
      'bg-[#800020]/10 hover:bg-[#800020]/30',
      'text-[#A6472F] hover:text-[#c05535]',
      'border border-[#A6472F]/30 hover:border-[#A6472F]/60',
    ].join(' '),
    success: [
      'bg-[#224A33]/20 hover:bg-[#224A33]/40',
      'text-[#F5F5DC]',
      'border border-[#224A33]/50 hover:border-[#224A33]/80',
    ].join(' '),
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin w-4 h-4 shrink-0 opacity-80"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
