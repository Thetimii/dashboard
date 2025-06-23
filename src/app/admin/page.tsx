'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { 
  UsersIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  EyeIcon,
  PencilIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: string
  full_name: string
  role: 'user' | 'admin'
  created_at: string
}

interface ClientData {
  user_profile: UserProfile
  kickoff_form?: any
  project_status?: any
  demo_links?: any
  followup_questionnaire?: any
  payment?: any
  assignment?: any
}

interface AdminData {
  id: string
  full_name: string
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'clients' | 'assignments' | 'overview'>('clients')
  const [clients, setClients] = useState<ClientData[]>([])
  const [admins, setAdmins] = useState<AdminData[]>([])
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_touched' | 'in_progress' | 'complete' | 'live'>('all')
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'assigned' | 'unassigned' | 'my_clients'>('all')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigningClient, setAssigningClient] = useState<string | null>(null)
  const [selectedAdmin, setSelectedAdmin] = useState<string>('')
  
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  // Check admin access - memoized to prevent constant re-checking
  const checkAdminAccess = useCallback(async () => {
    try {
      // Try to fetch clients - if the user is not an admin, this will fail
      const response = await fetch('/api/admin?action=clients')
      if (!response.ok) {
        if (response.status === 403) {
          router.push('/dashboard')
          return
        }
        throw new Error('Failed to check admin access')
      }
      
      loadData()
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    }
  }, [router])

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/signin')
      return
    }

    // Only check admin access once when user is loaded
    checkAdminAccess()
  }, [user?.id, authLoading, checkAdminAccess]) // Use user.id instead of user object to prevent constant changes

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadClients(),
        loadAdmins()
      ])
    } finally {
      setLoading(false)
    }
  }

  const loadClients = async () => {
    try {
      const response = await fetch('/api/admin?action=clients')
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      const data = await response.json()
      setClients(data.clients)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadAdmins = async () => {
    try {
      const response = await fetch('/api/admin?action=admins')
      if (!response.ok) {
        throw new Error('Failed to fetch admins')
      }
      const data = await response.json()
      setAdmins(data.admins)
    } catch (error) {
      console.error('Error loading admins:', error)
    }
  }

  const updateProjectStatus = async (userId: string, status: string, finalUrl?: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_project_status',
          userId,
          status,
          finalUrl
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update project status')
      }
      
      toast.success('Project status updated successfully!')
      await loadClients()
    } catch (error) {
      console.error('Error updating project status:', error)
      toast.error('Failed to update project status')
    }
  }

  const updateDemoLinks = async (userId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_demo_links',
          userId,
          updates
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to update demo links')
      }
      
      toast.success('Demo links updated successfully!')
      await loadClients()
    } catch (error) {
      console.error('Error updating demo links:', error)
      toast.error('Failed to update demo links')
    }
  }

  const assignClient = async (clientId: string, adminId: string) => {
    try {
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_client',
          clientId,
          adminId
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to assign client')
      }
      
      toast.success('Client assigned successfully!')
      setShowAssignModal(false)
      setAssigningClient(null)
      setSelectedAdmin('')
      await loadClients()
    } catch (error) {
      console.error('Error assigning client:', error)
      toast.error('Failed to assign client')
    }
  }

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.user_profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         client.user_profile.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || client.project_status?.status === statusFilter
    
    const matchesAssignment = assignmentFilter === 'all' || 
                             (assignmentFilter === 'assigned' && client.assignment) ||
                             (assignmentFilter === 'unassigned' && !client.assignment) ||
                             (assignmentFilter === 'my_clients' && client.assignment?.admin_id === user?.id)

    return matchesSearch && matchesStatus && matchesAssignment
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_touched': return 'bg-gray-200 text-gray-900 border-2 border-gray-400 font-bold'
      case 'in_progress': return 'bg-yellow-200 text-yellow-900 border-2 border-yellow-500 font-bold'
      case 'complete': return 'bg-green-200 text-green-900 border-2 border-green-500 font-bold'
      case 'live': return 'bg-blue-200 text-blue-900 border-2 border-blue-500 font-bold'
      default: return 'bg-gray-200 text-gray-900 border-2 border-gray-400 font-bold'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not_touched': return <ClockIcon className="h-4 w-4" />
      case 'in_progress': return <ExclamationCircleIcon className="h-4 w-4" />
      case 'complete': case 'live': return <CheckCircleIcon className="h-4 w-4" />
      default: return <ClockIcon className="h-4 w-4" />
    }
  }

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-gray-800 font-semibold">Manage clients, projects, and assignments</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-900 font-bold">Welcome, Admin</span>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('clients')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'clients'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-800 hover:text-gray-900 hover:border-gray-500 font-semibold'
              }`}
            >
              <UsersIcon className="h-5 w-5 inline mr-2" />
              Client Management
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-800 hover:text-gray-900 hover:border-gray-500 font-semibold'
              }`}
            >
              <UserGroupIcon className="h-5 w-5 inline mr-2" />
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-800 hover:text-gray-900 hover:border-gray-500 font-semibold'
              }`}
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Overview
            </button>
          </nav>
        </div>

        {/* Client Management Tab */}
        {activeTab === 'clients' && (
          <div>
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Search Clients</label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-600" />
                    <input
                      type="text"
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Project Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all" className="text-gray-900 font-medium">All Statuses</option>
                    <option value="not_touched" className="text-gray-900 font-medium">Not Touched</option>
                    <option value="in_progress" className="text-gray-900 font-medium">In Progress</option>
                    <option value="complete" className="text-gray-900 font-medium">Complete</option>
                    <option value="live" className="text-gray-900 font-medium">Live</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3">Assignment Status</label>
                  <select
                    value={assignmentFilter}
                    onChange={(e) => setAssignmentFilter(e.target.value as any)}
                    className="w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all" className="text-gray-900 font-medium">All Clients</option>
                    <option value="assigned" className="text-gray-900 font-medium">Assigned</option>
                    <option value="unassigned" className="text-gray-900 font-medium">Unassigned</option>
                    <option value="my_clients" className="text-gray-900 font-medium">My Clients</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Clients Table */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredClients.map((client) => (
                  <li key={client.user_profile.id} className="hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-indigo-800 flex items-center justify-center border-4 border-indigo-300 shadow-lg">
                              <span className="text-sm font-medium text-white">
                                {client.user_profile.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-indigo-600">
                                {client.user_profile.full_name || 'Unnamed User'}
                              </p>
                              <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(client.project_status?.status || 'not_touched')}`}>
                                {getStatusIcon(client.project_status?.status || 'not_touched')}
                                <span className="ml-1">{client.project_status?.status || 'not_touched'}</span>
                              </span>
                            </div>
                            <div className="mt-2 flex items-center text-sm text-gray-900 font-semibold">
                              <p>
                                Created: {new Date(client.user_profile.created_at).toLocaleDateString()}
                                {client.assignment && (
                                  <span className="ml-4">
                                    Assigned to: {client.assignment.admin?.full_name}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedClient(client)}
                            className="inline-flex items-center px-3 py-2 border-2 border-gray-600 shadow-lg text-sm leading-4 font-bold rounded-md text-gray-900 bg-white hover:bg-gray-100 hover:border-gray-800 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setAssigningClient(client.user_profile.id)
                              setSelectedAdmin(client.assignment?.admin_id || '')
                              setShowAssignModal(true)
                            }}
                            className="inline-flex items-center px-3 py-2 border-2 border-gray-600 shadow-lg text-sm leading-4 font-bold rounded-md text-gray-900 bg-white hover:bg-gray-100 hover:border-gray-800 transition-colors"
                          >
                            <UserPlusIcon className="h-4 w-4 mr-1" />
                            {client.assignment ? 'Reassign' : 'Assign'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-6 border-2 border-gray-300 w-96 shadow-2xl rounded-lg bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Assign Client</h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-1 rounded"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-900 mb-3">
                    Select Admin
                  </label>
                  <select
                    value={selectedAdmin}
                    onChange={(e) => setSelectedAdmin(e.target.value)}
                    className="w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" className="text-gray-900 font-medium">Select an admin...</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id} className="text-gray-900 font-medium">
                        {admin.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-900 bg-white border-2 border-gray-400 rounded-md hover:bg-gray-100 hover:border-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => assigningClient && selectedAdmin && assignClient(assigningClient, selectedAdmin)}
                    disabled={!selectedAdmin}
                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 border-2 border-blue-600 rounded-md hover:bg-blue-700 hover:border-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Client Detail Modal */}
        {selectedClient && (
          <ClientDetailModal 
            client={selectedClient}
            onClose={() => setSelectedClient(null)}
            onUpdateProjectStatus={updateProjectStatus}
            onUpdateDemoLinks={updateDemoLinks}
            onRefresh={loadClients}
          />
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Client Assignments</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  View and manage client assignments to different admins.
                </p>
              </div>
            </div>

            {/* Assignments by Admin */}
            <div className="space-y-6">
              {admins.map((admin) => {
                const adminClients = clients.filter(client => client.assignment?.admin_id === admin.id)
                return (
                  <div key={admin.id} className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{admin.full_name}</h3>
                          <p className="text-sm text-gray-900 font-bold">{adminClients.length} clients assigned</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            adminClients.length > 0 ? 'bg-blue-200 text-blue-900 border-2 border-blue-500 font-bold' : 'bg-gray-200 text-gray-900 border-2 border-gray-500 font-bold'
                          }`}>
                            {adminClients.length} clients
                          </span>
                        </div>
                      </div>
                    </div>
                    {adminClients.length > 0 && (
                      <div className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {adminClients.map((client) => (
                            <div key={client.user_profile.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-gray-900">
                                  {client.user_profile.full_name || 'Unnamed User'}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.project_status?.status || 'not_touched')}`}>
                                  {getStatusIcon(client.project_status?.status || 'not_touched')}
                                  <span className="ml-1">{client.project_status?.status || 'not_touched'}</span>
                                </span>
                              </div>
                              <p className="text-xs text-gray-900 font-bold mb-3">
                                Created: {new Date(client.user_profile.created_at).toLocaleDateString()}
                              </p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => setSelectedClient(client)}
                                  className="flex-1 text-xs px-3 py-2 bg-blue-100 text-blue-800 font-bold rounded-lg hover:bg-blue-200 border border-blue-300 transition-colors"
                                >
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    setAssigningClient(client.user_profile.id)
                                    setSelectedAdmin('')
                                    setShowAssignModal(true)
                                  }}
                                  className="flex-1 text-xs px-3 py-2 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 border border-gray-400 transition-colors"
                                >
                                  Reassign
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Unassigned Clients */}
              {(() => {
                const unassignedClients = clients.filter(client => !client.assignment)
                if (unassignedClients.length === 0) return null
                
                return (
                  <div className="bg-white shadow rounded-lg">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Unassigned Clients</h3>
                          <p className="text-sm text-gray-900 font-bold">{unassignedClients.length} clients need assignment</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-200 text-yellow-900 border-2 border-yellow-500">
                          {unassignedClients.length} unassigned
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {unassignedClients.map((client) => (
                          <div key={client.user_profile.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">
                                {client.user_profile.full_name || 'Unnamed User'}
                              </h4>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.project_status?.status || 'not_touched')}`}>
                                {getStatusIcon(client.project_status?.status || 'not_touched')}
                                <span className="ml-1">{client.project_status?.status || 'not_touched'}</span>
                              </span>
                            </div>
                            <p className="text-xs text-gray-900 font-bold mb-3">
                              Created: {new Date(client.user_profile.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setSelectedClient(client)}
                                className="flex-1 text-xs px-3 py-2 bg-blue-100 text-blue-800 font-bold rounded-lg hover:bg-blue-200 border border-blue-300 transition-colors"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  setAssigningClient(client.user_profile.id)
                                  setSelectedAdmin('')
                                  setShowAssignModal(true)
                                }}
                                className="flex-1 text-xs px-3 py-2 bg-yellow-200 text-yellow-900 font-bold rounded-lg hover:bg-yellow-300 border border-yellow-400 transition-colors"
                              >
                                Assign
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UsersIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                        <dd className="text-lg font-medium text-gray-900">{clients.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">In Progress</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {clients.filter(c => c.project_status?.status === 'in_progress').length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-8 w-8 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {clients.filter(c => ['complete', 'live'].includes(c.project_status?.status)).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <UserGroupIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Assigned</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {clients.filter(c => c.assignment).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Client Activity</h3>
                <p className="mt-1 text-sm text-gray-500">Latest client registrations and project updates</p>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  {clients
                    .sort((a, b) => new Date(b.user_profile.created_at).getTime() - new Date(a.user_profile.created_at).getTime())
                    .slice(0, 10)
                    .map((client) => (
                      <li key={client.user_profile.id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                <span className="text-xs font-medium text-white">
                                  {client.user_profile.full_name?.charAt(0) || 'U'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {client.user_profile.full_name || 'Unnamed User'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Joined {new Date(client.user_profile.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.project_status?.status || 'not_touched')}`}>
                              {client.project_status?.status || 'not_touched'}
                            </span>
                            {client.assignment && (
                              <span className="text-xs text-gray-500">
                                → {client.assignment.admin?.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Client Detail Modal Component
function ClientDetailModal({ 
  client, 
  onClose, 
  onUpdateProjectStatus, 
  onUpdateDemoLinks, 
  onRefresh 
}: {
  client: ClientData
  onClose: () => void
  onUpdateProjectStatus: (userId: string, status: string, finalUrl?: string) => Promise<void>
  onUpdateDemoLinks: (userId: string, updates: any) => Promise<void>
  onRefresh: () => Promise<void>
}) {
  const [editingStatus, setEditingStatus] = useState(false)
  const [editingDemos, setEditingDemos] = useState(false)
  const [newStatus, setNewStatus] = useState(client.project_status?.status || 'not_touched')
  const [finalUrl, setFinalUrl] = useState(client.project_status?.final_url || '')
  const [demoUrl1, setDemoUrl1] = useState(client.demo_links?.option_1_url || '')
  const [demoUrl2, setDemoUrl2] = useState(client.demo_links?.option_2_url || '')
  const [demoUrl3, setDemoUrl3] = useState(client.demo_links?.option_3_url || '')

  const handleStatusUpdate = async () => {
    await onUpdateProjectStatus(client.user_profile.id, newStatus, finalUrl)
    setEditingStatus(false)
    onRefresh()
  }

  const handleDemoUpdate = async () => {
    await onUpdateDemoLinks(client.user_profile.id, {
      option_1_url: demoUrl1,
      option_2_url: demoUrl2,
      option_3_url: demoUrl3
    })
    setEditingDemos(false)
    onRefresh()
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border-2 border-gray-300 w-full max-w-4xl shadow-2xl rounded-lg bg-white m-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Client Details - {client.user_profile.full_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Info */}
          <div className="bg-gray-100 p-5 rounded-lg border border-gray-300">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h4>
            <div className="space-y-3">
              <p className="text-gray-900"><span className="font-bold">Name:</span> <span className="font-semibold">{client.user_profile.full_name}</span></p>
              <p className="text-gray-900"><span className="font-bold">User ID:</span> <span className="font-semibold">{client.user_profile.id}</span></p>
              <p className="text-gray-900"><span className="font-bold">Created:</span> <span className="font-semibold">{new Date(client.user_profile.created_at).toLocaleDateString()}</span></p>
              <p className="text-gray-900"><span className="font-bold">Payment Status:</span> <span className={`font-bold ${client.payment ? 'text-green-800' : 'text-red-800'}`}>{client.payment ? 'Paid' : 'Not Paid'}</span></p>
            </div>
          </div>

          {/* Project Status */}
          <div className="bg-gray-100 p-5 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Project Status</h4>
              <button
                onClick={() => setEditingStatus(!editingStatus)}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            {editingStatus ? (
              <div className="space-y-4">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="not_touched" className="text-gray-900 font-medium">Not Touched</option>
                  <option value="in_progress" className="text-gray-900 font-medium">In Progress</option>
                  <option value="complete" className="text-gray-900 font-medium">Complete</option>
                  <option value="live" className="text-gray-900 font-medium">Live</option>
                </select>
                <input
                  type="url"
                  placeholder="Final URL (if live)"
                  value={finalUrl}
                  onChange={(e) => setFinalUrl(e.target.value)}
                  className="w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleStatusUpdate}
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 border-2 border-blue-600 hover:border-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingStatus(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 border-2 border-gray-400 hover:border-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-gray-900"><span className="font-bold">Status:</span> <span className="font-semibold">{client.project_status?.status || 'not_touched'}</span></p>
                {client.project_status?.final_url && (
                  <p className="text-gray-900"><span className="font-bold">Final URL:</span> 
                    <a href={client.project_status.final_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 hover:underline ml-2 font-semibold">
                      {client.project_status.final_url}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Demo Links */}
          <div className="bg-gray-100 p-5 rounded-lg border border-gray-300">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-gray-900">Demo Links</h4>
              <button
                onClick={() => setEditingDemos(!editingDemos)}
                className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 p-2 rounded-lg transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            </div>
            {editingDemos ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Demo Option 1 URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/demo1"
                    value={demoUrl1}
                    onChange={(e) => setDemoUrl1(e.target.value)}
                    className="w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Demo Option 2 URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/demo2"
                    value={demoUrl2}
                    onChange={(e) => setDemoUrl2(e.target.value)}
                    className="w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Demo Option 3 URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/demo3"
                    value={demoUrl3}
                    onChange={(e) => setDemoUrl3(e.target.value)}
                    className="w-full border-2 border-gray-400 rounded-lg px-4 py-3 text-gray-900 font-medium bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600 transition-colors"
                  />
                </div>
                <div className="flex space-x-3 pt-2">
                  <button
                    onClick={handleDemoUpdate}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg border-2 border-blue-600"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingDemos(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-bold hover:bg-gray-300 transition-colors border-2 border-gray-400 hover:border-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {client.demo_links?.option_1_url && (
                  <p className="text-gray-900"><span className="font-bold">Option 1:</span> 
                    <a href={client.demo_links.option_1_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 hover:underline ml-2 font-semibold">
                      View Demo
                    </a>
                  </p>
                )}
                {client.demo_links?.option_2_url && (
                  <p className="text-gray-900"><span className="font-bold">Option 2:</span> 
                    <a href={client.demo_links.option_2_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 hover:underline ml-2 font-semibold">
                      View Demo
                    </a>
                  </p>
                )}
                {client.demo_links?.option_3_url && (
                  <p className="text-gray-900"><span className="font-bold">Option 3:</span> 
                    <a href={client.demo_links.option_3_url} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900 hover:underline ml-2 font-semibold">
                      View Demo
                    </a>
                  </p>
                )}
                {client.demo_links?.approved_option && (
                  <p className="text-gray-900"><span className="font-bold">Approved:</span> <span className="font-semibold text-green-800">{client.demo_links.approved_option}</span></p>
                )}
                {!client.demo_links?.option_1_url && !client.demo_links?.option_2_url && !client.demo_links?.option_3_url && (
                  <p className="text-gray-600 font-medium italic">No demo links available</p>
                )}
              </div>
            )}
          </div>

          {/* Kickoff Form */}
          {client.kickoff_form && (
            <div className="bg-gray-100 p-5 rounded-lg border border-gray-300">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Kickoff Form</h4>
              <div className="space-y-3 text-sm">
                <p className="text-gray-900"><span className="font-bold">Business:</span> <span className="font-semibold">{client.kickoff_form.business_name}</span></p>
                <p className="text-gray-900"><span className="font-bold">Description:</span> <span className="font-semibold">{client.kickoff_form.business_description}</span></p>
                <p className="text-gray-900"><span className="font-bold">Completed:</span> <span className={`font-bold ${client.kickoff_form.completed ? 'text-green-800' : 'text-red-800'}`}>{client.kickoff_form.completed ? 'Yes' : 'No'}</span></p>
              </div>
            </div>
          )}

          {/* Follow-up Questionnaire */}
          {client.followup_questionnaire && (
            <div className="bg-gray-100 p-5 rounded-lg border border-gray-300 lg:col-span-2">
              <h4 className="text-lg font-bold text-gray-900 mb-4">Follow-up Questionnaire</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <p className="text-gray-900"><span className="font-bold">Completed:</span> <span className={`font-bold ${client.followup_questionnaire.completed ? 'text-green-800' : 'text-red-800'}`}>{client.followup_questionnaire.completed ? 'Yes' : 'No'}</span></p>
                <p className="text-gray-900"><span className="font-bold">Core Business:</span> <span className="font-semibold">{client.followup_questionnaire.core_business}</span></p>
                <p className="text-gray-900"><span className="font-bold">Target Group:</span> <span className="font-semibold">{client.followup_questionnaire.target_group_demographics}</span></p>
                <p className="text-gray-900"><span className="font-bold">Domain:</span> <span className="font-semibold">{client.followup_questionnaire.desired_domain}</span></p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#111827',
            border: '2px solid #6b7280',
            borderRadius: '0.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            fontWeight: '600',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  )
}
