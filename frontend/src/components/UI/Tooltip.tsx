import React, { useState } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface TooltipProps {
  content: string;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children?: React.ReactNode;
  className?: string;
  iconOnly?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  title,
  position = 'top',
  children,
  className = '',
  iconOnly = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-800'
  };

  if (iconOnly) {
    return (
      <div className={`relative inline-block ${className}`}>
        <button
          type="button"
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}
          onFocus={() => setIsVisible(true)}
          onBlur={() => setIsVisible(false)}
          className="inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          aria-label="Aide"
        >
          <InformationCircleIcon className="h-4 w-4" />
        </button>
        {isVisible && (
          <div
            className={`absolute z-50 w-64 p-3 bg-slate-800 dark:bg-slate-900 text-white text-sm rounded-lg shadow-xl ${positionClasses[position]} pointer-events-none`}
            role="tooltip"
          >
            {title && (
              <div className="font-semibold mb-1 text-slate-100">{title}</div>
            )}
            <div className="text-slate-200">{content}</div>
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 w-64 p-3 bg-slate-800 dark:bg-slate-900 text-white text-sm rounded-lg shadow-xl ${positionClasses[position]} pointer-events-none`}
          role="tooltip"
        >
          {title && (
            <div className="font-semibold mb-1 text-slate-100">{title}</div>
          )}
          <div className="text-slate-200">{content}</div>
          <div
            className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;

