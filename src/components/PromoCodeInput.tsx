'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TagIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface PromoCodeData {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  min_amount?: number
  max_discount?: number
  valid_from: string
  valid_until: string
  usage_limit?: number
  used_count: number
  is_active: boolean
}

interface PromoCodeInputProps {
  originalAmount: number
  onPromoCodeApplied: (data: {
    promoCode: string
    discountAmount: number
    finalAmount: number
    promoCodeData: PromoCodeData
  }) => void
  onPromoCodeRemoved: () => void
  disabled?: boolean
  className?: string
}

export function PromoCodeInput({ 
  originalAmount, 
  onPromoCodeApplied, 
  onPromoCodeRemoved, 
  disabled = false,
  className = '' 
}: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string
    discountAmount: number
    finalAmount: number
    promoCodeData: PromoCodeData
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validatePromoCode = useCallback(async (promoCode: string) => {
    if (!promoCode.trim()) return

    setIsValidating(true)
    setError(null)

    try {
      const response = await fetch('/api/validate-promo-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promo_code: promoCode.trim().toUpperCase(),
          amount: originalAmount
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to validate promo code')
      }

      if (data.valid) {
        const discountAmount = data.discount_amount
        const finalAmount = originalAmount - discountAmount

        const promoData = {
          code: promoCode.trim().toUpperCase(),
          discountAmount,
          finalAmount,
          promoCodeData: data.promo_code
        }

        setAppliedPromo(promoData)
        onPromoCodeApplied(promoData)
        setCode('')
      } else {
        throw new Error(data.reason || 'Invalid promo code')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to validate promo code'
      setError(errorMessage)
      console.error('Promo code validation error:', err)
    } finally {
      setIsValidating(false)
    }
  }, [originalAmount, onPromoCodeApplied])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.trim() && !isValidating && !appliedPromo && !disabled) {
      validatePromoCode(code)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setError(null)
    setCode('')
    onPromoCodeRemoved()
  }

  const formatAmount = (amount: number) => {
    return `${(amount / 100).toFixed(2)} CHF`
  }

  const formatDiscount = (promoCodeData: PromoCodeData, discountAmount: number) => {
    if (promoCodeData.discount_type === 'percentage') {
      return `${promoCodeData.discount_value}% off (-${formatAmount(discountAmount)})`
    } else {
      return `-${formatAmount(discountAmount)}`
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <AnimatePresence mode="wait">
        {!appliedPromo ? (
          <motion.div
            key="promo-input"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    disabled={disabled || isValidating}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                             placeholder-gray-500 dark:placeholder-gray-400
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors duration-200"
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={!code.trim() || isValidating || disabled}
                  whileHover={{ scale: disabled || isValidating ? 1 : 1.02 }}
                  whileTap={{ scale: disabled || isValidating ? 1 : 0.98 }}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg 
                           hover:bg-blue-700 dark:hover:bg-blue-600 
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
                           focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                           transition-colors duration-200 font-medium min-w-[80px]"
                >
                  {isValidating ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    'Apply'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="promo-applied"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Promo code applied!
                  </p>
                  <div className="mt-1 space-y-1">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      <span className="font-mono font-semibold">{appliedPromo.code}</span> - {' '}
                      {formatDiscount(appliedPromo.promoCodeData, appliedPromo.discountAmount)}
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                      <span className="text-green-700 dark:text-green-300 line-through">
                        {formatAmount(originalAmount)}
                      </span>
                      <span className="font-semibold text-green-800 dark:text-green-200">
                        {formatAmount(appliedPromo.finalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleRemovePromo}
                disabled={disabled}
                className="p-1 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Remove promo code"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-start space-x-2 text-red-600 dark:text-red-400 text-sm"
          >
            <ExclamationCircleIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
