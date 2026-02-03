import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface PageTransitionProps {
  isVisible: boolean;
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down' | 'fade';
  duration?: number;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  isVisible,
  children,
  direction = 'fade',
  duration = 500,
  className = ''
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const getTransformStyles = () => {
    if (!isAnimating) return {};

    const baseTransform = isVisible ? 'translate(0, 0)' : getExitTransform();
    const baseOpacity = isVisible ? 1 : 0;

    return {
      transform: baseTransform,
      opacity: baseOpacity,
      transition: `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    };
  };

  const getExitTransform = () => {
    switch (direction) {
      case 'left':
        return 'translate(-100%, 0)';
      case 'right':
        return 'translate(100%, 0)';
      case 'up':
        return 'translate(0, -100%)';
      case 'down':
        return 'translate(0, 100%)';
      case 'fade':
      default:
        return 'translate(0, 0)';
    }
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`page-transition ${className}`}
      style={getTransformStyles()}
    >
      {children}
    </div>
  );
};

// Composant pour les transitions avec overlay
interface OverlayTransitionProps {
  isVisible: boolean;
  children: React.ReactNode;
  overlayColor?: string;
  duration?: number;
}

export const OverlayTransition: React.FC<OverlayTransitionProps> = ({
  isVisible,
  children,
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  duration = 300
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsAnimating(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  if (!shouldRender) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: overlayColor,
        opacity: isAnimating ? (isVisible ? 1 : 0) : 0,
        transition: `opacity ${duration}ms ease-in-out`
      }}
    >
      <div
        style={{
          transform: isAnimating ? (isVisible ? 'scale(1)' : 'scale(0.9)') : 'scale(0.9)',
          transition: `transform ${duration}ms ease-in-out`
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default PageTransition;

