import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SessionProvider from '@/components/SessionProvider'
import QueryProvider from '@/components/QueryProvider'

export const metadata: Metadata = {
  title: 'ScamShield — Online Scam Awareness Platform',
  description: 'Report, track, and learn about online scams to protect yourself and your community.',
  keywords: ['scam awareness', 'online safety', 'phishing', 'fraud reporting', 'cybersecurity'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="noise-texture">
        <div className="scan-line" />
        <SessionProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </SessionProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'toast-dark',
            duration: 4000,
            style: {
              background: '#13131A',
              border: '1px solid #1E1E2A',
              color: '#E8F4F8',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#C8FF00',
                secondary: '#0A0A0F',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF3B5C',
                secondary: '#0A0A0F',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
