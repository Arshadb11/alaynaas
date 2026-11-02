'use client';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useApp } from './Providers';

/* IDs are validated before they are placed in a script, so a bad setting can never inject code. */
const clean = (v, re) => (typeof v === 'string' && re.test(v.trim()) ? v.trim() : '');

/** Google Analytics 4, Google Tag Manager and Meta Pixel, all switched on by IDs in Admin > Storefront > Pages > SEO. */
export default function Analytics() {
  const { settings = {} } = useApp();
  const pathname = usePathname();
  const ga = clean(settings.tracking_ga4_id, /^G-[A-Z0-9]{4,20}$/i);
  const gtm = clean(settings.tracking_gtm_id, /^GTM-[A-Z0-9]{4,12}$/i);
  const px = clean(settings.tracking_meta_pixel_id, /^\d{5,20}$/);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq('track', 'PageView');
  }, [pathname]);

  return (
    <>
      {gtm && (
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}</Script>
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga}');`}</Script>
        </>
      )}
      {px && (
        <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${px}');fbq('track','PageView');`}</Script>
      )}
    </>
  );
}
