'use client'

import { useEffect } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

interface MetaPixelProps {
  pixelId: string
}

export default function MetaPixel({ pixelId }: MetaPixelProps) {
  return (
    <>
      <Script
        id="meta-pixel-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

// Helper functions for tracking events
export const fbq = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args)
  }
}

// Convenience functions for common events
export const trackEvent = (eventName: string, parameters?: any) => {
  fbq('track', eventName, parameters)
}

export const trackCustomEvent = (eventName: string, parameters?: any) => {
  fbq('trackCustom', eventName, parameters)
}

export const trackPageView = () => {
  fbq('track', 'PageView')
}

export const trackCompleteRegistration = (parameters?: any) => {
  fbq('track', 'CompleteRegistration', parameters)
}

export const trackViewContent = (parameters?: any) => {
  fbq('track', 'ViewContent', parameters)
}

export const trackContact = (parameters?: any) => {
  fbq('track', 'Contact', parameters)
}

export const trackInitiateCheckout = (parameters?: any) => {
  fbq('track', 'InitiateCheckout', parameters)
}
