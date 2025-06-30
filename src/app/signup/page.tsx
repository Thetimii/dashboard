'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signUpSchema, type SignUpFormData } from '@/lib/validations'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Logo } from '@/components/Logo'
import { motion } from 'framer-motion'

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signUp } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      await signUp(data.email, data.password, data.fullName)
      router.push('/kickoff')
    } catch (err: unknown) {
      setError((err as Error).message || 'Ein Fehler ist bei der Registrierung aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-200/50 dark:border-slate-600/50">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" priority className="filter drop-shadow-lg" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Willkommen bei Customer Flows
            </h1>
            <p className="text-gray-600 dark:text-white/80 font-inter">
              Erstelle deinen Account und starte durch
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-500/10 backdrop-blur-sm border border-red-200 dark:border-red-400/30 text-red-600 dark:text-red-300 px-4 py-3 rounded-xl mb-6"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2 font-inter">
                Vollständiger Name
              </label>
              <input
                {...register('fullName')}
                type="text"
                id="fullName"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800/90 backdrop-blur-sm border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter"
                placeholder="Dein vollständiger Name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2 font-inter">
                E-Mail Adresse
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800/90 backdrop-blur-sm border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter"
                placeholder="deine@email.ch"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-white/90 mb-2 font-inter">
                Passwort
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-3 bg-white dark:bg-slate-800/90 backdrop-blur-sm border border-gray-300 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300 font-inter"
                placeholder="Sicheres Passwort erstellen"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-300">{errors.password.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-teal-400 to-cyan-400 text-white py-4 px-6 rounded-xl font-bold font-inter tracking-wide focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl hover:shadow-teal-400/25"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  <span>Account wird erstellt...</span>
                </div>
              ) : (
                <span>Jetzt kostenlos starten</span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-white/70 font-inter">
              Bereits ein Account?{' '}
              <button
                onClick={() => router.push('/signin')}
                className="text-teal-600 dark:text-teal-300 hover:text-teal-700 dark:hover:text-teal-200 font-semibold transition-colors duration-200 underline-offset-2 hover:underline"
              >
                Hier anmelden
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
