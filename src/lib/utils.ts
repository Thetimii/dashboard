import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100)
}

export function uploadFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    // In a real implementation, this would upload to Supabase Storage
    // For now, we'll simulate a successful upload
    setTimeout(() => {
      const mockUrl = `https://example.com/uploads/${file.name}`
      resolve(mockUrl)
    }, 1000)
  })
}
