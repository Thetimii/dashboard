'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'
import { 
  BuildingOfficeIcon, 
  TrophyIcon, 
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  GlobeAltIcon,
  ScaleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline'

const steps = [
  { id: 1, title: 'Unternehmensziele & Kerngeschäft', icon: BuildingOfficeIcon },
  { id: 2, title: 'Alleinstellungsmerkmale', icon: TrophyIcon },
  { id: 3, title: 'Zielgruppenanalyse', icon: UserGroupIcon },
  { id: 4, title: 'Inhalte & Medien', icon: DocumentTextIcon },
  { id: 5, title: 'Website-Funktionalitäten', icon: CogIcon },
  { id: 6, title: 'Domain & Hosting', icon: GlobeAltIcon },
  { id: 7, title: 'Rechtliche Anforderungen', icon: ScaleIcon },
]

interface FormData {
  // Step 1: Business Core
  core_business?: string
  revenue_generation?: string
  main_product_service?: string
  secondary_revenue?: string
  long_term_revenue?: string
  
  // Step 2: USPs
  unique_selling_points?: string
  customer_choice_reasons?: string
  problems_solved?: string
  trust_building?: string
  company_market_since?: number
  references_customer_count?: string
  special_services_support?: string
  potential_objections?: string
  main_competitors?: string
  
  // Step 3: Target Group
  target_group_demographics?: string
  target_group_needs?: string
  
  // Step 4: Content & Media
  service_subpages?: boolean
  service_subpages_details?: string
  existing_content?: boolean
  existing_content_details?: string
  blog_needed?: boolean
  blog_topics?: string
  
  // Step 5: Website Functions
  ecommerce_needed?: boolean
  ecommerce_details?: string
  newsletter_needed?: boolean
  member_area_needed?: boolean
  member_area_details?: string
  social_media_needed?: boolean
  whatsapp_chat_needed?: boolean
  appointment_booking?: boolean
  appointment_tool?: string
  existing_seo_keywords?: string
  google_analytics_needed?: boolean
  
  // Step 6: Domain
  desired_domain?: string
  
  // Step 7: Legal & Contact
  privacy_policy_exists?: boolean
  privacy_policy_creation_needed?: boolean
  company_address?: string
  company_phone?: string
  company_email?: string
  vat_id?: string
}

export default function FollowupQuestionnairePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      router.push('/signin')
    }
  }, [user, router])

  const progress = (currentStep / steps.length) * 100

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFormDataChange = (key: keyof FormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }))
    }
  }

  const validateField = (field: string, value: any, minLength?: number, required?: boolean): string => {
    if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Dieses Feld ist erforderlich'
    }
    if (minLength && typeof value === 'string' && value.trim().length < minLength) {
      return `Mindestens ${minLength} Zeichen erforderlich`
    }
    return ''
  }

  const validateCurrentStep = (): boolean => {
    const newErrors: {[key: string]: string} = {}
    
    switch (currentStep) {
      case 1:
        newErrors.core_business = validateField('core_business', formData.core_business, 50, true)
        newErrors.revenue_generation = validateField('revenue_generation', formData.revenue_generation, 30, true)
        newErrors.main_product_service = validateField('main_product_service', formData.main_product_service, 10, true)
        break
      case 2:
        newErrors.unique_selling_points = validateField('unique_selling_points', formData.unique_selling_points, 50, true)
        newErrors.customer_choice_reasons = validateField('customer_choice_reasons', formData.customer_choice_reasons, 40, true)
        newErrors.problems_solved = validateField('problems_solved', formData.problems_solved, 50, true)
        newErrors.trust_building = validateField('trust_building', formData.trust_building, 30, true)
        if (!formData.company_market_since || formData.company_market_since < 1900 || formData.company_market_since > new Date().getFullYear()) {
          newErrors.company_market_since = 'Bitte geben Sie ein gültiges Gründungsjahr ein'
        }
        newErrors.main_competitors = validateField('main_competitors', formData.main_competitors, 50, true)
        break
      case 3:
        newErrors.target_group_demographics = validateField('target_group_demographics', formData.target_group_demographics, 100, true)
        newErrors.target_group_needs = validateField('target_group_needs', formData.target_group_needs, 50, true)
        break
      case 4:
        if (formData.service_subpages && !formData.service_subpages_details) {
          newErrors.service_subpages_details = 'Bitte geben Sie Details zu den Unterseiten an'
        }
        if (formData.existing_content && !formData.existing_content_details) {
          newErrors.existing_content_details = 'Bitte geben Sie Details zu vorhandenen Inhalten an'
        }
        if (formData.blog_needed && !formData.blog_topics) {
          newErrors.blog_topics = 'Bitte geben Sie die Blog-Themen an'
        }
        break
      case 5:
        if (formData.ecommerce_needed && !formData.ecommerce_details) {
          newErrors.ecommerce_details = 'Bitte geben Sie E-Commerce Details an'
        }
        if (formData.member_area_needed && !formData.member_area_details) {
          newErrors.member_area_details = 'Bitte geben Sie Mitgliederbereich Details an'
        }
        if (formData.appointment_booking && !formData.appointment_tool) {
          newErrors.appointment_tool = 'Bitte geben Sie Details zur Terminbuchung an'
        }
        break
      case 6:
        newErrors.desired_domain = validateField('desired_domain', formData.desired_domain, 5, true)
        break
      case 7:
        newErrors.company_address = validateField('company_address', formData.company_address, 20, true)
        newErrors.company_phone = validateField('company_phone', formData.company_phone, 5, true)
        newErrors.company_email = validateField('company_email', formData.company_email, 5, true)
        break
    }

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([_, value]) => value !== '')
    )
    
    setErrors(filteredErrors)
    return Object.keys(filteredErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!user || !validateCurrentStep()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('followup_questionnaires')
        .insert({
          user_id: user.id,
          ...formData,
          completed: true,
        })

      if (error) throw error

      // Update user profile to mark questionnaire as completed
      await supabase
        .from('profiles')
        .update({ needs_followup: false })
        .eq('id', user.id)

      router.push('/dashboard')
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      alert('Fehler beim Speichern. Bitte versuchen Sie es erneut.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Unternehmensziele & Kerngeschäft</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Was ist das Kerngeschäft Ihres Unternehmens? *
              </label>
              <textarea
                value={formData.core_business || ''}
                onChange={(e) => handleFormDataChange('core_business', e.target.value)}
                placeholder="Beschreiben Sie prägnant, welche Haupttätigkeiten Sie ausüben..."
                rows={4}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.core_business ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.core_business && <p className="mt-1 text-sm text-red-600">{errors.core_business}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wie generieren Sie Ihren Umsatz? *
              </label>
              <textarea
                value={formData.revenue_generation || ''}
                onChange={(e) => handleFormDataChange('revenue_generation', e.target.value)}
                placeholder="Erklären Sie Ihre Umsatzgenerierung..."
                rows={3}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.revenue_generation ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.revenue_generation && <p className="mt-1 text-sm text-red-600">{errors.revenue_generation}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Was ist Ihr Hauptprodukt oder Ihre Hauptdienstleistung? *
              </label>
              <input
                type="text"
                value={formData.main_product_service || ''}
                onChange={(e) => handleFormDataChange('main_product_service', e.target.value)}
                placeholder="Ihr Hauptprodukt/Hauptdienstleistung..."
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.main_product_service ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm`}
              />
              {errors.main_product_service && <p className="mt-1 text-sm text-red-600">{errors.main_product_service}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gibt es zusätzliche Einnahmequellen?
              </label>
              <textarea
                value={formData.secondary_revenue || ''}
                onChange={(e) => handleFormDataChange('secondary_revenue', e.target.value)}
                placeholder="Beratungen, ergänzende Produkte, Abonnements..."
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Haben Sie wiederkehrende Einnahmen oder langfristige Kundenbeziehungen?
              </label>
              <textarea
                value={formData.long_term_revenue || ''}
                onChange={(e) => handleFormDataChange('long_term_revenue', e.target.value)}
                placeholder="Beschreiben Sie wiederkehrende Einnahmen..."
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Alleinstellungsmerkmale & Wettbewerbsvorteile</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Was macht Ihr Unternehmen einzigartig? (2-3 USPs) *
              </label>
              <textarea
                value={formData.unique_selling_points || ''}
                onChange={(e) => handleFormDataChange('unique_selling_points', e.target.value)}
                placeholder="Nennen Sie 2-3 Alleinstellungsmerkmale..."
                rows={4}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.unique_selling_points ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.unique_selling_points && <p className="mt-1 text-sm text-red-600">{errors.unique_selling_points}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Warum sollte ein Kunde bei Ihnen kaufen? *
              </label>
              <textarea
                value={formData.customer_choice_reasons || ''}
                onChange={(e) => handleFormDataChange('customer_choice_reasons', e.target.value)}
                placeholder="Formulieren Sie den Mehrwert für den Kunden..."
                rows={4}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.customer_choice_reasons ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.customer_choice_reasons && <p className="mt-1 text-sm text-red-600">{errors.customer_choice_reasons}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Welche konkreten Probleme lösen Sie für Ihre Kunden? *
              </label>
              <textarea
                value={formData.problems_solved || ''}
                onChange={(e) => handleFormDataChange('problems_solved', e.target.value)}
                placeholder="Beschreiben Sie die Herausforderungen oder Bedürfnisse..."
                rows={4}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.problems_solved ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.problems_solved && <p className="mt-1 text-sm text-red-600">{errors.problems_solved}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wie schaffen Sie Vertrauen bei Ihren Kunden? *
              </label>
              <textarea
                value={formData.trust_building || ''}
                onChange={(e) => handleFormDataChange('trust_building', e.target.value)}
                placeholder="Methoden zur Vertrauensbildung..."
                rows={3}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.trust_building ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.trust_building && <p className="mt-1 text-sm text-red-600">{errors.trust_building}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seit wann ist Ihr Unternehmen am Markt? *
              </label>
              <input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                value={formData.company_market_since || ''}
                onChange={(e) => handleFormDataChange('company_market_since', parseInt(e.target.value))}
                placeholder="z.B. 2015"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.company_market_since ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm`}
              />
              {errors.company_market_since && <p className="mt-1 text-sm text-red-600">{errors.company_market_since}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Haben Sie Referenzen oder eine signifikante Kundenanzahl?
              </label>
              <textarea
                value={formData.references_customer_count || ''}
                onChange={(e) => handleFormDataChange('references_customer_count', e.target.value)}
                placeholder="Angaben zu Referenzen oder Kundenzahlen..."
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bieten Sie besondere Services oder herausragenden Support an?
              </label>
              <textarea
                value={formData.special_services_support || ''}
                onChange={(e) => handleFormDataChange('special_services_support', e.target.value)}
                placeholder="Garantien, individuelle Anpassungen, Support..."
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gibt es häufige Einwände von potenziellen Kunden?
              </label>
              <textarea
                value={formData.potential_objections || ''}
                onChange={(e) => handleFormDataChange('potential_objections', e.target.value)}
                placeholder="Einwände und wie Sie diesen begegnen..."
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wer sind Ihre Hauptkonkurrenten und was sind deren Stärken/Schwächen? *
              </label>
              <textarea
                value={formData.main_competitors || ''}
                onChange={(e) => handleFormDataChange('main_competitors', e.target.value)}
                placeholder="Analyse der Wettbewerber..."
                rows={4}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.main_competitors ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.main_competitors && <p className="mt-1 text-sm text-red-600">{errors.main_competitors}</p>}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Zielgruppenanalyse</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wer ist Ihre primäre Zielgruppe? *
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Beschreiben Sie diese bitte so detailliert wie möglich: Demografische Merkmale, Interessen, Verhalten, Kaufkraft
              </p>
              <textarea
                value={formData.target_group_demographics || ''}
                onChange={(e) => handleFormDataChange('target_group_demographics', e.target.value)}
                placeholder="Detaillierte Beschreibung der Zielgruppe (Alter, Geschlecht, Bildungsstand, Einkommen, Interessen, Online-Verhalten, Kaufgewohnheiten...)..."
                rows={6}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.target_group_demographics ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.target_group_demographics && <p className="mt-1 text-sm text-red-600">{errors.target_group_demographics}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Welche spezifischen Bedürfnisse und Probleme hat diese Zielgruppe? *
              </label>
              <textarea
                value={formData.target_group_needs || ''}
                onChange={(e) => handleFormDataChange('target_group_needs', e.target.value)}
                placeholder="Beschreiben Sie die Bedürfnisse und Probleme Ihrer Zielgruppe..."
                rows={4}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.target_group_needs ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.target_group_needs && <p className="mt-1 text-sm text-red-600">{errors.target_group_needs}</p>}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Inhalte & Medien</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Benötigen Sie separate Unterseiten für verschiedene Dienstleistungen oder Produkte?
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.service_subpages || false}
                    onChange={(e) => handleFormDataChange('service_subpages', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Ja, ich benötige separate Unterseiten</span>
                </label>
                {formData.service_subpages && (
                  <textarea
                    value={formData.service_subpages_details || ''}
                    onChange={(e) => handleFormDataChange('service_subpages_details', e.target.value)}
                    placeholder="Listen Sie die benötigten Unterseiten auf..."
                    rows={3}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.service_subpages_details ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
                  />
                )}
                {errors.service_subpages_details && <p className="mt-1 text-sm text-red-600">{errors.service_subpages_details}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Stehen bereits Texte oder Bilder für die Website zur Verfügung?
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.existing_content || false}
                    onChange={(e) => handleFormDataChange('existing_content', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Ja, ich habe bereits Inhalte</span>
                </label>
                {formData.existing_content && (
                  <textarea
                    value={formData.existing_content_details || ''}
                    onChange={(e) => handleFormDataChange('existing_content_details', e.target.value)}
                    placeholder="Beschreiben Sie, welche Inhalte verfügbar sind und wo wir sie finden können..."
                    rows={3}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.existing_content_details ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
                  />
                )}
                {errors.existing_content_details && <p className="mt-1 text-sm text-red-600">{errors.existing_content_details}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Planen Sie regelmäßige Blogbeiträge oder News-Artikel?
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.blog_needed || false}
                    onChange={(e) => handleFormDataChange('blog_needed', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Ja, ich möchte einen Blog/News-Bereich</span>
                </label>
                {formData.blog_needed && (
                  <textarea
                    value={formData.blog_topics || ''}
                    onChange={(e) => handleFormDataChange('blog_topics', e.target.value)}
                    placeholder="Welche Themenbereiche möchten Sie abdecken?"
                    rows={3}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.blog_topics ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
                  />
                )}
                {errors.blog_topics && <p className="mt-1 text-sm text-red-600">{errors.blog_topics}</p>}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Website-Funktionalitäten</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                E-Commerce (Online-Shop)
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ecommerce_needed || false}
                    onChange={(e) => handleFormDataChange('ecommerce_needed', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Ja, ich benötige einen Online-Shop</span>
                </label>
                {formData.ecommerce_needed && (
                  <textarea
                    value={formData.ecommerce_details || ''}
                    onChange={(e) => handleFormDataChange('ecommerce_details', e.target.value)}
                    placeholder="Wie viele Produkte? Welche Zahlungsmethoden sind geplant?"
                    rows={3}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.ecommerce_details ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
                  />
                )}
                {errors.ecommerce_details && <p className="mt-1 text-sm text-red-600">{errors.ecommerce_details}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.newsletter_needed || false}
                  onChange={(e) => handleFormDataChange('newsletter_needed', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Newsletter-Anmeldung</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.social_media_needed || false}
                  onChange={(e) => handleFormDataChange('social_media_needed', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Social-Media-Anbindung</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.whatsapp_chat_needed || false}
                  onChange={(e) => handleFormDataChange('whatsapp_chat_needed', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">WhatsApp-Business-Chat</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.google_analytics_needed || false}
                  onChange={(e) => handleFormDataChange('google_analytics_needed', e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Google Analytics</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Mitgliederbereich
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.member_area_needed || false}
                    onChange={(e) => handleFormDataChange('member_area_needed', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Ja, ich benötige einen Mitgliederbereich</span>
                </label>
                {formData.member_area_needed && (
                  <textarea
                    value={formData.member_area_details || ''}
                    onChange={(e) => handleFormDataChange('member_area_details', e.target.value)}
                    placeholder="Mit welchen Inhalten oder Funktionen?"
                    rows={3}
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.member_area_details ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
                  />
                )}
                {errors.member_area_details && <p className="mt-1 text-sm text-red-600">{errors.member_area_details}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Terminbuchungsfunktion
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.appointment_booking || false}
                    onChange={(e) => handleFormDataChange('appointment_booking', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-teal-500 focus:ring-teal-500 focus:ring-offset-0 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Ja, ich benötige eine Terminbuchung</span>
                </label>
                {formData.appointment_booking && (
                  <input
                    type="text"
                    value={formData.appointment_tool || ''}
                    onChange={(e) => handleFormDataChange('appointment_tool', e.target.value)}
                    placeholder="Nutzen Sie bereits ein Tool (z.B. Calendly) oder neue Integration?"
                    className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.appointment_tool ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm`}
                  />
                )}
                {errors.appointment_tool && <p className="mt-1 text-sm text-red-600">{errors.appointment_tool}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bestehende SEO-Strategie oder relevante Keywords
              </label>
              <textarea
                value={formData.existing_seo_keywords || ''}
                onChange={(e) => handleFormDataChange('existing_seo_keywords', e.target.value)}
                placeholder="Relevante Keywords oder SEO-Informationen..."
                rows={3}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm"
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Domain & Hosting</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Wie soll Ihre Website heißen? Bevorzugte Domain *
              </label>
              <input
                type="text"
                value={formData.desired_domain || ''}
                onChange={(e) => handleFormDataChange('desired_domain', e.target.value)}
                placeholder="z.B. ihrunternehmen.ch"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.desired_domain ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm`}
              />
              {errors.desired_domain && <p className="mt-1 text-sm text-red-600">{errors.desired_domain}</p>}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rechtliche Anforderungen & Kontaktdaten</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Datenschutzerklärung
              </label>
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="privacy_policy"
                      checked={formData.privacy_policy_exists === true}
                      onChange={() => {
                        handleFormDataChange('privacy_policy_exists', true)
                        handleFormDataChange('privacy_policy_creation_needed', false)
                      }}
                      className="text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Ja, liegt bereits vor</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="privacy_policy"
                      checked={formData.privacy_policy_creation_needed === true}
                      onChange={() => {
                        handleFormDataChange('privacy_policy_exists', false)
                        handleFormDataChange('privacy_policy_creation_needed', true)
                      }}
                      className="text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Nein, bitte erstellen</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="privacy_policy"
                      checked={formData.privacy_policy_exists === false && formData.privacy_policy_creation_needed === false}
                      onChange={() => {
                        handleFormDataChange('privacy_policy_exists', false)
                        handleFormDataChange('privacy_policy_creation_needed', false)
                      }}
                      className="text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300 font-inter">Nein, wir kümmern uns selbst</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vollständige Unternehmensadresse *
              </label>
              <textarea
                value={formData.company_address || ''}
                onChange={(e) => handleFormDataChange('company_address', e.target.value)}
                placeholder="Straße, Hausnummer, PLZ, Ort, Land..."
                rows={3}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.company_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter resize-none shadow-sm`}
              />
              {errors.company_address && <p className="mt-1 text-sm text-red-600">{errors.company_address}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Telefonnummer(n) *
              </label>
              <input
                type="text"
                value={formData.company_phone || ''}
                onChange={(e) => handleFormDataChange('company_phone', e.target.value)}
                placeholder="+41 XX XXX XX XX"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.company_phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm`}
              />
              {errors.company_phone && <p className="mt-1 text-sm text-red-600">{errors.company_phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                E-Mail-Adresse(n) für Kontakt *
              </label>
              <input
                type="email"
                value={formData.company_email || ''}
                onChange={(e) => handleFormDataChange('company_email', e.target.value)}
                placeholder="kontakt@ihrunternehmen.ch"
                className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.company_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm`}
              />
              {errors.company_email && <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Umsatzsteuer-ID (optional)
              </label>
              <input
                type="text"
                value={formData.vat_id || ''}
                onChange={(e) => handleFormDataChange('vat_id', e.target.value)}
                placeholder="CHE-XXX.XXX.XXX"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter shadow-sm"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-inter">Wird geladen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Logo />
            <ThemeToggle />
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Follow-up Fragebogen</h1>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                Schritt {currentStep} von {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              {steps.map((step, index) => (
                <span 
                  key={step.id}
                  className={`${index + 1 <= currentStep ? 'text-teal-600 dark:text-teal-400 font-semibold' : ''}`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-8">
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
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-inter font-semibold"
            >
              <ChevronLeftIcon className="w-5 h-5 mr-2" />
              Zurück
            </button>

            {currentStep === steps.length ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !validateCurrentStep()}
                className="flex items-center px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-inter font-semibold shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Wird übermittelt...
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5 mr-2" />
                    Fragebogen abschließen
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 transition-all duration-300 font-inter font-semibold"
              >
                Weiter
                <ChevronRightIcon className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
