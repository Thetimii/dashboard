'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
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
  ComputerDesktopIcon
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
  const [activeTab, setActiveTab] = useState<'tracker' | 'demos' | 'settings'>('tracker')
  const [projectStatus, setProjectStatus] = useState<ProjectStatus | null>(null)
  const [demoLinks, setDemoLinks] = useState<DemoLinks | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const { user, signOut } = useAuth()
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

  const approveDemo = async (option: string) => {
    if (!user || !demoLinks) return

    setApproving(true)
    const { error } = await supabase
      .from('demo_links')
      .update({ 
        approved_option: option,
        approved_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Error approving demo:', error)
    } else {
      await fetchDemoLinks()
    }
    setApproving(false)
  }

  useEffect(() => {
    if (!user) {
      router.push('/signin')
      return
    }

    const loadData = async () => {
      await Promise.all([
        checkKickoffCompletion(),
        fetchProjectStatus(),
        fetchDemoLinks()
      ])
      setLoading(false)
    }

    loadData()
  }, [user, router, checkKickoffCompletion, fetchProjectStatus, fetchDemoLinks])

  if (loading) {
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
    setActiveTab(tab as 'tracker' | 'demos' | 'settings')
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
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white mb-6">Project Progress</h2>
              
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
              <h2 className="text-xl font-serif font-semibold text-gray-900 dark:text-white mb-6">Demo Reviews</h2>
              
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
                              {approving ? 'Approving...' : 'Approve This Option'}
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

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 font-inter">Billing</h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <CreditCardIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <span className="text-gray-700 dark:text-gray-300 font-inter">Payment Status</span>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs font-semibold rounded font-inter">
                        Paid
                      </span>
                    </div>
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
