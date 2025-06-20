'use client'

import { useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller, FieldError } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { CheckCircleIcon, ArrowLeftIcon, ExclamationCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { followupQuestionnaireSchema, type FollowupQuestionnaireData } from '@/lib/validations'
import { validateSession } from '@/lib/auth-recovery'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'

// Helper component for form fields to reduce repetition
const FormField = ({ label, children, error }: { label: string, children: ReactNode, error?: FieldError }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
  </div>
);

const requiredFunctionsList = [
  { id: 'newsletterNeeded', label: 'Newsletter-Anmeldung' },
  { id: 'whatsappChatNeeded', label: 'WhatsApp-Button' },
  { id: 'socialMediaNeeded', label: 'Social Media Icons' },
  { id: 'appointmentBooking', label: 'Terminbuchung' },
  { id: 'blogNeeded', label: 'Blog' },
  { id: 'memberAreaNeeded', label: 'Mitgliederbereich' },
  { id: 'ecommerceNeeded', label: 'E-Commerce/Shop' },
  { id: 'googleAnalyticsNeeded', label: 'Google Analytics' },
] as const;

export default function FollowupQuestionsPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FollowupQuestionnaireData>({
    resolver: zodResolver(followupQuestionnaireSchema),
    mode: 'onChange',
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

  const watchExistingContent = watch('existingContent')
  const watchAppointmentBooking = watch('appointmentBooking')
  const watchPrivacyPolicyExists = watch('privacyPolicyExists')
  const watchServiceSubpages = watch('serviceSubpages')

  const checkExistingData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: existingQuestionnaire, error: questionnaireError } = await supabase
        .from('followup_questionnaires')
        .select('completed')
        .eq('user_id', user.id)
        .maybeSingle();

      if (questionnaireError) throw questionnaireError;

      if (existingQuestionnaire?.completed) {
        setSubmitted(true);
        return;
      }

      const { data: kickoffForm, error: kickoffError } = await supabase
        .from('kickoff_forms')
        .select('business_description')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (kickoffError) throw kickoffError;

      if (kickoffForm?.business_description) {
        setValue('coreBusiness', kickoffForm.business_description, { shouldTouch: true });
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Fehler beim Laden der Formulardaten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  }, [user, supabase, setValue]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/signin');
      return;
    }
    
    const runChecks = async () => {
      const isValid = await validateSession();
      if (!isValid) {
        router.push('/signin');
        return;
      }
      await checkExistingData();
    };

    runChecks();
  }, [user, authLoading, router, checkExistingData]);

  const onSubmit = async (data: FollowupQuestionnaireData) => {
    if (!user) {
      setError('Nicht angemeldet. Bitte erneut einloggen.');
      router.push('/signin');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const isValid = await validateSession();
      if (!isValid) {
        setError('Sitzung abgelaufen. Bitte erneut einloggen.');
        router.push('/signin');
        return;
      }

      const fileUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const fileName = `${user.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('questionnaire-files')
            .upload(fileName, file);

          if (uploadError) throw new Error(`Fehler beim Hochladen der Datei: ${uploadError.message}`);
          
          const { data: urlData } = supabase.storage
            .from('questionnaire-files')
            .getPublicUrl(fileName);
          
          fileUrls.push(urlData.publicUrl);
        }
      }

      const questionnaireData = {
        user_id: user.id,
        core_business: data.coreBusiness,
        revenue_generation: data.revenueGeneration,
        secondary_revenue: data.secondaryRevenue,
        long_term_revenue: data.longTermRevenue,
        unique_selling_points: data.uniqueSellingPoints,
        customer_choice_reasons: data.customerChoiceReasons,
        problems_solved: data.problemsSolved,
        trust_building: data.trustBuilding,
        potential_objections: data.potentialObjections,
        target_group_demographics: data.targetGroupDemographics,
        target_group_needs: data.targetGroupNeeds,
        service_subpages: data.serviceSubpages,
        service_subpages_details: data.serviceSubpagesDetails,
        existing_content: data.existingContent,
        existing_content_details: data.existingContentDetails,
        existing_content_files: fileUrls,
        required_functions: [], // This field is deprecated in the new form structure but kept for db compatibility
        ecommerce_needed: data.ecommerceNeeded,
        blog_needed: data.blogNeeded,
        newsletter_needed: data.newsletterNeeded,
        member_area_needed: data.memberAreaNeeded,
        social_media_needed: data.socialMediaNeeded,
        whatsapp_chat_needed: data.whatsappChatNeeded,
        appointment_booking: data.appointmentBooking,
        appointment_tool: data.appointmentTool,
        existing_seo_keywords: data.existingSeoKeywords,
        google_analytics_needed: data.googleAnalyticsNeeded,
        desired_domain: data.desiredDomain,
        privacy_policy_exists: data.privacyPolicyExists,
        privacy_policy_creation_needed: data.privacyPolicyCreationNeeded,
        privacy_policy_content: data.privacyPolicyContent,
        company_address: data.companyAddress,
        company_phone: data.companyPhone,
        company_email: data.companyEmail,
        vat_id: data.vatId,
        completed: true,
      };

      const { error: upsertError } = await supabase
        .from('followup_questionnaires')
        .upsert(questionnaireData, { onConflict: 'user_id' });

      if (upsertError) throw upsertError;

      setSubmitted(true);
      setTimeout(() => router.push('/dashboard'), 2000);

    } catch (error: any) {
      console.error('Submission Error:', error);
      setError(error.message || 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (!user && !submitted)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p>Laden...</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Vielen Dank!</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Ihre Antworten wurden erfolgreich gespeichert.</p>
          <button onClick={() => router.push('/dashboard')} className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold">
            Zum Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="absolute top-4 left-4">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeftIcon className="w-5 h-5" />
          Zurück
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Logo size="lg" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-4">Detailfragebogen</h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">Helfen Sie uns, Ihre perfekte Website zu erstellen.</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Section: Business Basics */}
              <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Grundlagen</h2>
                <FormField label="Was ist das Kerngeschäft des Unternehmens? *" error={errors.coreBusiness}>
                  <textarea {...register('coreBusiness')} rows={4} className="w-full input-class" placeholder="Beschreiben Sie Ihr Hauptgeschäft..." />
                </FormField>
                <FormField label="Wie wird der Umsatz generiert? (Hauptprodukt/Dienstleistung) *" error={errors.revenueGeneration}>
                  <textarea {...register('revenueGeneration')} rows={4} className="w-full input-class" placeholder="Beschreiben Sie Ihre Haupteinnahmequellen..." />
                </FormField>
                <FormField label="Langfristige Einnahmen (optional)" error={errors.longTermRevenue}>
                  <textarea {...register('longTermRevenue')} rows={3} className="w-full input-class" placeholder="Geplante zukünftige Einnahmequellen..." />
                </FormField>
              </div>

              {/* Section: Competitive Landscape */}
              <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Wettbewerbsumfeld</h2>
                <FormField label="Was sind die Alleinstellungsmerkmale (USPs) Ihres Unternehmens? *" error={errors.uniqueSellingPoints}>
                  <textarea {...register('uniqueSellingPoints')} rows={4} className="w-full input-class" placeholder="Was macht Sie einzigartig?" />
                </FormField>
                <FormField label="Warum sollte ein Kunde bei Ihnen kaufen und nicht bei der Konkurrenz? *" error={errors.customerChoiceReasons}>
                  <textarea {...register('customerChoiceReasons')} rows={4} className="w-full input-class" placeholder="Ihre Vorteile gegenüber Mitbewerbern..." />
                </FormField>
                <FormField label="Welche Probleme lösen Sie für den Kunden? *" error={errors.problemsSolved}>
                  <textarea {...register('problemsSolved')} rows={4} className="w-full input-class" placeholder="Beschreiben Sie die Kundenprobleme, die Sie lösen..." />
                </FormField>
                <FormField label="Wie schaffen Sie Vertrauen gegenüber Ihren Kunden? (optional)" error={errors.trustBuilding}>
                  <textarea {...register('trustBuilding')} rows={4} className="w-full input-class" placeholder="z.B. seit wann am Markt, Anzahl der Kunden, besondere Services, Support..." />
                </FormField>
                <FormField label="Welche Einwände könnten potenzielle Kunden davon abhalten, bei Ihnen zu kaufen? (optional)" error={errors.potentialObjections}>
                  <textarea {...register('potentialObjections')} rows={3} className="w-full input-class" placeholder="Mögliche Kundenbedenken..." />
                </FormField>
              </div>

              {/* Section: Target Audience */}
              <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Zielgruppe</h2>
                <FormField label="Wer ist Ihre Zielgruppe? (Alter, Geschlecht, Interessen, etc.) *" error={errors.targetGroupDemographics}>
                  <textarea {...register('targetGroupDemographics')} rows={5} className="w-full input-class" placeholder="Beschreiben Sie Ihre Zielgruppe detailliert..." />
                </FormField>
                <FormField label="Welche Bedürfnisse und Probleme hat Ihre Zielgruppe? (optional)" error={errors.targetGroupNeeds}>
                  <textarea {...register('targetGroupNeeds')} rows={4} className="w-full input-class" placeholder="Bedürfnisse und Herausforderungen Ihrer Kunden..." />
                </FormField>
              </div>

              {/* Section: Content & Features */}
              <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Inhalte & Funktionen</h2>
                <FormField label="Soll es Unterseiten für verschiedene Dienstleistungen oder Produkte geben?" error={errors.serviceSubpages}>
                  <Controller
                    name="serviceSubpages"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center"><input type="radio" name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={() => field.onChange(true)} checked={field.value} className="mr-2" /> Ja</label>
                        <label className="flex items-center"><input type="radio" name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={() => field.onChange(false)} checked={!field.value} className="mr-2" /> Nein</label>
                      </div>
                    )}
                  />
                </FormField>
                {watchServiceSubpages && (
                  <FormField label="Details zu Dienstleistungs-Unterseiten" error={errors.serviceSubpagesDetails}>
                    <textarea {...register('serviceSubpagesDetails')} rows={3} className="w-full input-class" placeholder="Welche Unterseiten sollen erstellt werden?" />
                  </FormField>
                )}
                
                <FormField label="Gibt es bereits Bilder und Texte, die wir verwenden können?" error={errors.existingContent}>
                   <Controller
                    name="existingContent"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center"><input type="radio" name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={() => field.onChange(true)} checked={field.value} className="mr-2" /> Ja</label>
                        <label className="flex items-center"><input type="radio" name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={() => field.onChange(false)} checked={!field.value} className="mr-2" /> Nein</label>
                      </div>
                    )}
                  />
                </FormField>

                {watchExistingContent && (
                  <>
                    <FormField label="Details zu vorhandenen Inhalten" error={errors.existingContentDetails}>
                      <textarea {...register('existingContentDetails')} rows={3} className="w-full input-class" placeholder="Beschreiben Sie die vorhandenen Inhalte..." />
                    </FormField>
                    <FormField label="Dateien hochladen" error={undefined}>
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-6 py-10">
                        <div className="text-center">
                          <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-semibold text-blue-600 dark:text-blue-400">
                            <span>Dateien auswählen</span>
                            <input id="file-upload" type="file" multiple className="sr-only" onChange={(e) => setUploadedFiles(Array.from(e.target.files || []))} />
                          </label>
                          <p className="pl-1">oder hierher ziehen</p>
                          {uploadedFiles.length > 0 && (
                            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                              {uploadedFiles.length} Datei(en) ausgewählt.
                            </div>
                          )}
                        </div>
                      </div>
                    </FormField>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Welche Funktionen sind erforderlich?</label>
                  <div className="grid grid-cols-2 gap-4">
                    {requiredFunctionsList.map((func) => (
                      <label key={func.id} className="flex items-center">
                        <input type="checkbox" {...register(func.id)} className="h-4 w-4 rounded" />
                        <span className="ml-3 text-sm">{func.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {watchAppointmentBooking && (
                  <FormField label="Welches Tool für Terminbuchungen wird verwendet?" error={errors.appointmentTool}>
                    <input {...register('appointmentTool')} className="w-full input-class" placeholder="z.B. Calendly, HubSpot, etc." />
                  </FormField>
                )}
              </div>

              {/* Section: Legal & Domain */}
              <div className="space-y-6 p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Domain & Rechtliches</h2>
                <FormField label="Wunschdomain (optional)" error={errors.desiredDomain}>
                  <input {...register('desiredDomain')} className="w-full input-class" placeholder="z.B. meine-firma.de" />
                </FormField>
                <FormField label="Bestehende SEO-Keywords (optional)" error={errors.existingSeoKeywords}>
                  <textarea {...register('existingSeoKeywords')} rows={3} className="w-full input-class" placeholder="Bestehende Keywords..." />
                </FormField>
                <FormField label="Gibt es bereits eine Datenschutzerklärung?" error={errors.privacyPolicyExists}>
                   <Controller
                    name="privacyPolicyExists"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center"><input type="radio" name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={() => field.onChange(true)} checked={field.value} className="mr-2" /> Ja</label>
                        <label className="flex items-center"><input type="radio" name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={() => field.onChange(false)} checked={!field.value} className="mr-2" /> Nein</label>
                      </div>
                    )}
                  />
                </FormField>
                {watchPrivacyPolicyExists ? (
                  <FormField label="Inhalt der Datenschutzerklärung" error={errors.privacyPolicyContent}>
                    <textarea {...register('privacyPolicyContent')} rows={5} className="w-full input-class" placeholder="Fügen Sie hier den Text Ihrer bestehenden Datenschutzerklärung ein..." />
                  </FormField>
                ) : (
                  <FormField label="Soll eine neue Datenschutzerklärung erstellt werden?" error={errors.privacyPolicyCreationNeeded}>
                     <Controller
                        name="privacyPolicyCreationNeeded"
                        control={control}
                        render={({ field }) => (
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center"><input type="radio" name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={() => field.onChange(true)} checked={field.value} className="mr-2" /> Ja</label>
                            <label className="flex items-center"><input type="radio" name={field.name} ref={field.ref} onBlur={field.onBlur} onChange={() => field.onChange(false)} checked={!field.value} className="mr-2" /> Nein</label>
                          </div>
                        )}
                      />
                  </FormField>
                )}
                <FormField label="Firmenadresse *" error={errors.companyAddress}>
                  <input {...register('companyAddress')} className="w-full input-class" placeholder="Ihre Firmenadresse" />
                </FormField>
                <FormField label="Telefonnummer *" error={errors.companyPhone}>
                  <input {...register('companyPhone')} className="w-full input-class" placeholder="Ihre Telefonnummer" />
                </FormField>
                <FormField label="E-Mail-Adresse *" error={errors.companyEmail}>
                  <input type="email" {...register('companyEmail')} className="w-full input-class" placeholder="Ihre E-Mail-Adresse" />
                </FormField>
                <FormField label="Umsatzsteuer-ID (optional)" error={errors.vatId}>
                  <input {...register('vatId')} className="w-full input-class" placeholder="Ihre USt-IdNr." />
                </FormField>
              </div>

              <div className="flex justify-end pt-6">
                <button type="submit" disabled={loading} className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold disabled:opacity-50">
                  {loading ? 'Wird gespeichert...' : 'Fragebogen abschicken'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Add a global style for input fields to avoid repetition in className
const globalStyles = `
  .input-class {
    padding: 0.75rem 1rem;
    border: 1px solid #D1D5DB; /* gray-300 */
    border-radius: 0.5rem;
    width: 100%;
  }
  .dark .input-class {
    background-color: #374151; /* gray-700 */
    border-color: #4B5563; /* gray-600 */
    color: white;
  }
  .input-class:focus {
    --tw-ring-color: #3B82F6; /* blue-500 */
    box-shadow: 0 0 0 2px var(--tw-ring-color);
    border-color: #3B82F6; /* blue-500 */
    outline: none;
  }
`;

if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}
