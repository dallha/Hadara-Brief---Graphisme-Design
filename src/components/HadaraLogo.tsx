import React from 'react';

interface HadaraLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'bleu' | 'or' | 'h' | 'picto';
}

export const HadaraLogo: React.FC<HadaraLogoProps> = ({ className = '', size = 'md', variant = 'or' }) => {
  const sizeClasses = {
    sm: 'w-10', 
    md: 'w-14',
    lg: 'w-16',
    xl: 'w-24'
  };

  const getLogoSrc = () => {
    switch (variant) {
      case 'bleu': return '/logos/logo-bleu.png';
      case 'or': return '/logos/logo-or.png';
      case 'h': return '/logos/logo-h.png';
      case 'picto': return '/logos/logo-picto.png';
      case 'default': return '/logos/logo.png';
      default: return '/logos/logo-or.png';
    }
  };

  return (
    <img 
      src={getLogoSrc()} 
      alt="Le Graphiste de la Hadara Logo"
      className={`object-contain shrink-0 transition-transform duration-300 hover:scale-105 ${sizeClasses[size]} ${className}`}
    />
  );
};
