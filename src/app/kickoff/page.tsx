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
  { id: 6, title: 'Logo Hochladen', icon: PhotoIcon },
  { id: 7, title: 'Inhalt Hochladen', icon: FolderOpenIcon },
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
  const [contentFiles, setContentFiles] = useState<File[]>([])
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

  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validate file count
    if (files.length > 20) {
      alert('Sie können maximal 20 Dateien gleichzeitig hochladen.')
      e.target.value = '' // Clear the input
      return
    }

    // Validate each file
    const validFiles: File[] = []
    const maxSize = 10 * 1024 * 1024 // 10MB per file
    
    for (const file of files) {
      if (file.size > maxSize) {
        alert(`Die Datei "${file.name}" ist zu groß. Maximale Dateigröße: 10MB`)
        e.target.value = '' // Clear the input
        return
      }
      
      // Check if it's an image
      if (!file.type.startsWith('image/')) {
        alert(`Die Datei "${file.name}" ist kein Bild. Bitte wählen Sie nur Bilddateien aus.`)
        e.target.value = '' // Clear the input
        return
      }
      
      validFiles.push(file)
    }
    
    setContentFiles(validFiles)
  }

  const removeContentFile = (index: number) => {
    setContentFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      // Upload files if they exist
      let logoUrl = null
      let contentUrl = null

      if (logoFile) {
        try {
          console.log('Uploading logo file:', logoFile.name)
          logoUrl = await uploadFile(logoFile, user.id)
          console.log('Logo uploaded successfully:', logoUrl)
        } catch (uploadError) {
          console.error('Error uploading logo:', uploadError)
          alert('Fehler beim Hochladen des Logos. Bitte versuchen Sie es erneut.')
          setIsSubmitting(false)
          return
        }
      }

      if (contentFile) {
        try {
          console.log('Uploading content file:', contentFile.name)
          contentUrl = await uploadFile(contentFile, user.id)
          console.log('Content file uploaded successfully:', contentUrl)
        } catch (uploadError) {
          console.error('Error uploading content file:', uploadError)
          alert('Fehler beim Hochladen der Inhaltsdatei. Bitte versuchen Sie es erneut.')
          setIsSubmitting(false)
          return
        }
      }

      // Upload multiple content files if they exist
      let contentUrls: string[] = []
      if (contentFiles.length > 0) {
        try {
          console.log(`Uploading ${contentFiles.length} content files...`)
          const uploadPromises = contentFiles.map(file => uploadFile(file, user.id))
          contentUrls = await Promise.all(uploadPromises)
          console.log('All content files uploaded successfully:', contentUrls)
        } catch (uploadError) {
          console.error('Error uploading content files:', uploadError)
          alert('Fehler beim Hochladen der Inhaltsdateien. Bitte versuchen Sie es erneut.')
          setIsSubmitting(false)
          return
        }
      }

      // Combine single file URL with multiple file URLs
      const allContentUrls = [
        ...(contentUrl ? [contentUrl] : []),
        ...contentUrls
      ]

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
          content_upload_url: allContentUrls.length > 0 ? allContentUrls[0] : null, // First file for backward compatibility
          content_upload_urls: allContentUrls.length > 0 ? allContentUrls : null, // All files array
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

      // Send email notification to admin via API
      try {
        const response = await fetch('/api/send-kickoff-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerData: {
              businessName: formData.businessName,
              businessDescription: formData.businessDescription,
              websiteStyle: formData.websiteStyle,
              desiredPages: selectedPages,
              colorPreferences: formData.colorPreferences,
              logoUrl: logoUrl || undefined,
              contentUploadUrl: contentUrl || undefined,
              contentUploadUrls: allContentUrls.length > 0 ? allContentUrls : undefined,
              contentFileCount: allContentUrls.length,
              specialRequests: formData.specialRequests,
              userEmail: user.email,
              userName: user.user_metadata?.full_name || user.email,
            }
          })
        })

        if (response.ok) {
          console.log('Email notification sent successfully')
        } else {
          console.error('Failed to send email notification via API:', response.status)
        }
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError)
        // Don't fail the entire submission if email fails
      }

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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wie heißt dein Business?</h2>
            <input
              type="text"
              value={formData.businessName || ''}
              onChange={(e) => handleFormDataChange('businessName', e.target.value)}
              placeholder="Name deines Unternehmens"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm"
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Erzähl uns über dein Business</h2>
            <textarea
              value={formData.businessDescription || ''}
              onChange={(e) => handleFormDataChange('businessDescription', e.target.value)}
              placeholder="Beschreibe was dein Business macht, deine Zielgruppe und deine Ziele..."
              rows={6}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
            />
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wähle deinen bevorzugten Website-Stil</h2>
            <div className="grid gap-6">
              {websiteStyles.map((style) => (
                <motion.button
                  key={style.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleFormDataChange('websiteStyle', style.value)}
                  className={`p-6 border-2 rounded-xl text-left transition-all duration-300 ${
                    formData.websiteStyle === style.value
                      ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
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
                      <h3 className="font-semibold text-gray-900 dark:text-white font-bold text-lg">{style.label}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 font-inter">{style.description}</p>
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welche Seiten brauchst du?</h2>
            <p className="text-gray-600 dark:text-gray-400 font-inter">Wähle alle zutreffenden aus</p>
            <div className="grid grid-cols-2 gap-3">
              {pageOptions.map((page) => (
                <motion.button
                  key={page}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePageToggle(page)}
                  className={`p-3 border-2 rounded-xl text-center transition-all duration-300 font-inter ${
                    selectedPages.includes(page)
                      ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300'
                      : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Wähle dein Farbthema</h2>
            
            {/* Color Theme Selector */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-bold mb-4">Wähle eine Farbpalette</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {colorThemes.map((theme) => (
                  <motion.button
                    key={theme.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleFormDataChange('colorPreferences', theme.name)}
                    className={`p-4 border-2 rounded-xl transition-all duration-300 ${
                      formData.colorPreferences === theme.name
                        ? 'border-teal-400 bg-teal-50 dark:bg-teal-900/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {/* Color Preview */}
                    <div className="flex space-x-2 mb-3">
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                        style={{ backgroundColor: theme.primary }}
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                        style={{ backgroundColor: theme.secondary }}
                      ></div>
                      <div 
                        className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600 shadow-sm"
                        style={{ backgroundColor: theme.accent }}
                      ></div>
                    </div>
                    
                    {/* Gradient Preview */}
                    <div className={`w-full h-3 rounded-full bg-gradient-to-r ${theme.gradient} mb-3`}></div>
                    
                    {/* Theme Name */}
                    <p className="text-sm font-medium text-gray-900 dark:text-white font-bold">{theme.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Custom Color Input */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white font-bold mb-2">Oder beschreibe deine eigenen Farben</h3>
              <textarea
                value={formData.colorPreferences || ''}
                onChange={(e) => handleFormDataChange('colorPreferences', e.target.value)}
                placeholder="Beschreibe deine bevorzugten Farben, Markenfarben oder Farbschemata..."
                rows={4}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Lade dein Logo hoch</h2>
            <p className="text-gray-600 dark:text-gray-400 font-inter">Lade deine Logo-Datei hoch (optional)</p>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 dark:file:bg-teal-900/30 file:text-teal-700 dark:file:text-teal-300 hover:file:bg-teal-100 dark:hover:file:bg-teal-900/50 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm"
              />
            </div>
            {logoFile && (
              <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                <p className="text-sm text-green-800 dark:text-green-300 font-inter">{logoFile.name} ausgewählt</p>
              </div>
            )}
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inhalte hochladen</h2>
            <p className="text-gray-600 dark:text-gray-400 font-inter">Lade Content-Dateien, Dokumente oder Bilder hoch (optional)</p>
            
            {/* Single file upload (for documents) */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Dokumente oder andere Dateien</h3>
              <div className="relative">
                <input
                  type="file"
                  accept=".zip,.doc,.docx,.pdf"
                  onChange={(e) => setContentFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 dark:file:bg-teal-900/30 file:text-teal-700 dark:file:text-teal-300 hover:file:bg-teal-100 dark:hover:file:bg-teal-900/50 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm"
                />
              </div>
              {contentFile && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl mt-2">
                  <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
                  <p className="text-sm text-green-800 dark:text-green-300 font-inter">{contentFile.name} ausgewählt</p>
                </div>
              )}
            </div>

            {/* Multiple image uploads */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Bilder (bis zu 20 Stück)</h3>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleFilesChange}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 dark:file:bg-purple-900/30 file:text-purple-700 dark:file:text-purple-300 hover:file:bg-purple-100 dark:hover:file:bg-purple-900/50 focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm"
                />
              </div>
              
              {/* Selected images preview */}
              {contentFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 font-inter">
                    {contentFiles.length} Bild(er) ausgewählt:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
                    {contentFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <button
                          onClick={() => removeContentFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          ×
                        </button>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate font-inter">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Besondere Wünsche?</h2>
            <p className="text-gray-600 dark:text-gray-400 font-inter">Erzähle uns über spezielle Features, Funktionen oder Anforderungen</p>
            <textarea
              value={formData.specialRequests || ''}
              onChange={(e) => handleFormDataChange('specialRequests', e.target.value)}
              placeholder="Beschreibe spezielle Features, Funktionen oder besondere Anforderungen..."
              rows={5}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-slate-900">
      {/* Header with Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Logo size="md" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Customer Flows</h1>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Website Kickoff</h1>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Schritt {currentStep} von {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
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
                      ? 'bg-green-500 dark:bg-green-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400 text-center max-w-16 font-inter">
                  {step.title}
                </span>
              </div>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
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
            className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-inter shadow-sm"
          >
            Zurück
          </motion.button>

          {currentStep === steps.length ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700 disabled:from-green-400 disabled:to-emerald-400 dark:disabled:from-green-500 dark:disabled:to-emerald-500 disabled:cursor-not-allowed transition-all duration-300 font-inter font-semibold shadow-md"
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
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 dark:from-teal-600 dark:to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 dark:hover:from-teal-700 dark:hover:to-cyan-700 disabled:from-teal-300 disabled:to-cyan-300 dark:disabled:from-teal-400 dark:disabled:to-cyan-400 disabled:cursor-not-allowed transition-all duration-300 font-inter font-semibold shadow-md"
            >
              Weiter
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
