import React from 'react';

interface ProgressBarProps {
  value: number; // 0-100
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'current';
  height?: 'sm' | 'md';
  rounded?: boolean;
  className?: string;
  showLabel?: boolean;
  labelPosition?: 'inside' | 'outside';
  ariaLabel?: string;
}

// Maps value to utility width class (5% steps)
const widthClass = (v: number) => {
  const clamped = Math.max(0, Math.min(100, Math.round(v / 5) * 5));
  return `w-pct-${clamped}`;
};

const colorClass = (color: ProgressBarProps['color']) => {
  switch (color) {
    case 'blue': return 'bg-blue-500';
    case 'green': return 'bg-green-500';
    case 'purple': return 'bg-purple-500';
    case 'orange': return 'bg-orange-500';
    case 'current': return 'bg-current';
    default: return 'bg-slate-500';
  }
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'blue',
  height = 'sm',
  rounded = true,
  className = '',
  showLabel = false,
  labelPosition = 'outside',
  ariaLabel = 'Progression'
}) => {
  return (
    <div className={`flex flex-col ${className}`} title={ariaLabel}>
      <div className={`w-full bg-gray-200 ${rounded ? 'rounded-full' : 'rounded'} overflow-hidden`}>
        <div
          className={`${widthClass(value)} ${colorClass(color)} ${height === 'sm' ? 'h-2' : 'h-4'} transition-all duration-300 ${rounded ? 'rounded-full' : 'rounded'} progress-bar`}
        />
      </div>
      {showLabel && labelPosition === 'outside' && (
        <span className="mt-1 text-xs text-gray-600" aria-hidden="true">{value}%</span>
      )}
      {showLabel && labelPosition === 'inside' && (
        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
          {value}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
