'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { KickoffFormData } from '@/lib/validations'
import { uploadFile } from '@/lib/utils'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'
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
  { id: 1, title: 'Firmenname', icon: BuildingOfficeIcon },
  { id: 2, title: 'Beschreibung', icon: DocumentTextIcon },
  { id: 3, title: 'Website-Stil', icon: PaintBrushIcon },
  { id: 4, title: 'Gewünschte Seiten', icon: DocumentDuplicateIcon },
  { id: 5, title: 'Farbpräferenzen', icon: SwatchIcon },
  { id: 6, title: 'Logo Upload', icon: PhotoIcon },
  { id: 7, title: 'Content Upload', icon: FolderOpenIcon },
  { id: 8, title: 'Besondere Wünsche', icon: ChatBubbleLeftRightIcon },
]

const websiteStyles = [
  { 
    value: 'clean', 
    label: 'Sauber & Einfach', 
    description: 'Minimalistisches Design mit viel Weißraum',
    preview: {
      bg: 'bg-white',
      accent: 'bg-gray-100',
      text: 'text-gray-900',
      border: 'border-gray-200'
    }
  },
  { 
    value: 'bold', 
    label: 'Mutig & Lebendig', 
    description: 'Auffällig mit starken visuellen Elementen',
    preview: {
      bg: 'bg-gradient-to-br from-purple-600 to-pink-600',
      accent: 'bg-yellow-400',
      text: 'text-white',
      border: 'border-purple-300'
    }
  },
  { 
    value: 'minimalist', 
    label: 'Ultra Minimalistisch', 
    description: 'Nur die wesentlichen Elemente',
    preview: {
      bg: 'bg-gray-50',
      accent: 'bg-black',
      text: 'text-gray-800',
      border: 'border-gray-100'
    }
  },
  { 
    value: 'modern', 
    label: 'Modern & Trendig', 
    description: 'Zeitgemäßes Design mit neuesten Trends',
    preview: {
      bg: 'bg-gradient-to-r from-blue-500 to-teal-400',
      accent: 'bg-indigo-600',
      text: 'text-white',
      border: 'border-blue-300'
    }
  },
  { 
    value: 'classic', 
    label: 'Klassisch & Professionell', 
    description: 'Zeitloses Business-fokussiertes Design',
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
    name: 'Ozean Blau', 
    value: 'ocean-blue',
    primary: '#0EA5E9',
    secondary: '#0284C7',
    accent: '#F0F9FF',
    gradient: 'from-blue-500 to-cyan-500'
  },
  { 
    name: 'Wald Grün', 
    value: 'forest-green',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#ECFDF5',
    gradient: 'from-emerald-500 to-green-500'
  },
  { 
    name: 'Sonnenuntergang Orange', 
    value: 'sunset-orange',
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#FFFBEB',
    gradient: 'from-orange-500 to-red-500'
  },
  { 
    name: 'Königliches Lila', 
    value: 'royal-purple',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#F5F3FF',
    gradient: 'from-purple-500 to-indigo-500'
  },
  { 
    name: 'Roségold', 
    value: 'rose-gold',
    primary: '#EC4899',
    secondary: '#DB2777',
    accent: '#FDF2F8',
    gradient: 'from-pink-500 to-rose-500'
  },
  { 
    name: 'Anthrazit', 
    value: 'charcoal',
    primary: '#374151',
    secondary: '#1F2937',
    accent: '#F9FAFB',
    gradient: 'from-gray-600 to-gray-800'
  },
]

const pageOptions = [
  'Startseite',
  'Über uns',
  'Kontakt',
  'Dienstleistungen',
  'Portfolio',
  'Blog',
  'Referenzen',
  'FAQ',
  'Datenschutz',
  'AGB',
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
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Wie heißt dein Business?</h2>
            <input
              type="text"
              value={formData.businessName || ''}
              onChange={(e) => handleFormDataChange('businessName', e.target.value)}
              placeholder="Name deines Unternehmens"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm"
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Erzähl uns über dein Business</h2>
            <textarea
              value={formData.businessDescription || ''}
              onChange={(e) => handleFormDataChange('businessDescription', e.target.value)}
              placeholder="Beschreibe was dein Business macht, deine Zielgruppe und deine Ziele..."
              rows={6}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Wähle deinen bevorzugten Website-Stil</h2>
            <div className="grid gap-6">
              {websiteStyles.map((style) => (
                <motion.button
                  key={style.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFormDataChange('websiteStyle', style.value)}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-300 ${
                    formData.websiteStyle === style.value
                      ? 'border-teal-400 bg-teal-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Style Preview */}
                    <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <div className={`w-full h-full ${style.preview.bg} flex items-center justify-center relative`}>
                        <div className={`w-16 h-2 ${style.preview.accent} rounded-full mb-1`}></div>
                        <div className={`absolute bottom-1 left-1 w-3 h-3 ${style.preview.border} border rounded`}></div>
                        <div className={`absolute bottom-1 right-1 w-2 h-2 ${style.preview.text === 'text-white' ? 'bg-white' : 'bg-gray-900'} rounded`}></div>
                      </div>
                    </div>
                    
                    {/* Style Info */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 font-bold text-lg">{style.label}</h3>
                      <p className="text-sm text-gray-600 mt-1 font-inter">{style.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Welche Seiten brauchst du?</h2>
            <p className="text-gray-600 font-inter">Wähle alle zutreffenden aus</p>
            <div className="grid grid-cols-2 gap-3">
              {pageOptions.map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePageToggle(page)}
                  className={`p-3 border-2 rounded-xl text-center transition-all duration-300 font-inter ${
                    selectedPages.includes(page)
                      ? 'border-teal-400 bg-teal-50 text-teal-700'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 text-gray-700'
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
            <h2 className="text-2xl font-bold text-gray-900">Wähle dein Farbthema</h2>
            
            {/* Color Theme Selector */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-bold mb-4">Wähle eine Farbpalette</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {colorThemes.map((theme) => (
                  <motion.button
                    key={theme.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFormDataChange('colorPreferences', theme.name)}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      formData.colorPreferences === theme.name
                        ? 'border-teal-400 bg-teal-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Color Preview */}
                    <div className="flex space-x-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
                        style={{ backgroundColor: theme.primary }}
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-200 shadow-sm"
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
                    <p className="text-sm font-medium text-gray-900 font-bold">{theme.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 font-bold mb-2">Oder beschreibe deine eigenen Farben</h3>
              <textarea
                value={formData.colorPreferences || ''}
                onChange={(e) => handleFormDataChange('colorPreferences', e.target.value)}
                placeholder="Beschreibe deine bevorzugten Farben, Markenfarben oder Farbschemata..."
                rows={4}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Lade dein Logo hoch</h2>
            <p className="text-gray-600 font-inter">Lade deine Logo-Datei hoch (optional)</p>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm"
              />
            </div>
            {logoFile && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-green-800 font-inter">{logoFile.name} ausgewählt</p>
              </div>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Inhalte hochladen</h2>
            <p className="text-gray-600 font-inter">Lade Content-Dateien, Dokumente oder Bilder hoch (optional)</p>
            <div className="relative">
              <input
                type="file"
                accept=".zip,.doc,.docx,.pdf,image/*"
                onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm"
              />
            </div>
            {contentFile && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-green-800 font-inter">{contentFile.name} ausgewählt</p>
              </div>
            )}
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Besondere Wünsche?</h2>
            <p className="text-gray-600 font-inter">Erzähle uns über spezielle Features, Funktionen oder Anforderungen</p>
            <textarea
              value={formData.specialRequests || ''}
              onChange={(e) => handleFormDataChange('specialRequests', e.target.value)}
              placeholder="Beschreibe spezielle Features, Funktionen oder besondere Anforderungen..."
              rows={5}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" />
            <h1 className="text-xl font-bold text-gray-900">Customer Flows</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Website Kickoff</h1>
            <span className="text-sm text-gray-600">
              Schritt {currentStep} von {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full"
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
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                      : isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-600 text-center max-w-16 font-inter">
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-gray-200">
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
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-inter shadow-sm"
          >
            Zurück
          </motion.button>

          {currentStep === steps.length ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 disabled:from-green-400 disabled:to-emerald-400 disabled:cursor-not-allowed transition-all duration-300 font-inter font-semibold shadow-md"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Wird übermittelt...
                </div>
              ) : (
                'Setup abschließen'
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              disabled={!canProceed()}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:from-teal-300 disabled:to-cyan-300 disabled:cursor-not-allowed transition-all duration-300 font-inter font-semibold shadow-md"
            >
              Weiter
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
