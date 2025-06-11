'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CheckCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline'

export default function PaymentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/signup')
    }
  }, [user, router])

  // Simulate payment for demo purposes
  const handleDemoPayment = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update project status and create payment record
      await supabase
        .from('project_status')
        .update({ status: 'in_progress' })
        .eq('user_id', user.id)

      await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          stripe_payment_id: 'demo_payment_' + Date.now(),
          amount: 10000,
          status: 'completed',
        })

      router.push('/dashboard?payment=success')
    } catch (err: unknown) {
      setError((err as Error).message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Proceed!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Complete your payment to finalize your website project
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 dark:text-gray-300">Website Development</span>
              <span className="font-semibold text-gray-900 dark:text-white">$100.00</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600 dark:text-gray-300">Monthly Hosting</span>
              <span className="font-semibold text-gray-900 dark:text-white">$29.99/mo</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-600 mb-4" />
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-900 dark:text-white">Total Today</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">$100.00</span>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDemoPayment}
              disabled={loading}
              className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Pay $100 (Demo)
                </div>
              )}
            </motion.button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              This is a demo payment. In production, this would integrate with Stripe for secure payment processing.
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
