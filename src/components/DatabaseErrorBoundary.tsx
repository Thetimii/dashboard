'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class DatabaseErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if it's a database-related error
    const isDatabaseError = error.message?.includes('406') ||
                           error.message?.includes('Not Acceptable') ||
                           error.message?.includes('relation') ||
                           error.message?.includes('table') ||
                           error.message?.includes('PGRST')

    return { 
      hasError: isDatabaseError,
      error: isDatabaseError ? error : undefined
    }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Database Error Boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Database Issue Detected
              </h1>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Some database tables appear to be missing. This is a known issue that can be fixed quickly.
              </p>

              <div className="space-y-3">
                <a
                  href="/database-debug"
                  className="block w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
                >
                  🔍 Check Database Status
                </a>
                
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  🔄 Retry
                </button>
                
                <a
                  href="mailto:info@customerflows.ch?subject=Database%20Issue&body=I'm%20experiencing%20a%20database%20issue%20on%20the%20dashboard."
                  className="block w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  📧 Contact Support
                </a>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Quick Fix:</strong> This issue can usually be resolved by running a database setup script in Supabase.
                </p>
              </div>

              {this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="text-sm text-gray-500 cursor-pointer">Technical Details</summary>
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
