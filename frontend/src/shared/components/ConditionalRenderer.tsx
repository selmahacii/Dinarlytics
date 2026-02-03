import React, { ReactNode } from 'react';
import { getRevenueSegment } from '../types/revenueSegments';
import { LockClosedIcon } from '@heroicons/react/24/outline';

interface ConditionalRendererProps {
  children: ReactNode;
  requiredRevenue?: number;
  requiredSegment?: string | string[];
  requiredAccessLevel?: string | string[];
  currentRevenue: number;
  currentAccessLevel?: string;
  fallback?: ReactNode;
  showLocked?: boolean;
  lockedMessage?: string;
}

/**
 * Composant pour affichage conditionnel basé sur le CA, le segment ou le niveau d'accès
 */
export const ConditionalRenderer: React.FC<ConditionalRendererProps> = ({
  children,
  requiredRevenue,
  requiredSegment,
  requiredAccessLevel,
  currentRevenue,
  currentAccessLevel,
  fallback,
  showLocked = true,
  lockedMessage
}) => {
  // Vérifications
  const currentSegment = getRevenueSegment(currentRevenue);
  
  // Vérifier le CA minimum
  if (requiredRevenue && currentRevenue < requiredRevenue) {
    return showLocked ? (
      <LockedFeature 
        message={lockedMessage || `Disponible à partir de ${(requiredRevenue / 1000000).toFixed(1)}M DA de CA`}
      />
    ) : (fallback || null);
  }

  // Vérifier le segment requis
  if (requiredSegment) {
    const segments = Array.isArray(requiredSegment) ? requiredSegment : [requiredSegment];
    if (!segments.includes(currentSegment.id)) {
      return showLocked ? (
        <LockedFeature 
          message={lockedMessage || `Disponible pour les segments: ${segments.join(', ')}`}
        />
      ) : (fallback || null);
    }
  }

  // Vérifier le niveau d'accès
  if (requiredAccessLevel && currentAccessLevel) {
    const levels = Array.isArray(requiredAccessLevel) ? requiredAccessLevel : [requiredAccessLevel];
    if (!levels.includes(currentAccessLevel)) {
      return showLocked ? (
        <LockedFeature 
          message={lockedMessage || `Disponible avec les plans: ${levels.join(', ')}`}
        />
      ) : (fallback || null);
    }
  }

  return <>{children}</>;
};

/**
 * Composant affiché quand une fonctionnalité est verrouillée
 */
const LockedFeature: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="relative rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8">
      <div className="absolute inset-0 bg-gray-100 opacity-50 rounded-lg" />
      <div className="relative flex flex-col items-center justify-center text-center space-y-3">
        <div className="p-4 rounded-full bg-gray-200">
          <LockClosedIcon className="h-10 w-10 text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700">Fonctionnalité Verrouillée</h3>
        <p className="text-sm text-gray-600 max-w-md">{message}</p>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Voir les options d'upgrade
        </button>
      </div>
    </div>
  );
};

/**
 * Hook pour vérifier les permissions basées sur le CA
 */
export const useRevenuePermissions = (currentRevenue: number, currentAccessLevel?: string) => {
  const currentSegment = getRevenueSegment(currentRevenue);

  const hasRevenueAccess = (minRevenue: number): boolean => {
    return currentRevenue >= minRevenue;
  };

  const hasSegmentAccess = (segments: string | string[]): boolean => {
    const segmentArray = Array.isArray(segments) ? segments : [segments];
    return segmentArray.includes(currentSegment.id);
  };

  const hasAccessLevelPermission = (levels: string | string[]): boolean => {
    if (!currentAccessLevel) return false;
    const levelArray = Array.isArray(levels) ? levels : [levels];
    return levelArray.includes(currentAccessLevel);
  };

  const canAccess = (options: {
    minRevenue?: number;
    segments?: string | string[];
    accessLevels?: string | string[];
  }): boolean => {
    if (options.minRevenue && !hasRevenueAccess(options.minRevenue)) return false;
    if (options.segments && !hasSegmentAccess(options.segments)) return false;
    if (options.accessLevels && !hasAccessLevelPermission(options.accessLevels)) return false;
    return true;
  };

  return {
    currentSegment,
    hasRevenueAccess,
    hasSegmentAccess,
    hasAccessLevelPermission,
    canAccess
  };
};

/**
 * HOC pour rendre un composant conditionnel basé sur le CA
 */
export function withRevenueAccess<P extends object>(
  Component: React.ComponentType<P>,
  requirements: {
    minRevenue?: number;
    segments?: string | string[];
    accessLevels?: string | string[];
  }
) {
  return (props: P & { currentRevenue: number; currentAccessLevel?: string }) => {
    const { currentRevenue, currentAccessLevel, ...componentProps } = props;
    
    return (
      <ConditionalRenderer
        currentRevenue={currentRevenue}
        currentAccessLevel={currentAccessLevel}
        requiredRevenue={requirements.minRevenue}
        requiredSegment={requirements.segments}
        requiredAccessLevel={requirements.accessLevels}
        showLocked={true}
      >
        <Component {...(componentProps as P)} />
      </ConditionalRenderer>
    );
  };
}

/**
 * Composant de badge pour indiquer les prérequis
 */
export const AccessBadge: React.FC<{
  type: 'revenue' | 'segment' | 'access';
  value: string;
  unlocked?: boolean;
}> = ({ type, value, unlocked = false }) => {
  const getIcon = () => {
    switch (type) {
      case 'revenue': return '💰';
      case 'segment': return '📊';
      case 'access': return '🔑';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'revenue': return 'CA requis';
      case 'segment': return 'Segment';
      case 'access': return 'Plan';
    }
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
      unlocked 
        ? 'bg-green-100 text-green-800 border border-green-300' 
        : 'bg-gray-100 text-gray-600 border border-gray-300'
    }`}>
      <span className="mr-1">{getIcon()}</span>
      {unlocked && <span className="mr-1">✓</span>}
      {getLabel()}: {value}
    </span>
  );
};

export default ConditionalRenderer;

