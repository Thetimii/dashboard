'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

interface DatabaseHealth {
  table: string
  exists: boolean
  accessible: boolean
  error?: string
}

export default function DatabaseDebugPage() {
  const [results, setResults] = useState<DatabaseHealth[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    const testDatabaseTables = async () => {
      const tables = [
        'user_profiles',
        'kickoff_forms', 
        'project_status',
        'demo_links',
        'client_assignments',
        'followup_questionnaires',
        'payments'
      ]

      const results: DatabaseHealth[] = []

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('id')
            .limit(1)

          results.push({
            table,
            exists: !error,
            accessible: !error,
            error: error?.message || error?.code
          })
        } catch (error: any) {
          results.push({
            table,
            exists: false,
            accessible: false,
            error: error.message
          })
        }
      }

      setResults(results)
      setLoading(false)
    }

    testDatabaseTables()
  }, [user, supabase])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Database Debug
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Please sign in to test database access.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Database Debug & Health Check
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            User Information
          </h2>
          <div className="space-y-2 text-sm">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Created:</strong> {new Date(user.created_at || '').toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Database Tables Health Check
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Testing database access...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div
                  key={result.table}
                  className={`p-4 rounded-lg border ${
                    result.accessible
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {result.table}
                      </h3>
                      <p className={`text-sm ${
                        result.accessible
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {result.accessible ? '✅ Accessible' : '❌ Not Accessible'}
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {result.error}
                        </p>
                      )}
                    </div>
                    <div className={`w-4 h-4 rounded-full ${
                      result.accessible ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🛠️ Fix Instructions
          </h3>
          <p className="text-blue-800 dark:text-blue-200 mb-4">
            If any tables show as "Not Accessible", run the following SQL script in your Supabase SQL Editor:
          </p>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`-- Run this file in Supabase SQL Editor:
-- /Users/timsager/Desktop/dashboard/PRODUCTION_DATABASE_FIX.sql

-- OR run the complete database setup:
-- /Users/timsager/Desktop/dashboard/complete-database-setup.sql`}</pre>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Refresh Test
          </button>
        </div>
      </div>
    </div>
  )
}
