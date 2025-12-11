import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Error Boundary component to catch React errors and display friendly fallback UI
 * Prevents entire app from crashing when a component error occurs
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }
    
    // Store error info in state using setState() (React will detect this change)
    this.setState({
      error,
      errorInfo,
    });

    // In production, you could send errors to an error reporting service here
    // Example: Sentry.captureException(error);
  }

  handleReload = () => {
    // Reset error state and reload
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    // Reset error state and navigate home
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 shadow-lg">
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-red-100 p-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h1 className="mt-6 text-center text-2xl font-bold text-slate-900">
              Something went wrong
            </h1>
            
            <p className="mt-3 text-center text-sm text-slate-600">
              We encountered an unexpected error. Please try reloading the page.
            </p>

            {isDevelopment && this.state.error && (
              <details className="mt-4 rounded-lg bg-red-50 p-4">
                <summary className="cursor-pointer text-sm font-semibold text-red-800">
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 space-y-2">
                  <p className="text-xs font-medium text-red-700">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <pre className="overflow-auto rounded bg-red-100 p-2 text-xs text-red-900">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              >
                Go Home
              </button>
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              If this problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

