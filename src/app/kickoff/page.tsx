'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { KickoffFormData } from '@/lib/validations'
import { uploadFile } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  BuildingOfficeIcon, 
  DocumentTextIcon, 
  PaintBrushIcon,
  DocumentDuplicateIcon,
  SwatchIcon,
  PhotoIcon,
  FolderOpenIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const steps = [
  { id: 1, title: 'Business Name', icon: BuildingOfficeIcon },
  { id: 2, title: 'Business Description', icon: DocumentTextIcon },
  { id: 3, title: 'Website Style', icon: PaintBrushIcon },
  { id: 4, title: 'Desired Pages', icon: DocumentDuplicateIcon },
  { id: 5, title: 'Color Preferences', icon: SwatchIcon },
  { id: 6, title: 'Logo Upload', icon: PhotoIcon },
  { id: 7, title: 'Content Upload', icon: FolderOpenIcon },
  { id: 8, title: 'Special Requests', icon: ChatBubbleLeftRightIcon },
]

const websiteStyles = [
  { 
    value: 'clean', 
    label: 'Clean & Simple', 
    description: 'Minimalist design with lots of white space',
    preview: {
      bg: 'bg-white',
      accent: 'bg-gray-100',
      text: 'text-gray-900',
      border: 'border-gray-200'
    }
  },
  { 
    value: 'bold', 
    label: 'Bold & Vibrant', 
    description: 'Eye-catching with strong visual elements',
    preview: {
      bg: 'bg-gradient-to-br from-purple-600 to-pink-600',
      accent: 'bg-yellow-400',
      text: 'text-white',
      border: 'border-purple-300'
    }
  },
  { 
    value: 'minimalist', 
    label: 'Ultra Minimalist', 
    description: 'Essential elements only',
    preview: {
      bg: 'bg-gray-50',
      accent: 'bg-black',
      text: 'text-gray-800',
      border: 'border-gray-100'
    }
  },
  { 
    value: 'modern', 
    label: 'Modern & Trendy', 
    description: 'Contemporary design with latest trends',
    preview: {
      bg: 'bg-gradient-to-r from-blue-500 to-teal-400',
      accent: 'bg-indigo-600',
      text: 'text-white',
      border: 'border-blue-300'
    }
  },
  { 
    value: 'classic', 
    label: 'Classic & Professional', 
    description: 'Timeless business-focused design',
    preview: {
      bg: 'bg-navy-900',
      accent: 'bg-gold-500',
      text: 'text-white',
      border: 'border-gray-700'
    }
  },
]

const colorThemes = [
  { 
    name: 'Ocean Blue', 
    value: 'ocean-blue',
    primary: '#0EA5E9',
    secondary: '#0284C7',
    accent: '#F0F9FF',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    name: 'Forest Green', 
    value: 'forest-green',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#ECFDF5',
    gradient: 'from-emerald-500 to-green-500'
  },
  { 
    name: 'Sunset Orange', 
    value: 'sunset-orange',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FFFBEB',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    name: 'Royal Purple', 
    value: 'royal-purple',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#F5F3FF',
    gradient: 'from-purple-500 to-indigo-500'
  },
  { 
    name: 'Rose Gold', 
    value: 'rose-gold',
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#FDF2F8',
    gradient: 'from-pink-500 to-rose-500'
  },
  { 
    name: 'Charcoal', 
    value: 'charcoal',
    primary: '#374151',
    secondary: '#1F2937',
    accent: '#F9FAFB',
    gradient: 'from-gray-600 to-gray-800'
  },
]

const pageOptions = [
  'Home',
  'About',
  'Contact',
  'Services',
  'Portfolio',
  'Blog',
  'Testimonials',
  'FAQ',
  'Privacy Policy',
  'Terms of Service',
]

export default function KickoffPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<KickoffFormData>>({})
  const [selectedPages, setSelectedPages] = useState<string[]>([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [contentFile, setContentFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/signup')
    }
  }, [user, router])

  const progress = (currentStep / steps.length) * 100

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFormDataChange = (key: keyof KickoffFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handlePageToggle = (page: string) => {
    setSelectedPages(prev => 
      prev.includes(page) 
        ? prev.filter(p => p !== page)
        : [...prev, page]
    )
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Upload files if they exist
      let logoUrl = null
      let contentUrl = null

      if (logoFile) {
        logoUrl = await uploadFile(logoFile)
      }

      if (contentFile) {
        contentUrl = await uploadFile(contentFile)
      }

      // Save to database
      const { error } = await supabase
        .from('kickoff_forms')
        .insert({
          user_id: user.id,
          business_name: formData.businessName!,
          business_description: formData.businessDescription!,
          website_style: formData.websiteStyle!,
          desired_pages: selectedPages,
          color_preferences: formData.colorPreferences!,
          logo_url: logoUrl,
          content_upload_url: contentUrl,
          special_requests: formData.specialRequests || null,
          completed: true,
        })

      if (error) throw error

      // Create initial project status
      await supabase
        .from('project_status')
        .insert({
          user_id: user.id,
          status: 'not_touched',
        })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {        case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">What&apos;s your business name?</h2>
            <input
              type="text"
              value={formData.businessName || ''}
              onChange={(e) => handleFormDataChange('businessName', e.target.value)}
              placeholder="Enter your business name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tell us about your business</h2>
            <textarea
              value={formData.businessDescription || ''}
              onChange={(e) => handleFormDataChange('businessDescription', e.target.value)}
              placeholder="Describe what your business does, your target audience, and your goals..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Choose your preferred website style</h2>
            <div className="grid gap-6">
              {websiteStyles.map((style) => (
                <motion.button
                  key={style.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFormDataChange('websiteStyle', style.value)}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-300 ${
                    formData.websiteStyle === style.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Style Preview */}
                    <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                      <div className={`w-full h-full ${style.preview.bg} flex items-center justify-center relative`}>
                        <div className={`w-16 h-2 ${style.preview.accent} rounded-full mb-1`}></div>
                        <div className={`absolute bottom-1 left-1 w-3 h-3 ${style.preview.border} border rounded`}></div>
                        <div className={`absolute bottom-1 right-1 w-2 h-2 ${style.preview.text === 'text-white' ? 'bg-white' : 'bg-gray-900'} rounded`}></div>
                      </div>
                    </div>
                    
                    {/* Style Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white font-serif text-lg">{style.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 font-sans">{style.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Which pages do you need?</h2>
            <p className="text-gray-600 dark:text-gray-300">Select all that apply</p>
            <div className="grid grid-cols-2 gap-3">
              {pageOptions.map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePageToggle(page)}
                  className={`p-3 border-2 rounded-lg text-center transition-colors ${
                    selectedPages.includes(page)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  {page}
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Choose your color theme</h2>
            
            {/* Color Theme Selector */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-serif mb-4">Select a color palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {colorThemes.map((theme) => (
                  <motion.button
                    key={theme.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFormDataChange('colorPreferences', theme.name)}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      formData.colorPreferences === theme.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-700'
                    }`}
                  >
                    {/* Color Preview */}
                    <div className="flex space-x-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.primary }}
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.secondary }}
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: theme.accent }}
                      ></div>
                    </div>
                    
                    {/* Gradient Preview */}
                    <div className={`w-full h-3 rounded-full bg-gradient-to-r ${theme.gradient} mb-3`}></div>
                    
                    {/* Theme Name */}
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-serif">{theme.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-serif mb-2">Or describe your custom colors</h3>
              <textarea
                value={formData.colorPreferences || ''}
                onChange={(e) => handleFormDataChange('colorPreferences', e.target.value)}
                placeholder="Describe your preferred colors, brand colors, or any color schemes you like..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-sans"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload your logo</h2>
            <p className="text-gray-600 dark:text-gray-300">Upload your logo file (optional)</p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            {logoFile && (
              <p className="text-sm text-green-600 dark:text-green-400">✓ {logoFile.name} selected</p>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload content files</h2>
            <p className="text-gray-600 dark:text-gray-300">Upload any content files, documents, or images (optional)</p>
            <input
              type="file"
              accept=".zip,.doc,.docx,.pdf,image/*"
              onChange={(e) => setContentFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            {contentFile && (
              <p className="text-sm text-green-600 dark:text-green-400">✓ {contentFile.name} selected</p>
            )}
          </div>
        )

      case 8:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Any special requests?</h2>
            <textarea
              value={formData.specialRequests || ''}
              onChange={(e) => handleFormDataChange('specialRequests', e.target.value)}
              placeholder="Tell us about any specific features, functionality, or special requirements..."
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.businessName?.trim()
      case 2:
        return formData.businessDescription?.trim()
      case 3:
        return formData.websiteStyle
      case 4:
        return selectedPages.length > 0
      case 5:
        return formData.colorPreferences?.trim()
      case 6:
      case 7:
        return true // File uploads are optional
      case 8:
        return true // Special requests are optional
      default:
        return false
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Getting Started</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Icons */}
        <div className="flex justify-between mb-8">
          {steps.map((step) => {
            const Icon = step.icon
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                    isActive
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 dark:bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-16">
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </motion.button>

          {currentStep === steps.length ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="px-8 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                'Complete Setup'
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
