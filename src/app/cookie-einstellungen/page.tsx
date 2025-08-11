'use client'

import { useState, useEffect } from 'react'
import { Logo } from '@/components/Logo'
import Link from 'next/link'

export default function CookieEinstellungen() {
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load existing preferences
    const consent = localStorage.getItem('cookie-consent')
    if (consent) {
      const consentData = JSON.parse(consent)
      setPreferences(consentData)
    }
  }, [])

  const savePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: Date.now(),
      version: '1.0'
    }
    
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    localStorage.setItem('cookie-consent-timestamp', Date.now().toString())
    localStorage.setItem('cookie-consent-details', JSON.stringify(consentData))
    
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    
    // Reload page to apply changes
    setTimeout(() => window.location.reload(), 1000)
  }

  const clearAllCookies = () => {
    localStorage.removeItem('cookie-consent')
    localStorage.removeItem('cookie-consent-timestamp')
    localStorage.removeItem('cookie-consent-details')
    
    setPreferences({
      necessary: true,
      analytics: false,
      marketing: false,
    })
    
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center space-x-3 mb-4">
            <Logo size="md" className="flex-shrink-0" />
            <span className="text-xl font-bold">Customer Flows</span>
          </div>
          <h1 className="text-3xl font-bold">Cookie-Einstellungen</h1>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-8">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Hier können Sie Ihre Cookie-Präferenzen verwalten. Änderungen werden sofort wirksam.
            </p>
          </div>

          {saved && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
              <p className="text-green-700 dark:text-green-300 font-medium">
                ✓ Einstellungen erfolgreich gespeichert!
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Necessary Cookies */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Notwendige Cookies
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Diese Cookies sind für die grundlegende Funktionalität der Website erforderlich und können nicht deaktiviert werden.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Zweck:</strong> Authentifizierung, Sicherheit, Grundfunktionen<br/>
                    <strong>Speicherdauer:</strong> Session oder bis zu 30 Tage
                  </div>
                </div>
                <div className="ml-6">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="w-6 h-6 rounded border-gray-300 text-teal-600 focus:ring-teal-500 opacity-50 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Analyse-Cookies (Hotjar, Google Analytics)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Diese Cookies helfen uns zu verstehen, wie Besucher unsere Website nutzen, 
                    und ermöglichen es uns, die Benutzererfahrung zu verbessern.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <strong>Services:</strong> Hotjar (Heatmaps, Recordings), Google Analytics<br/>
                    <strong>Daten:</strong> Anonymisierte Nutzungsstatistiken, Seitenaufrufe, Klicks<br/>
                    <strong>Speicherdauer:</strong> Bis zu 365 Tage
                  </div>
                  <div className="space-y-2">
                    <a 
                      href="https://www.hotjar.com/policies/do-not-track/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm underline"
                    >
                      🚫 Direkt bei Hotjar opt-out
                    </a>
                  </div>
                </div>
                <div className="ml-6">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                    className="w-6 h-6 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Marketing-Cookies (Meta Pixel)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Diese Cookies werden verwendet, um Ihnen relevante Werbung zu zeigen und die 
                    Effektivität von Werbekampagnen zu messen.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <strong>Services:</strong> Meta Pixel (Facebook/Instagram Ads)<br/>
                    <strong>Zweck:</strong> Remarketing, Conversion-Tracking<br/>
                    <strong>Speicherdauer:</strong> Bis zu 90 Tage
                  </div>
                </div>
                <div className="ml-6">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                    className="w-6 h-6 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={savePreferences}
              className="flex-1 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors font-medium"
            >
              Einstellungen speichern
            </button>
            <button
              onClick={clearAllCookies}
              className="flex-1 px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
            >
              Alle Cookies löschen
            </button>
          </div>

          {/* Additional Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Weitere Informationen
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Detaillierte Informationen über unsere Datenverarbeitung finden Sie in unserer Datenschutzerklärung.
            </p>
            <Link 
              href="/datenschutz"
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 underline"
            >
              → Datenschutzerklärung lesen
            </Link>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/" 
              className="inline-flex items-center text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-semibold"
            >
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
