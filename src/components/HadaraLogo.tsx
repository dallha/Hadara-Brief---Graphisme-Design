import React from 'react';
import logoBleu from '../assets/logos/logo-bleu.png';
import logoOr from '../assets/logos/logo-or.png';
import logoH from '../assets/logos/logo-h.png';
import logoPicto from '../assets/logos/logo-picto.png';
import logoDefault from '../assets/logos/logo.png';

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
      case 'bleu': return logoBleu;
      case 'or': return logoOr;
      case 'h': return logoH;
      case 'picto': return logoPicto;
      case 'default': return logoDefault;
      default: return logoOr;
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
