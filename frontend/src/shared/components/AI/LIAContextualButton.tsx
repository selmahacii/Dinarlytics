import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';
import { useLIA } from '@shared/hooks/useLIA';

interface LIAContextualButtonProps {
  /**
   * Question à poser à LIA
   */
  question?: string;
  
  /**
   * Contexte de la page/section
   */
  context?: string;
  
  /**
   * Variante d'affichage
   */
  variant?: 'icon' | 'button' | 'link' | 'badge';
  
  /**
   * Taille du bouton
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Texte du bouton (si variant = 'button')
   */
  label?: string;
  
  /**
   * Classe CSS personnalisée
   */
  className?: string;
  
  /**
   * Tooltip personnalisé
   */
  tooltip?: string;
}

/**
 * Bouton contextuel pour ouvrir LIA avec une question ou un contexte spécifique
 */
const LIAContextualButton: React.FC<LIAContextualButtonProps> = ({
  question,
  context,
  variant = 'icon',
  size = 'md',
  label = 'LIA',
  className = '',
  tooltip
}) => {
  const { openLIA, openLIAWithContext } = useLIA();

  const handleClick = () => {
    if (question) {
      openLIA(question, { section: context });
    } else if (context) {
      openLIAWithContext(context);
    } else {
      openLIA();
    }
  };

  const sizeClasses = {
    sm: variant === 'icon' ? 'h-6 w-6' : 'px-2 py-1 text-xs',
    md: variant === 'icon' ? 'h-8 w-8' : 'px-3 py-1.5 text-sm',
    lg: variant === 'icon' ? 'h-10 w-10' : 'px-4 py-2 text-base'
  };

  const variantClasses = {
    icon: 'rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-center',
    button: 'rounded-lg bg-slate-700 hover:bg-slate-800 text-white transition-colors flex items-center gap-2 font-medium',
    link: 'text-blue-600 hover:text-blue-800 underline flex items-center gap-1',
    badge: 'rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 text-xs font-medium flex items-center gap-1.5 transition-colors'
  };

  const baseClasses = `${sizeClasses[size]} ${variantClasses[variant]} ${className}`;

  return (
    <button
      onClick={handleClick}
      className={baseClasses}
      title={tooltip || (question ? `Demander à LIA: ${question}` : 'Ouvrir LIA')}
      aria-label={tooltip || 'Ouvrir l\'assistant LIA'}
    >
      <SparklesIcon className={variant === 'icon' ? 'h-4 w-4' : size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      {variant !== 'icon' && (
        <span>{label}</span>
      )}
    </button>
  );
};

export default LIAContextualButton;

