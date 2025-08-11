'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CookieConsentProps {
  onConsentChangeAction: (consents: { analytics: boolean; marketing: boolean }) => void
}

export default function CookieConsent({ onConsentChangeAction }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent')
    const consentTimestamp = localStorage.getItem('cookie-consent-timestamp')
    
    // Show banner if no consent or if consent is older than 1 year
    if (!consent || !consentTimestamp || 
        (Date.now() - parseInt(consentTimestamp)) > 365 * 24 * 60 * 60 * 1000) {
      setShowBanner(true)
    } else {
      // Load existing preferences
      const savedPreferences = JSON.parse(consent)
      setPreferences(savedPreferences)
      onConsentChangeAction({
        analytics: savedPreferences.analytics,
        marketing: savedPreferences.marketing
      })
    }
  }, [onConsentChangeAction])

  const saveConsent = (newPreferences: typeof preferences) => {
    const consentData = {
      ...newPreferences,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences))
    localStorage.setItem('cookie-consent-timestamp', Date.now().toString())
    localStorage.setItem('cookie-consent-details', JSON.stringify(consentData))
    
    setPreferences(newPreferences)
    setShowBanner(false)
    onConsentChangeAction({
      analytics: newPreferences.analytics,
      marketing: newPreferences.marketing
    })
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
    })
  }

  const rejectAll = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      marketing: false,
    })
  }

  const savePreferences = () => {
    saveConsent(preferences)
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
      >
        <div className="max-w-7xl mx-auto p-4">
          {!showDetails ? (
            // Simple banner
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  🍪 Wir verwenden Cookies
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Wir nutzen Cookies und ähnliche Technologien, um die Nutzererfahrung zu verbessern und 
                  unsere Website zu analysieren. Dazu gehört auch Hotjar für Nutzerverhalten-Analytics. 
                  Sie können Ihre Einstellungen anpassen oder alle akzeptieren.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 min-w-max">
                <button
                  onClick={() => setShowDetails(true)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  Einstellungen
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  Nur notwendige
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>
          ) : (
            // Detailed preferences
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Cookie-Einstellungen
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Notwendige Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 opacity-50"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Analyse-Cookies (Hotjar)
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Helfen uns zu verstehen, wie Besucher unsere Website nutzen. Includes Hotjar für 
                      Heatmaps und Aufzeichnungen (anonymisiert). 
                      <a 
                        href="https://www.hotjar.com/policies/do-not-track/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-teal-600 hover:text-teal-700 underline ml-1"
                      >
                        Hotjar Opt-Out
                      </a>
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Marketing-Cookies
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Werden verwendet, um Ihnen relevante Werbung zu zeigen und die Effektivität 
                      von Werbekampagnen zu messen.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                      className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={rejectAll}
                  className="flex-1 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  Alle ablehnen
                </button>
                <button
                  onClick={savePreferences}
                  className="flex-1 px-4 py-2 text-sm bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
                >
                  Auswahl speichern
                </button>
                <button
                  onClick={acceptAll}
                  className="flex-1 px-4 py-2 text-sm bg-teal-700 hover:bg-teal-800 text-white rounded-lg transition-colors font-medium"
                >
                  Alle akzeptieren
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
