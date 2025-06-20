import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  fullName: z.string().min(2, 'Vollständiger Name muss mindestens 2 Zeichen lang sein'),
})

export const kickoffFormSchema = z.object({
  businessName: z.string().min(1, 'Firmenname ist erforderlich'),
  businessDescription: z.string().min(10, 'Geschäftsbeschreibung muss mindestens 10 Zeichen lang sein'),
  websiteStyle: z.enum(['clean', 'bold', 'minimalist', 'modern', 'classic'], {
    required_error: 'Bitte wähle einen Website-Stil',
  }),
  desiredPages: z.array(z.string()).min(1, 'Bitte wähle mindestens eine Seite aus'),
  colorPreferences: z.string().min(1, 'Farbpräferenzen sind erforderlich'),
  specialRequests: z.string().optional(),
})

export const fileUploadSchema = z.object({
  logo: z.instanceof(File).optional(),
  content: z.instanceof(File).optional(),
})

export const followupQuestionnaireSchema = z.object({
  // Ziel des Unternehmens (Business Goals)
  coreBusiness: z.string().min(10, 'Bitte beschreiben Sie Ihr Kerngeschäft ausführlicher.'),
  revenueGeneration: z.string().min(10, 'Bitte erklären Sie, wie Ihr Unternehmen Geld verdient.'),
  secondaryRevenue: z.string().optional(),
  longTermRevenue: z.string().optional(),
  
  // Wettbewerbsumfeld (Competitive Environment)
  uniqueSellingPoints: z.string().min(10, 'Bitte nennen Sie mindestens einen USP.'),
  customerChoiceReasons: z.string().min(10, 'Bitte geben Sie mindestens einen Grund an.'),
  problemsSolved: z.string().min(10, 'Bitte beschreiben Sie, welche Probleme Sie für Kunden lösen.'),
  trustBuilding: z.string().optional(),
  potentialObjections: z.string().optional(),
  
  // Zielgruppenanalyse (Target Group Analysis)
  targetGroupDemographics: z.string().min(10, 'Bitte beschreiben Sie Ihre Zielgruppe.'),
  targetGroupNeeds: z.string().optional(),
  
  // Inhaltsplanung (Content Planning)
  serviceSubpages: z.boolean(),
  serviceSubpagesDetails: z.string().optional(),
  existingContent: z.boolean(),
  existingContentDetails: z.string().optional(),
  existingContentFiles: z.array(z.string()).optional(), // For file URLs

  // Funktionalität (Functionality)
  requiredFunctions: z.array(z.string()).optional(),
  ecommerceNeeded: z.boolean(),
  blogNeeded: z.boolean(),
  newsletterNeeded: z.boolean(),
  memberAreaNeeded: z.boolean(),
  socialMediaNeeded: z.boolean(),
  whatsappChatNeeded: z.boolean(),
  appointmentBooking: z.boolean(),
  appointmentTool: z.string().optional(),
  existingSeoKeywords: z.string().optional(),
  googleAnalyticsNeeded: z.boolean(),
  
  // Domain & Hosting
  desiredDomain: z.string().optional(),
  
  // Rechtliche Anforderungen (Legal Requirements)
  privacyPolicyExists: z.boolean(),
  privacyPolicyCreationNeeded: z.boolean(),
  privacyPolicyContent: z.string().optional(),
  companyAddress: z.string().min(5, 'Bitte geben Sie eine gültige Adresse ein.'),
  companyPhone: z.string().min(5, 'Bitte geben Sie eine gültige Telefonnummer ein.'),
  companyEmail: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein.'),
  vatId: z.string().optional(),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type KickoffFormData = z.infer<typeof kickoffFormSchema>
export type FileUploadData = z.infer<typeof fileUploadSchema>
export type FollowupQuestionnaireData = z.infer<typeof followupQuestionnaireSchema>
