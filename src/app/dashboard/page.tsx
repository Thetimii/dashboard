'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { createPaymentRecord, getPaymentStatus, redirectToStripePayment, getCustomerDetails, createCustomerPortalSession, PAYMENT_AMOUNT } from '@/lib/stripe'
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
  ArrowPathIcon, // Added for refresh button
  DocumentTextIcon, // Added for billing history
  CogIcon // Added for subscription management
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
  const [initialized, setInitialized] = useState(false)
  const [approving, setApproving] = useState(false)
  const [refreshingTracker, setRefreshingTracker] = useState(false)
  const [refreshingDemos, setRefreshingDemos] = useState(false)
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()
  
  // Memoize the supabase client to prevent recreating on each render
  const supabase = useMemo(() => createClient(), [])
  
  // Memoize user ID to prevent unnecessary re-renders
  const userId = useMemo(() => user?.id, [user?.id])



  // This single useEffect handles authentication and initial data loading.
  useEffect(() => {
    if (authLoading || initialized || !userId) return

    const loadInitialData = async () => {
      setLoading(true)

      try {
        const [projectStatusData, demoLinksData, paymentStatusData, customerDetailsData] = await Promise.all([
          supabase
            .from('project_status')
            .select('status, updated_at')
            .eq('user_id', userId)
            .maybeSingle()
            .then(({ data, error }: { data: any, error: any }) => {
              if (error) {
                console.error('Error fetching project status:', error)
                return null
              }
              return data
            }),

          supabase
            .from('demo_links')
            .select('option_1_url, option_2_url, option_3_url, approved_option, approved_at')
            .eq('user_id', userId)
            .maybeSingle()
            .then(({ data, error }: { data: any, error: any }) => {
              if (error) {
                console.error('Error fetching demo links:', error)
                return null
              }
              return data
            }),

          getPaymentStatus(userId).catch((error) => {
            console.log('Payment status check failed:', error)
            return null
          }),

          getCustomerDetails(userId).catch((error) => {
            console.log('Customer details check failed:', error)
            return null
          }),
        ])

        setProjectStatus(projectStatusData)
        setDemoLinks(demoLinksData)
        setPaymentStatus(paymentStatusData)
        setCustomerDetails(customerDetailsData)
      } catch (error) {
        console.error('Initial data load failed:', error)
      } finally {
        setInitialized(true) // prevents future reruns
        setLoading(false)
      }
    }

    loadInitialData()
  }, [authLoading, userId, initialized])

  // Separate useEffect for authentication redirect (runs only when auth changes)
  useEffect(() => {
    if (!authLoading && !userId) {
      router.push('/signin')
    }
  }, [authLoading, userId, router])

  // Refresh handlers with loading simulation
  const handleRefreshTracker = async () => {
    setRefreshingTracker(true)
    
    // Fetch project status
    try {
      const { data, error } = await supabase
        .from('project_status')
        .select('status, updated_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching project status:', error)
      } else {
        setProjectStatus(data || null)
      }
    } catch (error) {
      console.error('Unexpected error fetching project status:', error)
    }
    
    // Minimum loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    setRefreshingTracker(false)
  }

  const handleRefreshDemos = async () => {
    setRefreshingDemos(true)
    
    // Fetch demo links
    try {
      const { data, error } = await supabase
        .from('demo_links')
        .select('option_1_url, option_2_url, option_3_url, approved_option, approved_at')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching demo links:', error)
      } else {
        setDemoLinks(data || null)
      }
    } catch (error) {
      console.error('Unexpected error fetching demo links:', error)
    }
    
    // Minimum loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    setRefreshingDemos(false)
  }

  const approveDemo = async (option: string) => {
    if (!userId || !demoLinks || !user) return

    setApproving(true)
    
    try {
      // First, update the demo approval
      const { error: demoError } = await supabase
        .from('demo_links')
        .update({ 
          approved_option: option,
          approved_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (demoError) {
        throw demoError
      }

      // Get customer kickoff data for email
      const { data: kickoffData } = await supabase
        .from('kickoff_forms')
        .select('business_name, business_description')
        .eq('user_id', userId)
        .maybeSingle()

      // Get the demo URL for the approved option
      const demoUrl = option === '1' ? demoLinks.option_1_url : 
                      option === '2' ? demoLinks.option_2_url : 
                      option === '3' ? demoLinks.option_3_url : null

      // Send demo approval email to admin via API
      try {
        const response = await fetch('/api/send-demo-approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: user.user_metadata?.full_name || user.email?.split('@')[0],
            customerEmail: user.email || '',
            businessName: kickoffData?.business_name || '',
            approvedOption: option,
            demoUrl: demoUrl || undefined,
            approvedAt: new Date().toISOString()
          })
        })

        if (response.ok) {
          console.log('Demo approval email sent successfully')
        } else {
          console.error('Failed to send demo approval email via API:', response.status)
        }
      } catch (emailError) {
        console.error('Failed to send demo approval email:', emailError)
        // Don't throw - we don't want to break the flow if email fails
      }

      // Check if user already has a payment record
      let existingPayment = paymentStatus
      if (!existingPayment) {
        try {
          existingPayment = await getPaymentStatus(userId)
        } catch (error) {
          // No payment record exists, which is fine
        }
      }

      // If no payment exists or previous payment failed, create new payment record
      if (!existingPayment || existingPayment.status === 'failed') {
        const paymentRecord = await createPaymentRecord(userId, 99, user.email)
        setPaymentStatus(paymentRecord)
        
        // Redirect to Stripe payment with payment ID and user email
        redirectToStripePayment(paymentRecord.id, user.email)
      } else if (existingPayment.status === 'completed') {
        // Payment already completed, just refresh the demo links
        try {
          const { data, error } = await supabase
            .from('demo_links')
            .select('option_1_url, option_2_url, option_3_url, approved_option, approved_at')
            .eq('user_id', userId)
            .maybeSingle()

          if (error) {
            console.error('Error fetching demo links:', error)
          } else {
            setDemoLinks(data || null)
          }
        } catch (error) {
          console.error('Unexpected error fetching demo links:', error)
        }
      } else if (existingPayment.status === 'pending') {
        // Payment is pending, redirect to Stripe again with email
        redirectToStripePayment(existingPayment.id, user.email)
      }

    } catch (error) {
      console.error('Error approving demo:', error)
      // Show error to user - you might want to add a toast/notification here
    } finally {
      setApproving(false)
    }
  }

  // Show loading while auth is loading or during initial load
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if user is not authenticated (redirect is happening)
  if (!user) {
    return null
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'not_touched':
        return {
          icon: ExclamationCircleIcon,
          text: 'Noch nicht begonnen',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700',
          description: 'Dein Projekt wurde noch nicht gestartet. Wir beginnen bald mit der Arbeit!'
        }
      case 'in_progress':
        return {
          icon: ClockIcon,
          text: 'In Bearbeitung',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800',
          description: 'Großartig! Die Arbeit an deinem Projekt ist im Gange.'
        }
      case 'complete':
        return {
          icon: CheckCircleIcon,
          text: 'Abgeschlossen',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
          description: 'Glückwunsch! Dein Projekt wurde erfolgreich abgeschlossen.'
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projekt Fortschritt</h2>
                <button
                  onClick={handleRefreshTracker}
                  disabled={refreshingTracker}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Projektstatus aktualisieren"
                >
                  <ArrowPathIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${refreshingTracker ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {statusInfo && (
                <div className={`${statusInfo.bgColor} rounded-xl p-6 mb-6`}>
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
                      Zuletzt aktualisiert: {new Date(projectStatus.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}

              {!statusInfo && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <ComputerDesktopIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400 font-inter">Erste Schritte</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-inter">
                    Willkommen in deinem Projekt-Dashboard! Sobald wir mit der Arbeit an deinem Projekt beginnen, siehst du hier Fortschritt-Updates.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                    Wir senden dir eine E-Mail-Benachrichtigung, wenn die Arbeit beginnt.
                  </p>
                </div>
              )}
            </div>

            {/* Follow-up Questionnaire Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Follow-up Fragebogen</h2>
              </div>
              
              <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <DocumentTextIcon className="w-6 h-6 text-teal-600 dark:text-teal-400 mr-3" />
                  <span className="font-semibold text-teal-600 dark:text-teal-400 font-inter">Zusätzliche Informationen</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4 font-inter">
                  Helfen Sie uns, Ihr Projekt besser zu verstehen, indem Sie unseren detaillierten Follow-up Fragebogen ausfüllen.
                  Ihre Eingaben werden automatisch gespeichert und Sie können jederzeit zurückkehren, um die Bearbeitung fortzusetzen.
                </p>
                <button
                  onClick={() => router.push('/followup-questionnaire')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-inter font-semibold"
                >
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Fragebogen weiterbearbeiten
                </button>
              </div>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Demo Reviews</h2>
                <button
                  onClick={handleRefreshDemos}
                  disabled={refreshingDemos}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Demo-Links aktualisieren"
                >
                  <ArrowPathIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 ${refreshingDemos ? 'animate-spin' : ''}`} />
                </button>
              </div>
              
              {demoLinks?.approved_option ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
                    <span className="font-semibold text-green-600 dark:text-green-400 font-inter">Demo Genehmigt</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4 font-inter">
                    Du hast <strong>Option {demoLinks.approved_option}</strong> am{' '}
                    {demoLinks.approved_at && new Date(demoLinks.approved_at).toLocaleDateString()} genehmigt
                  </p>
                  <a
                    href={(() => {
                      const rawUrl = demoLinks[`option_${demoLinks.approved_option}_url` as keyof DemoLinks] as string
                      return rawUrl?.startsWith('http') ? rawUrl : `https://${rawUrl}`
                    })()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-inter"
                  >
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Genehmigte Demo ansehen
                  </a>
                </div>
              ) : demoLinks && (demoLinks.option_1_url || demoLinks.option_2_url || demoLinks.option_3_url) ? (
                <div className="space-y-6">
                  {/* Payment Status Section */}
                  {paymentStatus && (
                    <div className={`p-4 rounded-xl border ${
                      paymentStatus.status === 'completed' 
                        ? 'bg-green-50 border-green-200'
                        : paymentStatus.status === 'pending'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 font-inter">
                          Zahlungsstatus: 
                        </span>
                        <span className={`text-sm font-semibold ${
                          paymentStatus.status === 'completed' 
                            ? 'text-green-600'
                            : paymentStatus.status === 'pending'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {paymentStatus.status === 'completed' ? 'Abgeschlossen' :
                           paymentStatus.status === 'pending' ? 'Ausstehend' : 'Fehlgeschlagen'}
                        </span>
                        {paymentStatus.amount && (
                          <span className="text-sm text-gray-600 font-inter">
                            ({paymentStatus.amount} CHF)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-gray-700 dark:text-gray-300 font-inter">
                    Überprüfe die Demo-Optionen unten und genehmige deine Lieblingsoption, um mit dem finalen Projekt fortzufahren.
                  </p>
                  
                  <div className="grid gap-6">
                    {[1, 2, 3].map((optionNum) => {
                      const rawUrl = demoLinks[`option_${optionNum}_url` as keyof DemoLinks]
                      if (!rawUrl) return null
                      
                      // Ensure URL is complete - if it doesn't start with http, it's probably a domain or fragment
                      const url = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
                      
                      return (
                        <div key={optionNum} className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-lg">
                            Option {optionNum}
                          </h3>
                          <div className="flex items-center justify-between">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors font-inter"
                            >
                              <EyeIcon className="w-4 h-4 mr-2" />
                              Demo ansehen
                            </a>
                            <button
                              onClick={() => approveDemo(optionNum.toString())}
                              disabled={approving}
                              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-inter font-semibold"
                            >
                              {approving ? 'Wird verarbeitet...' : paymentStatus?.status === 'completed' ? 'Genehmigt & Bezahlt' : 'Genehmigen & Bezahlen (99 CHF)'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                  <div className="flex items-center mb-4">
                    <ComputerDesktopIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
                    <span className="font-semibold text-blue-600 dark:text-blue-400 font-inter">Demos kommen bald</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-inter">
                    Demo-Optionen werden hier angezeigt, sobald wir erste Versionen deines Projekts vorbereitet haben. 
                    Du kannst dann deine bevorzugte Option überprüfen und genehmigen.
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Abrechnung & Abonnement</h2>
              
              <div className="space-y-6">
                {/* Payment Status */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Zahlungsstatus</h3>
                  
                  {paymentStatus ? (
                    <div className={`p-4 rounded-xl border ${
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
                              ? 'text-green-600'
                              : paymentStatus.status === 'pending'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`} />
                          <div>
                            <span className={`font-semibold font-inter ${
                              paymentStatus.status === 'completed' 
                                ? 'text-green-600 dark:text-green-400'
                                : paymentStatus.status === 'pending'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {paymentStatus.status === 'completed' ? 'Zahlung Abgeschlossen' : 
                               paymentStatus.status === 'pending' ? 'Zahlung Ausstehend' : 'Zahlung Fehlgeschlagen'}
                            </span>
                            {paymentStatus.amount && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-inter">
                                Betrag: {paymentStatus.amount} CHF
                              </p>
                            )}
                            {paymentStatus.created_at && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
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
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCardIcon className="w-5 h-5 text-blue-500 mr-3" />
                          <div>
                            <span className="text-blue-700 dark:text-blue-300 font-semibold font-inter">Dashboard verfügbar</span>
                            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 font-inter">
                              Du kannst das Dashboard kostenlos nutzen. Eine Zahlung ist erst nach der Website-Genehmigung erforderlich.
                            </p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={async () => {
                            try {
                              const payment = await createPaymentRecord(user?.id!, PAYMENT_AMOUNT, user?.email)
                              redirectToStripePayment(payment.id, user?.email)
                            } catch (error) {
                              console.error('Error creating payment:', error)
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-inter"
                        >
                          Bezahlen (optional)
                        </motion.button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subscription Management */}
                <div className={`${customerDetails?.stripe_customer_id ? 'border-b border-gray-200 dark:border-gray-700 pb-6' : ''}`}>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Abonnement-Verwaltung</h3>
                  
                  {customerDetails?.stripe_customer_id ? (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                          <div>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold font-inter">Aktives Abonnement</span>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-inter">
                              Verwalte dein Abonnement, aktualisiere Zahlungsmethoden und sieh die Rechnungshistorie ein.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleManageSubscription}
                          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 font-inter text-sm font-semibold"
                        >
                          Abonnement Verwalten
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-gray-700 dark:text-gray-300 font-inter">Kein aktives Abonnement</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-inter">
                            Dein Abonnement wird nach der ersten abgeschlossenen Zahlung aktiviert.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Information - Only show if customer has active subscription */}
                {customerDetails?.stripe_customer_id && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Rechnungsinformationen</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 font-inter">Monatliches Abonnement</span>
                          <span className="font-semibold text-gray-900 dark:text-white">99 CHF</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400 font-inter">Setup-Gebühr</span>
                          <span className="font-semibold text-gray-900 dark:text-white">0 CHF</span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900 dark:text-white font-inter">Gesamt pro Monat</span>
                            <span className="font-bold text-lg text-gray-900 dark:text-white">99 CHF</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-inter">
                        <strong>Hinweis:</strong> Du zahlst erst nach der Genehmigung deines Website-Designs. 
                        Keine versteckten Gebühren, keine langfristigen Verträge. Jederzeit über das Kundenportal kündbar.
                      </p>
                    </div>
                  </div>
                )}
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Konto-Einstellungen</h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profil-Informationen</h3>
                  <div className="flex items-center space-x-4">
                    <UserCircleIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white font-inter">
                        {user?.email}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                        Konto erstellt: {user?.created_at && new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Benachrichtigungen</h3>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700" 
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">E-Mail-Benachrichtigungen für Projekt-Updates</span>
                    </label>
                    <label className="flex items-center">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700" 
                      />
                      <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">E-Mail-Benachrichtigungen für Demo-Verfügbarkeit</span>
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
