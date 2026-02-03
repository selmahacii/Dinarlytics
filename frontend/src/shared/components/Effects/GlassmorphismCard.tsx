import React from 'react';

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: 'light' | 'medium' | 'strong';
  blur?: boolean;
  animated?: boolean;
}

const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
  children,
  className = '',
  intensity = 'medium',
  blur = true,
  animated = false
}) => {
  const getIntensityStyles = () => {
    switch (intensity) {
      case 'light':
        return {
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: blur ? 'blur(10px)' : 'none',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        };
      case 'medium':
        return {
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: blur ? 'blur(15px)' : 'none',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        };
      case 'strong':
        return {
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: blur ? 'blur(20px)' : 'none',
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        };
      default:
        return {};
    }
  };

  const baseStyles = {
    borderRadius: '16px',
    ...getIntensityStyles()
  };

  const animatedStyles = animated ? {
    transition: 'all 0.3s ease-in-out',
    transform: 'translateY(0)',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)'
    }
  } : {};

  return (
    <div
      className={`glassmorphism-card ${className}`}
      style={{
        ...baseStyles,
        ...animatedStyles
      }}
    >
      {children}
    </div>
  );
};

export default GlassmorphismCard;

