import { Suspense } from "react";
import Script from "next/script";
import { Oxygen } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { NextUIProvider } from "@nextui-org/react";
import { LoadingProvider } from "./contexts/loading";
import SessionWrapper from "./components/layout/SessionWrapper";
import GAClientTracker from "./components/GAClientTracker";
import LoadingSpinner from "./components/shared/LoadingSpinner";
import "./globals.css";
import FacebookPageView from "./components/FacebookPageView";
import Image from "next/image";

const oxygen = Oxygen({ subsets: ["latin"], weight: ["300", "400", "700"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}', { send_page_view: false });
          `}
        </Script>
        <Script
          id="facebook-pixel"
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
      fbq('init', '${process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}');
      fbq('track', 'PageView');
    `,
          }}
        />
        <noscript><Image height="1" width="1" style="display:none"
          src="https://www.facebook.com/tr?id=798745776549985&ev=PageView&noscript=1"
          alt="facebook_img"
        /></noscript>
      </head>
      <body className={oxygen.className}>
        <SessionWrapper>
          <NextUIProvider>
            <LoadingProvider>{children}</LoadingProvider>
          </NextUIProvider>
          <Toaster />
        </SessionWrapper>
        <Suspense fallback={<LoadingSpinner />}>
          <FacebookPageView />
          <GAClientTracker />
        </Suspense>
      </body>
    </html>
  );
}
