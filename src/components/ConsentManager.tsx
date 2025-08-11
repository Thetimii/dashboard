'use client'

import { useState, useEffect } from 'react'
import Hotjar from './Hotjar'
import CookieConsent from './CookieConsent'

export default function ConsentManager() {
  const [analyticsConsent, setAnalyticsConsent] = useState(false)
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    // Check existing consent on mount
    const consent = localStorage.getItem('cookie-consent')
    if (consent) {
      const consentData = JSON.parse(consent)
      setAnalyticsConsent(consentData.analytics || false)
      setHasConsent(true)
    } else {
      setHasConsent(false)
    }
  }, [])

  const handleConsentChange = (accepted: boolean) => {
    setAnalyticsConsent(accepted)
    setHasConsent(true)
  }

  return (
    <>
      {/* Hotjar - only loads with consent */}
      <Hotjar siteId={6489624} consentGiven={analyticsConsent} />
      
      {/* Cookie Consent Banner */}
      <CookieConsent onConsentChangeAction={handleConsentChange} />
    </>
  )
}
