import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SOS Hub Receptionist AI - Votre receptionniste intelligente',
  description: 'Receptionniste IA pour SOS Hub Canada - Capture de leads, resume d\'appels, sync CRM automatique',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
