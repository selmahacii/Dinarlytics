// Export des composants Dashboard
export { default as BaseWidget } from './BaseWidget';
export { default as KPIWidget } from './KPIWidget';
export { default as ChartWidget } from './ChartWidget';
export { default as AIInsightWidget } from './AIInsightWidget';
export { default as DashboardGrid } from './DashboardGrid';

// Export des types
export type {
  WidgetSize,
  WidgetType,
  WidgetPosition,
  WidgetConfig,
  BaseWidgetProps,
  DashboardWidget,
  DashboardLayout,
  WidgetGridProps,
  KPIWidgetData,
  KPIWidgetProps,
  ChartWidgetData,
  ChartWidgetProps,
  AIInsightWidgetData,
  AIInsightWidgetProps,
  AlertWidgetData,
  AlertWidgetProps,
  GridBreakpoints,
  ResponsiveGridConfig
} from '../../types/widgets';

