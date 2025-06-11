import { z } from 'zod'

export const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
})

export const kickoffFormSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  businessDescription: z.string().min(10, 'Business description must be at least 10 characters'),
  websiteStyle: z.enum(['clean', 'bold', 'minimalist', 'modern', 'classic'], {
    required_error: 'Please select a website style',
  }),
  desiredPages: z.array(z.string()).min(1, 'Please select at least one page'),
  colorPreferences: z.string().min(1, 'Color preferences are required'),
  specialRequests: z.string().optional(),
})

export const fileUploadSchema = z.object({
  logo: z.instanceof(File).optional(),
  content: z.instanceof(File).optional(),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type KickoffFormData = z.infer<typeof kickoffFormSchema>
export type FileUploadData = z.infer<typeof fileUploadSchema>
