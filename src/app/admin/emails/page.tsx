'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import { 
  EnvelopeIcon, 
  EyeIcon, 
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon 
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

interface EmailSend {
  id: string
  user_id: string
  email_type: string
  sent_at: string
  sent_by: string
  trigger_values: any
  email_subject: string
  email_recipient: string
  status: string
  error_message?: string
  user_profiles: { full_name: string }
  kickoff_forms?: { business_name: string }[]
  sent_by_profile: { full_name: string }
}

interface User {
  id: string
  email: string
  full_name: string
  business_name?: string
}

export default function EmailManagementPage() {
  const [emailHistory, setEmailHistory] = useState<EmailSend[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [emailType, setEmailType] = useState<'demo_ready' | 'website_launch' | ''>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sendingEmail, setSendingEmail] = useState<string | null>(null)
  const [emailStatus, setEmailStatus] = useState<{[key: string]: { canSend: boolean; reason: string }}>({})
  
  const router = useRouter()
  const supabase = createClient()

  const loadEmailHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_email_sends')
        .select(`
          *,
          user_profiles!manual_email_sends_user_id_fkey(full_name),
          sent_by_profile:user_profiles!manual_email_sends_sent_by_fkey(full_name),
          kickoff_forms(business_name)
        `)
        .order('sent_at', { ascending: false })
        .limit(200)
      
      if (error) {
        console.error('Error loading email history:', error)
        toast.error('Failed to load email history')
        return
      }

      setEmailHistory(data || [])
    } catch (error) {
      console.error('Error loading email history:', error)
      toast.error('Failed to load email history')
    }
  }

  const loadUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select(`
          id, 
          full_name,
          kickoff_forms(business_name)
        `)
        .eq('role', 'user')
        .order('full_name')
      
      if (profiles) {
        // Get email addresses from auth
        const { data: authData } = await supabase.auth.admin.listUsers()
        
        const usersWithEmail = profiles.map((profile: any) => {
          const authUser = authData.users.find((u: any) => u.id === profile.id)
          return {
            id: profile.id,
            email: authUser?.email || '',
            full_name: profile.full_name,
            business_name: profile.kickoff_forms?.[0]?.business_name
          }
        }).filter((user: any) => user.email) // Only include users with email
        
        setUsers(usersWithEmail)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    }
  }

  const checkEmailStatus = async (userId: string, emailType: 'demo_ready' | 'website_launch') => {
    try {
      const response = await fetch(
        `/api/admin/send-manual-email?userId=${userId}&emailType=${emailType}`
      )
      const data = await response.json()
      
      setEmailStatus(prev => ({
        ...prev,
        [`${userId}_${emailType}`]: {
          canSend: data.canSend,
          reason: data.reason
        }
      }))
      
      return data
    } catch (error) {
      console.error('Error checking email status:', error)
      return { canSend: false, reason: 'Error checking status' }
    }
  }

  const sendManualEmail = async (userId: string, emailType: 'demo_ready' | 'website_launch') => {
    const emailKey = `${userId}_${emailType}`
    setSendingEmail(emailKey)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const response = await fetch('/api/admin/send-manual-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          emailType,
          sentBy: user.id
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`${emailType.replace('_', ' ')} email sent successfully!`)
        loadEmailHistory()
        checkEmailStatus(userId, emailType)
      } else {
        toast.error(`Failed to send email: ${result.error}`)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setSendingEmail(null)
    }
  }

  const filteredEmails = emailHistory.filter(email => {
    const matchesUser = !selectedUser || email.user_id === selectedUser
    const matchesType = !emailType || email.email_type === emailType
    const matchesStatus = !statusFilter || email.status === statusFilter
    const matchesSearch = !searchTerm || 
      email.user_profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.email_recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.email_subject.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesUser && matchesType && matchesStatus && matchesSearch
  })

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([loadEmailHistory(), loadUsers()])
      setLoading(false)
    }
    
    initializeData()
  }, [])

  useEffect(() => {
    if (selectedUser && emailType) {
      checkEmailStatus(selectedUser, emailType as 'demo_ready' | 'website_launch')
    }
  }, [selectedUser, emailType])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Admin
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
                <p className="text-gray-600 mt-1">Send manual emails and view email history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Send Email Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <EnvelopeIcon className="h-6 w-6 mr-2 text-blue-600" />
            Send Manual Email
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Select User</label>
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.email}) {user.business_name && `- ${user.business_name}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email Type</label>
              <select 
                value={emailType} 
                onChange={(e) => setEmailType(e.target.value as 'demo_ready' | 'website_launch')}
                className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose email type...</option>
                <option value="demo_ready">Demo Ready</option>
                <option value="website_launch">Website Launch</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => selectedUser && emailType && sendManualEmail(selectedUser, emailType as 'demo_ready' | 'website_launch')}
                disabled={!selectedUser || !emailType || !emailStatus[`${selectedUser}_${emailType}`]?.canSend || sendingEmail === `${selectedUser}_${emailType}`}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                  selectedUser && emailType && emailStatus[`${selectedUser}_${emailType}`]?.canSend && sendingEmail !== `${selectedUser}_${emailType}`
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {sendingEmail === `${selectedUser}_${emailType}` ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>

          {/* Status Display */}
          {selectedUser && emailType && (
            <div className={`p-4 rounded-lg border-2 ${
              emailStatus[`${selectedUser}_${emailType}`]?.canSend 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                {emailStatus[`${selectedUser}_${emailType}`]?.canSend ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                )}
                <span className="font-medium">
                  {emailStatus[`${selectedUser}_${emailType}`]?.reason || 'Checking status...'}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FunnelIcon className="h-6 w-6 mr-2 text-gray-600" />
            Filter Email History
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <select 
                value={selectedUser} 
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.full_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Type</label>
              <select 
                value={emailType} 
                onChange={(e) => setEmailType(e.target.value as 'demo_ready' | 'website_launch' | '')}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All types</option>
                <option value="demo_ready">Demo Ready</option>
                <option value="website_launch">Website Launch</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">All statuses</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-2 pl-8 border border-gray-300 rounded-md text-sm"
                />
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-2 top-2.5" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Email History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ClockIcon className="h-6 w-6 mr-2 text-gray-600" />
              Email History ({filteredEmails.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent By</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {email.user_profiles?.full_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {email.kickoff_forms?.[0]?.business_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        email.email_type === 'demo_ready' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {email.email_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {email.email_subject}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {email.email_recipient}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        email.status === 'sent' 
                          ? 'bg-green-100 text-green-800'
                          : email.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {email.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(email.sent_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {email.sent_by_profile?.full_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredEmails.length === 0 && (
              <div className="text-center py-12">
                <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No emails found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {emailHistory.length === 0 ? 'No emails have been sent yet.' : 'Try adjusting your filters.'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      
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
        }}
      />
    </div>
  )
}
