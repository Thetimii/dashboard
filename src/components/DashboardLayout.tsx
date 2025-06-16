'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'
import { 
  ChartBarIcon,
  ComputerDesktopIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const tabs = [
  { id: 'tracker', label: 'Projekt Status', icon: ChartBarIcon },
  { id: 'demos', label: 'Demo Reviews', icon: ComputerDesktopIcon },
  { id: 'billing', label: 'Abrechnung', icon: CreditCardIcon },
  { id: 'settings', label: 'Einstellungen', icon: Cog6ToothIcon },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl flex flex-col border-r border-gray-200 dark:border-gray-700 fixed h-screen z-30">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Logo size="md" className="flex-shrink-0" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Customer Flows
              </h1>
            </div>
            <ThemeToggle />
          </div>
          
          {/* User Info */}
          <div className="mt-4 flex items-center space-x-3">
            <UserCircleIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white font-inter">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          <nav className="space-y-2 px-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 font-inter ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              )
            })}
          </nav>
        </div>

        {/* Help & Feedback */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="mb-3">
            <div className="flex items-center space-x-2 mb-2">
              <QuestionMarkCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 font-inter">
                Hilfe & Feedback
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-inter leading-relaxed">
              Brauchst du Hilfe oder möchtest Feedback geben? Wir freuen uns auf deine Nachricht!
            </p>
            <div className="space-y-2">
              <a
                href="mailto:info@customerflows.ch"
                className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors text-xs font-inter"
              >
                <EnvelopeIcon className="w-4 h-4" />
                <span>info@customerflows.ch</span>
              </a>
              <a
                href="https://wa.me/41784462524"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors text-xs font-inter"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                <span>+41 78 446 2524</span>
              </a>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-xl transition-all duration-300 font-inter"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Abmelden</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
