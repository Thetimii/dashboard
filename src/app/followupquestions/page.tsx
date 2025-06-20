'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { followupQuestionnaireSchema, type FollowupQuestionnaireData } from '@/lib/validations'
import { validateSession } from '@/lib/auth-recovery'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'

export default function FollowupQuestionsPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentSection, setCurrentSection] = useState(0)
  
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FollowupQuestionnaireData>({
    resolver: zodResolver(followupQuestionnaireSchema),
    defaultValues: {
      serviceSubpages: false,
      existingContent: false,
      ecommerceNeeded: false,
      blogNeeded: false,
      newsletterNeeded: false,
      memberAreaNeeded: false,
      socialMediaNeeded: false,
      whatsappChatNeeded: false,
      appointmentBooking: false,
      googleAnalyticsNeeded: false,
      privacyPolicyExists: false,
      privacyPolicyCreationNeeded: false,
    },
  })

  // Watch form values for conditional fields
  const watchServiceSubpages = watch('serviceSubpages')
  const watchExistingContent = watch('existingContent')
  const watchAppointmentBooking = watch('appointmentBooking')
  const watchPrivacyPolicyExists = watch('privacyPolicyExists')

  const checkPaymentStatusAndPrefill = useCallback(async () => {
    if (!user) {
      return
    }

    try {
      const { data: kickoffData, error: kickoffError } = await supabase
        .from('kickoff_forms')
        .select('business_description')
        .eq('user_id', user.id)
        .single()

      if (kickoffError && kickoffError.code !== 'PGRST116') {
        console.error('Error fetching kickoff data:', kickoffError)
      }

      if (kickoffData?.business_description) {
        setValue('coreBusiness', kickoffData.business_description, { shouldTouch: true })
      }

      const { data: existingQuestionnaire, error: questionnaireError } = await supabase
        .from('followup_questionnaires')
        .select('completed')
        .eq('user_id', user.id)
        .single()

      if (questionnaireError && questionnaireError.code !== 'PGRST116') {
        console.error('Error checking for existing questionnaire:', questionnaireError)
      }

      if (existingQuestionnaire?.completed) {
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error during prefill check:', error)
    }
  }, [user, supabase, setValue, setSubmitted])

  useEffect(() => {
    if (authLoading) {
      return
    }
    if (!user) {
      router.push('/signin')
      return
    }

    const runChecks = async () => {
      const isValid = await validateSession()
      if (!isValid) {
        console.error('Session validation failed, redirecting to signin.')
        router.push('/signin')
        return
      }
      await checkPaymentStatusAndPrefill()
    }

    runChecks()
  }, [user, authLoading, router, checkPaymentStatusAndPrefill])

  const onSubmit = async (data: FollowupQuestionnaireData) => {
    if (!user) {
      setError('Sie sind nicht angemeldet. Bitte melden Sie sich erneut an.')
      router.push('/signin')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Verify user session before submitting
      const isValid = await validateSession()
      if (!isValid) {
        console.error('Session validation failed during form submission')
        setError('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.')
        router.push('/signin')
        return
      }

      // Convert form data to database format
      const questionnaireData = {
        user_id: user.id,
        core_business: data.coreBusiness,
        revenue_generation: data.revenueGeneration,
        secondary_revenue: data.secondaryRevenue || null,
        long_term_revenue: data.longTermRevenue || null,
        unique_selling_points: data.uniqueSellingPoints,
        customer_choice_reasons: data.customerChoiceReasons,
        problems_solved: data.problemsSolved,
        trust_building: data.trustBuilding,
        potential_objections: data.potentialObjections || null,
        main_competitors: data.mainCompetitors || null,
        competitor_strengths: data.competitorStrengths || null,
        target_group_demographics: data.targetGroupDemographics,
        target_group_needs: data.targetGroupNeeds || null,
        service_subpages: data.serviceSubpages,
        service_subpages_details: data.serviceSubpagesDetails || null,
        existing_content: data.existingContent,
        existing_content_details: data.existingContentDetails || null,
        required_functions: data.requiredFunctions || [],
        ecommerce_needed: data.ecommerceNeeded,
        blog_needed: data.blogNeeded,
        newsletter_needed: data.newsletterNeeded,
        member_area_needed: data.memberAreaNeeded,
        social_media_needed: data.socialMediaNeeded,
        whatsapp_chat_needed: data.whatsappChatNeeded,
        appointment_booking: data.appointmentBooking,
        appointment_tool: data.appointmentTool || null,
        existing_seo_keywords: data.existingSeoKeywords || null,
        google_analytics_needed: data.googleAnalyticsNeeded,
        desired_domain: data.desiredDomain || null,
        privacy_policy_exists: data.privacyPolicyExists,
        privacy_policy_creation_needed: data.privacyPolicyCreationNeeded,
        company_address: data.companyAddress,
        company_phone: data.companyPhone,
        company_email: data.companyEmail,
        vat_id: data.vatId || null,
        completed: true,
      }

      // Check if questionnaire exists and update, otherwise insert
      try {
        const { data: existingQuestionnaire, error: fetchError } = await supabase
          .from('followup_questionnaires')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error checking existing questionnaire:', fetchError)
          throw fetchError
        }

        if (existingQuestionnaire) {
          console.log('Updating existing questionnaire:', existingQuestionnaire.id)
          const { error } = await supabase
            .from('followup_questionnaires')
            .update(questionnaireData)
            .eq('id', existingQuestionnaire.id)

          if (error) throw error
        } else {
          console.log('Creating new questionnaire')
          const { error } = await supabase
            .from('followup_questionnaires')
            .insert([questionnaireData])

          if (error) throw error
        }

        console.log('Questionnaire saved successfully')
        setSubmitted(true)
        
        // Redirect to dashboard after successful submission
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
        
      } catch (dbError: any) {
        console.error('Database error:', dbError)
        
        // Check if it's a table not found error (406/relation error)
        if (dbError.message?.includes('relation') || dbError.message?.includes('table') || dbError.code === 'PGRST116') {
          setError('Die Datenbank-Tabelle wurde noch nicht erstellt. Bitte kontaktiere den Support.')
        } else if (dbError.message?.includes('JWT') || dbError.code === 'PGRST301') {
          setError('Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.')
          setTimeout(() => router.push('/signin'), 2000)
        } else {
          throw dbError
        }
      }

    } catch (error: any) {
      console.error('Error saving questionnaire:', error)
      
      // Provide specific error messages
      if (error.message?.includes('relation') || error.message?.includes('table')) {
        setError('Die Datenbank-Tabelle für Fragebögen ist noch nicht verfügbar. Bitte kontaktiere den Support.')
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setError('Netzwerkfehler. Bitte überprüfe deine Internetverbindung und versuche es erneut.')
      } else if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        setError('Authentifizierungsfehler. Bitte melden Sie sich erneut an.')
        setTimeout(() => router.push('/signin'), 2000)
      } else {
        setError('Fehler beim Speichern des Fragebogens. Bitte versuche es erneut oder kontaktiere den Support.')
      }
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    {
      title: 'Ziel des Unternehmens',
      description: 'Erzählen Sie uns mehr über Ihr Geschäft',
    },
    {
      title: 'Wettbewerbsumfeld',
      description: 'Was macht Sie einzigartig?',
    },
    {
      title: 'Zielgruppe',
      description: 'Wer sind Ihre Kunden?',
    },
    {
      title: 'Inhalte & Funktionen',
      description: 'Was soll Ihre Website können?',
    },
    {
      title: 'Domain & Rechtliches',
      description: 'Abschließende Details',
    },
  ]

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Vielen Dank!
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Ihre Antworten wurden erfolgreich gespeichert. Wir werden diese Informationen verwenden, um Ihre perfekte Website zu erstellen.
            </p>
            
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold"
            >
              Zurück zum Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // Show error message if there's a database issue
  if (error && error.includes('Datenbank-Tabelle')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationCircleIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Setup in Bearbeitung
            </h1>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Die Datenbank-Tabelle für den Nachfrage-Fragebogen wird gerade eingerichtet. Bitte versuche es in einigen Minuten erneut oder kontaktiere den Support.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 font-semibold"
              >
                Erneut versuchen
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
              >
                Zurück zum Dashboard
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="absolute top-4 left-4">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Zurück
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
              Detailfragebogen
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Helfen Sie uns, Ihre perfekte Website zu erstellen
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={`flex items-center ${
                    index <= currentSection ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      index <= currentSection
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < sections.length - 1 && (
                    <div
                      className={`w-12 md:w-24 h-1 ml-2 ${
                        index < currentSection
                          ? 'bg-blue-600 dark:bg-blue-400'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {sections[currentSection].title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {sections[currentSection].description}
              </p>
            </div>
          </div>

          {/* Form */}
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Section 0: Ziel des Unternehmens */}
              {currentSection === 0 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Was ist das Kerngeschäft des Unternehmens? *
                    </label>
                    <textarea
                      {...register('coreBusiness')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Beschreiben Sie Ihr Hauptgeschäft..."
                    />
                    {errors.coreBusiness && (
                      <p className="text-red-500 text-sm mt-1">{errors.coreBusiness.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wie wird der Umsatz generiert? (Hauptprodukt/Dienstleistung) *
                    </label>
                    <textarea
                      {...register('revenueGeneration')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Beschreiben Sie Ihre Haupteinnahmequellen..."
                    />
                    {errors.revenueGeneration && (
                      <p className="text-red-500 text-sm mt-1">{errors.revenueGeneration.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nebeneinnahmen (optional)
                    </label>
                    <textarea
                      {...register('secondaryRevenue')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Weitere Einnahmequellen..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Langfristige Einnahmen (optional)
                    </label>
                    <textarea
                      {...register('longTermRevenue')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Geplante zukünftige Einnahmequellen..."
                    />
                  </div>
                </div>
              )}

              {/* Section 1: Wettbewerbsumfeld */}
              {currentSection === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Was sind die Alleinstellungsmerkmale (USPs) Ihres Unternehmens? *
                    </label>
                    <textarea
                      {...register('uniqueSellingPoints')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Was macht Sie einzigartig?"
                    />
                    {errors.uniqueSellingPoints && (
                      <p className="text-red-500 text-sm mt-1">{errors.uniqueSellingPoints.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Warum sollte ein Kunde bei Ihnen kaufen und nicht bei der Konkurrenz? *
                    </label>
                    <textarea
                      {...register('customerChoiceReasons')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ihre Vorteile gegenüber Mitbewerbern..."
                    />
                    {errors.customerChoiceReasons && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerChoiceReasons.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Welche Probleme lösen Sie für den Kunden? *
                    </label>
                    <textarea
                      {...register('problemsSolved')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Beschreiben Sie die Kundenprobleme, die Sie lösen..."
                    />
                    {errors.problemsSolved && (
                      <p className="text-red-500 text-sm mt-1">{errors.problemsSolved.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wie schaffen Sie Vertrauen gegenüber Ihren Kunden? *
                    </label>
                    <textarea
                      {...register('trustBuilding')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="z.B. seit wann am Markt, Anzahl der Kunden, besondere Services, Support..."
                    />
                    {errors.trustBuilding && (
                      <p className="text-red-500 text-sm mt-1">{errors.trustBuilding.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Welche Einwände könnten potenzielle Kunden davon abhalten, bei Ihnen zu kaufen? (optional)
                    </label>
                    <textarea
                      {...register('potentialObjections')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Mögliche Kundenbedenken..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wer sind Ihre stärksten Mitbewerber? (optional)
                    </label>
                    <textarea
                      {...register('mainCompetitors')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Ihre Hauptkonkurrenten..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Was zeichnet Ihre Mitbewerber aus? (optional)
                    </label>
                    <textarea
                      {...register('competitorStrengths')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Stärken der Konkurrenz..."
                    />
                  </div>
                </div>
              )}

              {/* Section 2: Zielgruppe */}
              {currentSection === 2 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wer ist Ihre Zielgruppe? (Alter, Geschlecht, Interessen, Verhalten, Kaufkraft) *
                    </label>
                    <textarea
                      {...register('targetGroupDemographics')}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Beschreiben Sie Ihre Zielgruppe detailliert..."
                    />
                    {errors.targetGroupDemographics && (
                      <p className="text-red-500 text-sm mt-1">{errors.targetGroupDemographics.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Welche Bedürfnisse und Probleme hat Ihre Zielgruppe? (optional)
                    </label>
                    <textarea
                      {...register('targetGroupNeeds')}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Bedürfnisse und Herausforderungen Ihrer Kunden..."
                    />
                  </div>
                </div>
              )}

              {/* Section 3: Inhalte & Funktionen */}
              {currentSection === 3 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Soll es Unterseiten für verschiedene Dienstleistungen oder Produkte geben?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('serviceSubpages')}
                          value="true"
                          className="mr-2"
                        />
                        Ja
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('serviceSubpages')}
                          value="false"
                          className="mr-2"
                        />
                        Nein
                      </label>
                    </div>
                  </div>

                  {watchServiceSubpages && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Details zu den gewünschten Unterseiten
                      </label>
                      <textarea
                        {...register('serviceSubpagesDetails')}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Welche Unterseiten sollen erstellt werden?"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Gibt es bereits Bilder und Texte, die wir verwenden können?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('existingContent')}
                          value="true"
                          className="mr-2"
                        />
                        Ja
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('existingContent')}
                          value="false"
                          className="mr-2"
                        />
                        Nein
                      </label>
                    </div>
                  </div>

                  {watchExistingContent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Details zu vorhandenen Inhalten
                      </label>
                      <textarea
                        {...register('existingContentDetails')}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Welche Inhalte sind bereits vorhanden?"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Welche Funktionen sind erforderlich?
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('ecommerceNeeded')}
                          className="mr-2"
                        />
                        E-Commerce
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('blogNeeded')}
                          className="mr-2"
                        />
                        Blog
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('newsletterNeeded')}
                          className="mr-2"
                        />
                        Newsletter-Anmeldung
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('memberAreaNeeded')}
                          className="mr-2"
                        />
                        Mitgliederbereich
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('socialMediaNeeded')}
                          className="mr-2"
                        />
                        Social-Media-Anbindung
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('whatsappChatNeeded')}
                          className="mr-2"
                        />
                        WhatsApp-Business-Chat
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('appointmentBooking')}
                          className="mr-2"
                        />
                        Terminbuchung
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register('googleAnalyticsNeeded')}
                          className="mr-2"
                        />
                        Google Analytics
                      </label>
                    </div>
                  </div>

                  {watchAppointmentBooking && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Gibt es bereits ein Tool wie Calendly oder soll eine Lösung integriert werden?
                      </label>
                      <input
                        type="text"
                        {...register('appointmentTool')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="z.B. Calendly, oder 'neue Lösung gewünscht'"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Gibt es bestehende SEO-Strategien oder Keywords, die berücksichtigt werden sollen? (optional)
                    </label>
                    <textarea
                      {...register('existingSeoKeywords')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Wichtige Keywords oder SEO-Strategien..."
                    />
                  </div>
                </div>
              )}

              {/* Section 4: Domain & Rechtliches */}
              {currentSection === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Wie soll Ihre Website heißen? Gibt es eine Wunsch-Domain? (optional)
                    </label>
                    <input
                      type="text"
                      {...register('desiredDomain')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="z.B. meinefirma.ch"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      Gibt es bereits eine Datenschutzerklärung?
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('privacyPolicyExists')}
                          value="true"
                          className="mr-2"
                        />
                        Ja
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          {...register('privacyPolicyExists')}
                          value="false"
                          className="mr-2"
                        />
                        Nein
                      </label>
                    </div>
                  </div>

                  {!watchPrivacyPolicyExists && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                        Sollen wir eine Datenschutzerklärung für Sie erstellen?
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            {...register('privacyPolicyCreationNeeded')}
                            value="true"
                            className="mr-2"
                          />
                          Ja
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            {...register('privacyPolicyCreationNeeded')}
                            value="false"
                            className="mr-2"
                          />
                          Nein
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Adresse des Unternehmens *
                    </label>
                    <textarea
                      {...register('companyAddress')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Vollständige Firmenadresse..."
                    />
                    {errors.companyAddress && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyAddress.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Telefonnummer für die Website *
                    </label>
                    <input
                      type="tel"
                      {...register('companyPhone')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="+41 XX XXX XX XX"
                    />
                    {errors.companyPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      E-Mail-Adresse für die Website *
                    </label>
                    <input
                      type="email"
                      {...register('companyEmail')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="info@meinefirma.ch"
                    />
                    {errors.companyEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.companyEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Umsatzsteuer-ID (optional)
                    </label>
                    <input
                      type="text"
                      {...register('vatId')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="CHE-XXX.XXX.XXX MWST"
                    />
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    currentSection === 0
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Zurück
                </button>

                {currentSection < sections.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextSection}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold"
                  >
                    Weiter
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
                  >
                    {loading ? 'Wird gespeichert...' : 'Fragebogen abschließen'}
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
