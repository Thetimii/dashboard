'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  ChartBarIcon,
  ComputerDesktopIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline'

const tabs = [
  { id: 'tracker', label: 'Project Tracker', icon: ChartBarIcon },
  { id: 'demos', label: 'Demo Reviews', icon: ComputerDesktopIcon },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-serif font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <ThemeToggle />
          </div>
          
          {/* User Info */}
          <div className="mt-4 flex items-center space-x-3">
            <UserCircleIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white font-sans">
                {user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 font-sans ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              )
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-sans"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </motion.button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
