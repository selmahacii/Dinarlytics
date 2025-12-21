import React from 'react';

export type WidgetSize = 'small' | 'medium' | 'large' | 'xlarge';
export type WidgetType = 'kpi' | 'chart' | 'table' | 'alert' | 'ai-insight' | 'gauge' | 'trend';

export interface WidgetPosition {
  row: number;
  col: number;
  span?: number; // Pour les widgets qui s'étendent sur plusieurs colonnes
}

export interface WidgetConfig {
  refreshInterval?: number; // en millisecondes
  exportable?: boolean;
  collapsible?: boolean;
  customizable?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface BaseWidgetProps {
  id: string;
  title: string;
  size: WidgetSize;
  position: WidgetPosition;
  config: WidgetConfig;
  data?: any;
  onUpdate?: (id: string, data: any) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
  position: WidgetPosition;
  component: React.ComponentType<BaseWidgetProps>;
  config: WidgetConfig;
  data?: any;
  visible: boolean;
  order: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetGridProps {
  widgets: DashboardWidget[];
  onWidgetUpdate: (widget: DashboardWidget) => void;
  onWidgetRemove: (widgetId: string) => void;
  onLayoutChange: (layout: DashboardLayout) => void;
  editable?: boolean;
  className?: string;
}

// Types spécifiques pour les widgets KPI
export interface KPIWidgetData {
  value: number;
  label: string;
  unit: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
    period: string;
  };
  status?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ComponentType<any>;
  color?: string;
}

export interface KPIWidgetProps extends BaseWidgetProps {
  data: KPIWidgetData;
}

// Types pour les widgets graphiques
export interface ChartWidgetData {
  type: 'line' | 'bar' | 'doughnut' | 'pie' | 'area';
  data: any; // Données Chart.js
  options?: any; // Options Chart.js
  title?: string;
  subtitle?: string;
}

export interface ChartWidgetProps extends BaseWidgetProps {
  data: ChartWidgetData;
}

// Types pour les widgets IA
export interface AIInsightWidgetData {
  insights: Array<{
    id: string;
    title: string;
    description: string;
    type: 'recommendation' | 'alert' | 'prediction' | 'analysis';
    confidence: number;
    priority: 'low' | 'medium' | 'high' | 'critical';
    actionable: boolean;
    timestamp: Date;
  }>;
  aiStatus: 'active' | 'learning' | 'idle';
  lastUpdate: Date;
}

export interface AIInsightWidgetProps extends BaseWidgetProps {
  data: AIInsightWidgetData;
}

// Types pour les widgets d'alerte
export interface AlertWidgetData {
  alerts: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'error' | 'success';
    severity: 'low' | 'medium' | 'high' | 'critical';
    timestamp: Date;
    acknowledged: boolean;
    actions?: Array<{
      label: string;
      action: () => void;
      type: 'primary' | 'secondary' | 'danger';
    }>;
  }>;
  totalCount: number;
  unreadCount: number;
}

export interface AlertWidgetProps extends BaseWidgetProps {
  data: AlertWidgetData;
}

// Types pour la grille responsive
export interface GridBreakpoints {
  sm: number; // 640px
  md: number; // 768px
  lg: number; // 1024px
  xl: number; // 1280px
}

export interface ResponsiveGridConfig {
  columns: GridBreakpoints;
  gap: GridBreakpoints;
  widgetSizes: {
    [K in WidgetSize]: {
      cols: GridBreakpoints;
      rows: GridBreakpoints;
    };
  };
}

