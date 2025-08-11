'use client'

import Script from 'next/script';
import { useEffect, useState } from 'react';

interface HotjarProps {
  siteId: number;
  consentGiven?: boolean;
}

export default function Hotjar({ siteId, consentGiven = false }: HotjarProps) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Only load Hotjar if consent is given
    if (consentGiven) {
      setShouldLoad(true);
    } else {
      setShouldLoad(false);
      // Disable Hotjar if it was previously loaded
      if (typeof window !== 'undefined' && (window as any).hj) {
        (window as any).hj('trigger', 'opt_out');
      }
    }
  }, [consentGiven]);

  if (!shouldLoad) {
    return null;
  }

  return (
    <Script
      id="hotjar-tracking"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${siteId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        `,
      }}
    />
  );
}
