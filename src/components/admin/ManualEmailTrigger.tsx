'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface EmailTriggerProps {
  userId: string
  emailType: 'demo_ready' | 'website_launch'
  projectData?: any
}

interface EmailEligibility {
  canSend: boolean
  reason: string
  currentData: any
  lastSent: any
  emailType: string
}

export function ManualEmailTrigger({ userId, emailType, projectData }: EmailTriggerProps) {
  const [eligibility, setEligibility] = useState<EmailEligibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [lastSendResult, setLastSendResult] = useState<any>(null)
  const { user } = useAuth()

  // Check eligibility on mount and when data changes
  useEffect(() => {
    checkEligibility()
  }, [userId, emailType, projectData])

  const checkEligibility = async () => {
    try {
      setLoading(true)
      
      // Temporary: Check eligibility directly using projectData until database functions are ready
      if (emailType === 'demo_ready') {
        const allDemosReady = projectData?.option_1_url && projectData?.option_2_url && projectData?.option_3_url
        setEligibility({
          canSend: allDemosReady || false,
          reason: allDemosReady ? 'All demo URLs are ready' : 'Not all demo URLs are filled',
          currentData: {
            option_1_url: projectData?.option_1_url,
            option_2_url: projectData?.option_2_url,
            option_3_url: projectData?.option_3_url
          },
          lastSent: null,
          emailType
        })
      } else if (emailType === 'website_launch') {
        const isLive = projectData?.project_status === 'live'
        setEligibility({
          canSend: isLive || false,
          reason: isLive ? 'Project is live' : 'Project status is not set to live',
          currentData: {
            status: projectData?.project_status,
            final_url: projectData?.final_url
          },
          lastSent: null,
          emailType
        })
      }
      
      // Fallback to API when database functions are ready
      /*
      const response = await fetch('/api/admin/check-email-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, emailType })
      })

      if (response.ok) {
        const data = await response.json()
        setEligibility(data)
      } else {
        console.error('Failed to check email eligibility')
      }
      */
    } catch (error) {
      console.error('Error checking email eligibility:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendEmail = async () => {
    if (!eligibility?.canSend) return

    try {
      setSending(true)
      const endpoint = emailType === 'demo_ready' 
        ? '/api/admin/send-demo-email' 
        : '/api/admin/send-launch-email'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          adminUserId: user?.id 
        })
      })

      const result = await response.json()

      if (response.ok) {
        setLastSendResult(result)
        // Refresh eligibility after successful send
        await checkEligibility()
      } else {
        setLastSendResult({ error: result.error })
      }
    } catch (error) {
      console.error('Error sending email:', error)
      setLastSendResult({ error: 'Network error occurred' })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    )
  }

  if (!eligibility) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to check email eligibility
        </p>
      </div>
    )
  }

  const getButtonText = () => {
    if (sending) return 'Sending...'
    if (emailType === 'demo_ready') return 'Send Demo Ready Email'
    return 'Send Website Launch Email'
  }

  const getStatusColor = () => {
    if (eligibility.canSend) return 'text-green-600 dark:text-green-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getButtonColor = () => {
    if (!eligibility.canSend) return 'bg-gray-400 cursor-not-allowed'
    if (emailType === 'demo_ready') return 'bg-blue-500 hover:bg-blue-600'
    return 'bg-purple-500 hover:bg-purple-600'
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {emailType === 'demo_ready' ? '📧 Demo Ready Email' : '🚀 Website Launch Email'}
        </h3>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {eligibility.canSend ? '✅ Ready to Send' : '⏸️ Not Available'}
        </span>
      </div>

      {/* Current Data Display */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Status:</p>
        {emailType === 'demo_ready' ? (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Option 1 URL:</span>
              <span className={eligibility.currentData?.option_1_url ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {eligibility.currentData?.option_1_url ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Option 2 URL:</span>
              <span className={eligibility.currentData?.option_2_url ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {eligibility.currentData?.option_2_url ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Option 3 URL:</span>
              <span className={eligibility.currentData?.option_3_url ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {eligibility.currentData?.option_3_url ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Project Status:</span>
              <span className={eligibility.currentData?.status === 'live' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                {eligibility.currentData?.status || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Final URL:</span>
              <span className={eligibility.currentData?.final_url ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                {eligibility.currentData?.final_url ? '✓ Set' : 'Not set'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Reason if can't send */}
      {!eligibility.canSend && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Cannot send:</strong> {eligibility.reason}
          </p>
        </div>
      )}

      {/* Last sent info */}
      {eligibility.lastSent && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            <strong>Last sent:</strong> {new Date(eligibility.lastSent.sent_at).toLocaleString()}
          </p>
        </div>
      )}

      {/* Send button */}
      <button
        onClick={sendEmail}
        disabled={!eligibility.canSend || sending}
        className={`w-full px-4 py-2 text-white rounded-lg transition-colors font-medium ${getButtonColor()}`}
      >
        {getButtonText()}
      </button>

      {/* Send result */}
      {lastSendResult && (
        <div className={`mt-4 p-3 rounded-lg ${
          lastSendResult.error 
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
        }`}>
          <p className={`text-sm ${
            lastSendResult.error 
              ? 'text-red-800 dark:text-red-200' 
              : 'text-green-800 dark:text-green-200'
          }`}>
            {lastSendResult.error 
              ? `❌ Error: ${lastSendResult.error}`
              : `✅ Email sent successfully to ${lastSendResult.customerEmail}`
            }
          </p>
        </div>
      )}

      {/* Refresh button */}
      <button
        onClick={checkEligibility}
        disabled={loading}
        className="mt-2 w-full px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
      >
        🔄 Refresh Status
      </button>
    </div>
  )
}
