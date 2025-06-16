'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { createPaymentRecord, getPaymentStatus, redirectToStripePayment, getCustomerDetails, createCustomerPortalSession } from '@/lib/stripe'
import { motion } from 'framer-motion'
import { DashboardLayout } from '@/components/DashboardLayout'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationCircleIcon,
  EyeIcon,
  CreditCardIcon,
  UserCircleIcon,
  BellIcon,
  ComputerDesktopIcon,
  ArrowPathIcon // Added for refresh button
} from '@heroicons/react/24/outline'

interface ProjectStatus {
  status: 'not_touched' | 'in_progress' | 'complete'
  updated_at: string
}

interface DemoLinks {
  option_1_url: string | null
  option_2_url: string | null
  option_3_url: string | null
  approved_option: string | null
  approved_at: string | null
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'tracker' | 'demos' | 'billing' | 'settings'>('tracker')
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null)
  const [demoLinks, setDemoLinks] = useState<DemoLinks | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [customerDetails, setCustomerDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [refreshingTracker, setRefreshingTracker] = useState(false)
  const [refreshingDemos, setRefreshingDemos] = useState(false)
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const checkKickoffCompletion = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('kickoff_forms')
      .select('completed')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking kickoff completion:', error)
      return
    }

    if (!data?.completed) {
      router.push('/kickoff')
    }
  }, [user, router, supabase])

  const fetchProjectStatus = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('project_status')
      .select('status, updated_at')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching project status:', error)
      return
    }

    setProjectStatus(data)
  }, [user, supabase])

  const fetchDemoLinks = useCallback(async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('demo_links')
      .select('option_1_url, option_2_url, option_3_url, approved_option, approved_at')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching demo links:', error)
      return
    }

    setDemoLinks(data)
  }, [user, supabase])

  const fetchPaymentStatus = useCallback(async () => {
    if (!user) return

    try {
      const payment = await getPaymentStatus(user.id)
      setPaymentStatus(payment)
    } catch (error) {
      console.error('Error fetching payment status:', error)
      setPaymentStatus(null)
    }
  }, [user])

  const fetchCustomerDetails = useCallback(async () => {
    if (!user) return

    try {
      const customer = await getCustomerDetails(user.id)
      setCustomerDetails(customer)
    } catch (error) {
      // No customer found, which is expected for users without payments
      setCustomerDetails(null)
    }
  }, [user])

  // Refresh handlers with loading simulation
  const handleRefreshTracker = async () => {
    setRefreshingTracker(true)
    // Minimum loading time for better UX
    await Promise.all([
      fetchProjectStatus(),
      new Promise(resolve => setTimeout(resolve, 800))
    ])
    setRefreshingTracker(false)
  }

  const handleRefreshDemos = async () => {
    setRefreshingDemos(true)
    // Minimum loading time for better UX
    await Promise.all([
      fetchDemoLinks(),
      new Promise(resolve => setTimeout(resolve, 800))
    ])
    setRefreshingDemos(false)
  }

  const approveDemo = async (option: string) => {
    if (!user || !demoLinks) return

    setApproving(true)
    
    try {
      // First, update the demo approval
      const { error: demoError } = await supabase
        .from('demo_links')
        .update({ 
          approved_option: option,
          approved_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (demoError) {
        throw demoError
      }

      // Check if user already has a payment record
      let existingPayment = paymentStatus
      if (!existingPayment) {
        try {
          existingPayment = await getPaymentStatus(user.id)
        } catch (error) {
          // No payment record exists, which is fine
        }
      }

      // If no payment exists or previous payment failed, create new payment record
      if (!existingPayment || existingPayment.status === 'failed') {
        const paymentRecord = await createPaymentRecord(user.id)
        setPaymentStatus(paymentRecord)
        
        // Redirect to Stripe payment with payment ID for tracking
        redirectToStripePayment(paymentRecord.id)
      } else if (existingPayment.status === 'completed') {
        // Payment already completed, just refresh the demo links
        await fetchDemoLinks()
      } else if (existingPayment.status === 'pending') {
        // Payment is pending, redirect to Stripe again
        redirectToStripePayment(existingPayment.id)
      }

    } catch (error) {
      console.error('Error approving demo:', error)
      // Show error to user - you might want to add a toast/notification here
    } finally {
      setApproving(false)
    }
  }

  useEffect(() => {
    // Don't redirect if we're still loading auth state
    if (authLoading) return
    
    if (!user) {
      router.push('/signin')
      return
    }

    const loadData = async () => {
      await Promise.all([
        checkKickoffCompletion(),
        fetchProjectStatus(),
        fetchDemoLinks(),
        fetchPaymentStatus(),
        fetchCustomerDetails()
      ])
      setLoading(false)
    }

    loadData()
  }, [user, authLoading, router, checkKickoffCompletion, fetchProjectStatus, fetchDemoLinks, fetchPaymentStatus, fetchCustomerDetails])

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-inter">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_touched':
        return {
          icon: ExclamationCircleIcon,
          text: 'Not Started',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          description: 'Your project hasn\'t been started yet. We\'ll begin work soon!'
        }
      case 'in_progress':
        return {
          icon: ClockIcon,
          text: 'In Progress',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          description: 'Great! Work on your project is currently underway.'
        }
      case 'complete':
        return {
          icon: CheckCircleIcon,
          text: 'Complete',
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          description: 'Congratulations! Your project has been completed.'
        }
      default:
        return null
    }
  }

  const statusInfo = projectStatus ? getStatusInfo(projectStatus.status) : null

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'tracker' | 'demos' | 'billing' | 'settings')
  }

  const handleManageSubscription = async () => {
    if (!customerDetails?.stripe_customer_id) return

    try {
      await createCustomerPortalSession(customerDetails.stripe_customer_id)
    } catch (error) {
      console.error('Error opening customer portal:', error)
      // You might want to show an error toast here
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'tracker':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">Project Progress</h2>
                <button
                  onClick={handleRefreshTracker}
                  disabled={refreshingTracker}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh project status"
                >
                  <ArrowPathIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${refreshingTracker ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {statusInfo && (
                <div className={`${statusInfo.bgColor} rounded-lg p-6 mb-6`}>
                  <div className="flex items-center mb-4">
                    <statusInfo.icon className={`w-6 h-6 ${statusInfo.color} mr-3`} />
                    <span className={`font-semibold ${statusInfo.color} font-inter`}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-inter">
                    {statusInfo.description}
                  </p>
                  {projectStatus?.updated_at && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-inter">
                      Last updated: {new Date(projectStatus.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {!statusInfo && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <ComputerDesktopIcon className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="font-semibold text-blue-600 font-inter">Getting Started</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-inter">
                    Welcome to your project dashboard! Once we begin work on your project, you'll see progress updates here.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                    We'll send you an email notification when work begins.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 'demos':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white">Demo Reviews</h2>
                <button
                  onClick={handleRefreshDemos}
                  disabled={refreshingDemos}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Refresh demo links"
                >
                  <ArrowPathIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${refreshingDemos ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {demoLinks?.approved_option ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                    <span className="font-semibold text-green-600 font-inter">Demo Approved</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-inter">
                    You've approved <strong>Option {demoLinks.approved_option}</strong> on{' '}
                    {demoLinks.approved_at && new Date(demoLinks.approved_at).toLocaleDateString()}
                  </p>
                  <a
                    href={demoLinks[`option_${demoLinks.approved_option}_url` as keyof DemoLinks] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-inter"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    View Approved Demo
                  </a>
                </div>
              ) : demoLinks && (demoLinks.option_1_url || demoLinks.option_2_url || demoLinks.option_3_url) ? (
                <div className="space-y-6">
                  {/* Payment Status Section */}
                  {paymentStatus && (
                    <div className={`p-4 rounded-lg border ${
                      paymentStatus.status === 'completed' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : paymentStatus.status === 'pending'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          Payment Status: 
                        </span>
                        <span className={`text-sm font-semibold ${
                          paymentStatus.status === 'completed' 
                            ? 'text-green-600 dark:text-green-400'
                            : paymentStatus.status === 'pending'
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {paymentStatus.status.charAt(0).toUpperCase() + paymentStatus.status.slice(1)}
                        </span>
                        {paymentStatus.amount && (
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ({paymentStatus.amount} CHF)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-700 dark:text-gray-300 font-inter">
                    Review the demo options below and approve your favorite one to proceed with the final project.
                  </p>
                  
                  <div className="grid gap-6">
                    {[1, 2, 3].map((optionNum) => {
                      const url = demoLinks[`option_${optionNum}_url` as keyof DemoLinks]
                      if (!url) return null
                      
                      return (
                        <div key={optionNum} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 font-inter">
                            Option {optionNum}
                          </h3>
                          <div className="flex items-center justify-between">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-inter"
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              View Demo
                            </a>
                            <button
                              onClick={() => approveDemo(optionNum.toString())}
                              disabled={approving}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-inter"
                            >
                              {approving ? 'Processing...' : paymentStatus?.status === 'completed' ? 'Approved & Paid' : 'Approve & Pay (99 CHF)'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <ComputerDesktopIcon className="w-6 h-6 text-blue-600 mr-3" />
                    <span className="font-semibold text-blue-600 font-inter">Demos Coming Soon</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-inter">
                    Demo options will appear here once we've prepared initial versions of your project. 
                    You'll be able to review and approve your preferred option.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )

      case 'billing':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white mb-6">Billing & Subscription</h2>
              
              <div className="space-y-6">
                {/* Payment Status */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-inter">Payment Status</h3>
                  
                  {paymentStatus ? (
                    <div className={`p-4 rounded-lg border ${
                      paymentStatus.status === 'completed' 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : paymentStatus.status === 'pending'
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCardIcon className={`w-5 h-5 mr-3 ${
                            paymentStatus.status === 'completed' 
                              ? 'text-green-600 dark:text-green-400'
                              : paymentStatus.status === 'pending'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                          <div>
                            <span className={`font-semibold ${
                              paymentStatus.status === 'completed' 
                                ? 'text-green-600 dark:text-green-400'
                                : paymentStatus.status === 'pending'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {paymentStatus.status === 'completed' ? 'Payment Completed' : 
                               paymentStatus.status === 'pending' ? 'Payment Pending' : 'Payment Failed'}
                            </span>
                            {paymentStatus.amount && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Amount: {paymentStatus.amount} CHF
                              </p>
                            )}
                            {paymentStatus.created_at && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(paymentStatus.created_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {paymentStatus.status === 'completed' && (
                          <div className="flex items-center">
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-inter">No payment yet</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            You haven't made any payments yet. Payment will be required when you approve a demo.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subscription Management */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-inter">Subscription Management</h3>
                  
                  {customerDetails?.stripe_customer_id ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">Active Subscription</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Manage your subscription, update payment methods, and view billing history.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleManageSubscription}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-inter text-sm"
                        >
                          Manage Subscription
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-inter">No active subscription</span>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Your subscription will be activated after your first payment is completed.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-inter">Billing Information</h3>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-inter">Monthly Subscription</span>
                        <span className="font-semibold text-gray-900 dark:text-white">99 CHF</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 font-inter">Setup Fee</span>
                        <span className="font-semibold text-gray-900 dark:text-white">0 CHF</span>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900 dark:text-white font-inter">Total per Month</span>
                          <span className="font-bold text-lg text-gray-900 dark:text-white">99 CHF</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-300 font-inter">
                      <strong>Note:</strong> You only pay after approving your website design. 
                      No hidden fees, no long-term contracts. Cancel anytime through the customer portal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-inter">Profile Information</h3>
                  <div className="flex items-center space-x-4">
                    <UserCircleIcon className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white font-inter">
                        {user?.email}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                        Account created: {user?.created_at && new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-inter">Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Email notifications for project updates</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Email notifications for demo availability</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </DashboardLayout>
  )
}
