'use client'

import { useState, useEffect } from 'react'
import Hotjar from './Hotjar'
import CookieConsent from './CookieConsent'
import GoogleAnalytics from './GoogleAnalytics'
import MetaPixel from './MetaPixel'

export default function ConsentManager() {
  const [analyticsConsent, setAnalyticsConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    // Check existing consent on mount
    const consent = localStorage.getItem('cookie-consent')
    if (consent) {
      const consentData = JSON.parse(consent)
      setAnalyticsConsent(consentData.analytics || false)
      setMarketingConsent(consentData.marketing || false)
      setHasConsent(true)
    } else {
      setHasConsent(false)
    }
  }, [])

  const handleConsentChange = (consents: { analytics: boolean; marketing: boolean }) => {
    setAnalyticsConsent(consents.analytics)
    setMarketingConsent(consents.marketing)
    setHasConsent(true)
  }

  return (
    <>
      {/* Analytics tracking - only loads with analytics consent */}
      <Hotjar siteId={6489624} consentGiven={analyticsConsent} />
      {analyticsConsent && <GoogleAnalytics measurementId="AW-17438573608" />}
      
      {/* Marketing tracking - only loads with marketing consent */}
      {marketingConsent && <MetaPixel pixelId="3672960629671381" />}
      
      {/* Cookie Consent Banner */}
      <CookieConsent onConsentChangeAction={handleConsentChange} />
    </>
  )
}
