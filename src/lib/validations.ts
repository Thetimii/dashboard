import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen lang sein'),
  fullName: z.string().min(2, 'Vollständiger Name muss mindestens 2 Zeichen lang sein'),
  phoneNumber: z.string().min(10, 'Telefonnummer muss mindestens 10 Zeichen lang sein').regex(/^[\+]?[1-9][\d]{0,15}$/, 'Bitte gib eine gültige Telefonnummer ein'),
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

export type SignUpFormData = z.infer<typeof signUpSchema>
export type KickoffFormData = z.infer<typeof kickoffFormSchema>
export type FileUploadData = z.infer<typeof fileUploadSchema>
