'use client'

import { useState, useEffect, useCallback } from 'react'
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
  ArrowPathIcon,
  DocumentTextIcon,
  CogIcon
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
  // All state hooks first
  const [activeTab, setActiveTab] = useState<'tracker' | 'demos' | 'billing' | 'settings'>('tracker')
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null)
  const [demoLinks, setDemoLinks] = useState<DemoLinks | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<any>(null)
  const [customerDetails, setCustomerDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [refreshingTracker, setRefreshingTracker] = useState(false)
  const [refreshingDemos, setRefreshingDemos] = useState(false)

  // All context hooks
  const { user, loading: authLoading, signOut } = useAuth()
  const router = useRouter()

  // All other hooks
  const supabase = createClient()

  // All useCallback hooks (simplified)
  const fetchProjectStatus = useCallback(async () => {
    if (!user) return
    try {
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
    } catch (error) {
      console.error('Error fetching project status:', error)
    }
  }, [user, supabase])

  const fetchDemoLinks = useCallback(async () => {
    if (!user) return
    try {
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
    } catch (error) {
      console.error('Error fetching demo links:', error)
    }
  }, [user, supabase])

  const fetchPaymentStatus = useCallback(async () => {
    if (!user) return
    try {
      const payment = await getPaymentStatus(user.id)
      setPaymentStatus(payment)
    } catch (error) {
      console.log('Payment status check failed:', error)
      setPaymentStatus(null)
    }
  }, [user])

  const fetchCustomerDetails = useCallback(async () => {
    if (!user) return
    try {
      const customer = await getCustomerDetails(user.id)
      setCustomerDetails(customer)
    } catch (error) {
      console.log('Customer details check failed:', error)
      setCustomerDetails(null)
    }
  }, [user])

  // Main useEffect
  useEffect(() => {
    if (!user || authLoading) return

    const loadData = async () => {
      try {
        await Promise.all([
          fetchProjectStatus(),
          fetchDemoLinks(),
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, authLoading, fetchProjectStatus, fetchDemoLinks])

  // Payment data useEffect
  useEffect(() => {
    if (activeTab === 'billing' && user && !paymentStatus && !customerDetails) {
      Promise.all([
        fetchPaymentStatus().catch(() => setPaymentStatus(null)),
        fetchCustomerDetails().catch(() => setCustomerDetails(null))
      ])
    }
  }, [activeTab, user, paymentStatus, customerDetails, fetchPaymentStatus, fetchCustomerDetails])

  // Early returns after ALL hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Authentifizierung wird überprüft...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/signin')
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Dashboard wird geladen...</p>
        </div>
      </div>
    )
  }

  // Helper functions
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

  // Render the dashboard
  return (
    <DashboardLayout 
      activeTab={activeTab} 
      onTabChange={(tab) => setActiveTab(tab as 'tracker' | 'demos' | 'billing' | 'settings')}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Verwalte dein Projekt und verfolge den Fortschritt</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'tracker', name: 'Projekt Tracker', icon: ComputerDesktopIcon },
              { id: 'demos', name: 'Demo Optionen', icon: EyeIcon },
              { id: 'billing', name: 'Abrechnung', icon: CreditCardIcon },
              { id: 'settings', name: 'Einstellungen', icon: CogIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon
                  className={`mr-2 h-5 w-5 transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-teal-500 dark:text-teal-400' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'tracker' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projekt Fortschritt</h2>
                <button
                  onClick={() => fetchProjectStatus()}
                  disabled={refreshingTracker}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Projektstatus aktualisieren"
                >
                  <ArrowPathIcon className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${refreshingTracker ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {statusInfo && (
                <div className={`rounded-2xl p-6 ${statusInfo.bgColor} transition-all duration-300`}>
                  <div className="flex items-center mb-4">
                    <statusInfo.icon className={`h-8 w-8 ${statusInfo.color} mr-3`} />
                    <h3 className={`text-xl font-semibold ${statusInfo.color}`}>
                      {statusInfo.text}
                    </h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {statusInfo.description}
                  </p>
                  {projectStatus && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      Zuletzt aktualisiert: {new Date(projectStatus.updated_at).toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              )}

              {!statusInfo && (
                <div className="text-center py-12">
                  <ComputerDesktopIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Noch keine Projektdaten</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Dein Projekt wird bald hier erscheinen. Wir arbeiten bereits daran!
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'demos' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Demo Optionen</h2>
                <button
                  onClick={() => fetchDemoLinks()}
                  disabled={refreshingDemos}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="Demo-Links aktualisieren"
                >
                  <ArrowPathIcon className={`h-5 w-5 text-gray-600 dark:text-gray-400 ${refreshingDemos ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {demoLinks && (demoLinks.option_1_url || demoLinks.option_2_url || demoLinks.option_3_url) ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((optionNum) => {
                    const url = demoLinks[`option_${optionNum}_url` as keyof DemoLinks] as string | null
                    if (!url) return null
                    
                    const isApproved = demoLinks.approved_option === optionNum.toString()
                    
                    return (
                      <div
                        key={optionNum}
                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                          isApproved
                            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-teal-200 dark:hover:border-teal-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                              isApproved 
                                ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' 
                                : 'bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400'
                            }`}>
                              {isApproved ? (
                                <CheckCircleIcon className="h-6 w-6" />
                              ) : (
                                <span className="font-semibold">{optionNum}</span>
                              )}
                            </div>
                            <div>
                              <h3 className={`font-semibold ${
                                isApproved 
                                  ? 'text-green-900 dark:text-green-100' 
                                  : 'text-gray-900 dark:text-white'
                              }`}>
                                Demo Option {optionNum}
                                {isApproved && <span className="ml-2 text-green-600 dark:text-green-400">(Ausgewählt)</span>}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Verfügbar seit {new Date().toLocaleDateString('de-DE')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 transition-colors duration-300"
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Ansehen
                            </a>
                            {!isApproved && !demoLinks.approved_option && (
                              <button
                                onClick={() => {/* approveDemo(optionNum.toString()) */}}
                                disabled={approving}
                                className="inline-flex items-center px-4 py-2 border border-teal-600 dark:border-teal-500 text-sm font-medium rounded-lg text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {approving ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600 mr-2"></div>
                                    Verarbeitung...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                                    Auswählen
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <EyeIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Noch keine Demos verfügbar</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Sobald dein Projekt fertig ist, findest du hier verschiedene Demo-Optionen.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'billing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Abrechnung & Zahlung</h2>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <BellIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                      Zahlung nach Demo-Freigabe
                    </h3>
                    <div className="mt-2 text-blue-700 dark:text-blue-300">
                      <p>Du zahlst nur, wenn du mit einer Demo-Option zufrieden bist und diese freigibst.</p>
                      <p className="mt-2 font-semibold">Preis: €{PAYMENT_AMOUNT}</p>
                    </div>
                  </div>
                </div>
              </div>

              {paymentStatus && (
                <div className={`rounded-xl p-6 mb-6 ${
                  paymentStatus.status === 'completed' 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : paymentStatus.status === 'pending'
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    paymentStatus.status === 'completed' 
                      ? 'text-green-900 dark:text-green-100'
                      : paymentStatus.status === 'pending'
                      ? 'text-yellow-900 dark:text-yellow-100'
                      : 'text-red-900 dark:text-red-100'
                  }`}>
                    Zahlungsstatus: {
                      paymentStatus.status === 'completed' ? 'Bezahlt' :
                      paymentStatus.status === 'pending' ? 'Ausstehend' :
                      'Fehlgeschlagen'
                    }
                  </h3>
                  <p className={`${
                    paymentStatus.status === 'completed' 
                      ? 'text-green-700 dark:text-green-300'
                      : paymentStatus.status === 'pending'
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : 'text-red-700 dark:text-red-300'
                  }`}>
                    {paymentStatus.status === 'completed' && 'Vielen Dank für deine Zahlung!'}
                    {paymentStatus.status === 'pending' && 'Deine Zahlung wird noch verarbeitet.'}
                    {paymentStatus.status === 'failed' && 'Es gab ein Problem mit deiner Zahlung.'}
                  </p>
                </div>
              )}

              {!paymentStatus && (
                <div className="text-center py-8">
                  <CreditCardIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Noch keine Zahlung erforderlich</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Die Zahlung wird erst fällig, wenn du eine Demo-Option freigibst.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Einstellungen</h2>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        E-Mail
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-900 dark:text-white">{user?.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Vollständiger Name
                      </label>
                      <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-gray-900 dark:text-white">
                          {user?.user_metadata?.full_name || 'Nicht angegeben'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Account Aktionen</h3>
                  <button
                    onClick={signOut}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-300"
                  >
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
