/**
 * Widget-Specific Error Boundary
 *
 * Catches errors in individual widgets without crashing the entire dashboard
 * Shows fallback UI with error details and recovery options
 */

import React, { ReactNode, ReactElement } from 'react'
import { ExclamationTriangleIcon, RotateCcwIcon } from '@heroicons/react/24/outline'

interface WidgetErrorBoundaryProps {
  children: ReactNode
  widgetName: string
  onReset?: () => void
}

interface WidgetErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class WidgetErrorBoundary extends React.Component<
  WidgetErrorBoundaryProps,
  WidgetErrorBoundaryState
> {
  constructor(props: WidgetErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): WidgetErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[${this.props.widgetName}] Error:`, error, errorInfo)

    // Optional: Log to Sentry
    // Sentry.captureException(error, {
    //   tags: { widget: this.props.widgetName },
    //   extra: errorInfo,
    // })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render(): ReactElement {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 min-h-64 flex flex-col justify-center">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                ❌ Erreur du Widget: {this.props.widgetName}
              </h3>
              <p className="text-sm text-red-700 mb-4">
                {this.state.error?.message || 'Une erreur inconnue s\'est produite'}
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="mb-4">
                  <summary className="cursor-pointer text-xs text-red-600 hover:text-red-700">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 text-xs bg-white p-3 rounded border border-red-200 overflow-auto max-h-40">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}

              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <RotateCcwIcon className="h-4 w-4" />
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children as ReactElement
  }
}

export default WidgetErrorBoundary

/**
 * HOC to wrap a component with WidgetErrorBoundary
 */
export function withWidgetErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  widgetName: string
) {
  return function WithWidgetErrorBoundaryComponent(props: P) {
    return (
      <WidgetErrorBoundary widgetName={widgetName}>
        <Component {...props} />
      </WidgetErrorBoundary>
    )
  }
}
