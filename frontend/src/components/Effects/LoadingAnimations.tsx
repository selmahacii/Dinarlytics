import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = '#3b82f6',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="60 40"
          className="opacity-25"
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="60 40"
          strokeDashoffset="60"
          className=""
          style={{
            animation: 'spin 1s linear infinite'
          }}
        />
      </svg>
    </div>
  );
};

interface PulseLoaderProps {
  dots?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  dots = 3,
  color = '#3b82f6',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <div className={`flex space-x-1 ${className}`}>
      {Array.from({ length: dots }).map((_, index) => (
        <div
          key={index}
          className={`${sizeClasses[size]} rounded-full`}
          style={{
            backgroundColor: color,
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

interface WaveLoaderProps {
  bars?: number;
  color?: string;
  className?: string;
}

export const WaveLoader: React.FC<WaveLoaderProps> = ({
  bars = 5,
  color = '#3b82f6',
  className = ''
}) => {
  return (
    <div className={`flex items-end space-x-1 ${className}`}>
      {Array.from({ length: bars }).map((_, index) => (
        <div
          key={index}
          className="w-1 bg-current rounded-full"
          style={{
            backgroundColor: color,
            height: `${20 + index * 10}px`,
            animationDelay: `${index * 0.1}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

interface SkeletonLoaderProps {
  lines?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  lines = 3,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"
          style={{
            width: `${100 - index * 10}%`,
            animationDelay: `${index * 0.1}s`
          }}
        />
      ))}
    </div>
  );
};

interface ProgressBarProps {
  progress: number;
  color?: string;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color = '#3b82f6',
  animated = true,
  className = ''
}) => {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 ${className}`}>
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
};

interface ShimmerEffectProps {
  children: React.ReactNode;
  isLoading: boolean;
  className?: string;
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  children,
  isLoading,
  className = ''
}) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="bg-gray-200 dark:bg-gray-700 rounded">
        {children}
      </div>
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
};

