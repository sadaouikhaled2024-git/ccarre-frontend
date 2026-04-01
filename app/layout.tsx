import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { CreateAnnouncementButton } from '@/components/create-announcement-form'
import { BannedUserGuard } from '@/components/banned-user-guard'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CCarré - Plateforme d\'échange étudiante AMU',
  description: 'La plateforme d\'échange réservée aux étudiants d\'Aix-Marseille Université. Achetez, vendez, prêtez entre étudiants en toute sécurité.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className={`${dmSans.className} font-sans antialiased`}>
        <AuthProvider>
          <BannedUserGuard />
          {children}
          <CreateAnnouncementButton />
        </AuthProvider>
      </body>
    </html>
  )
}
