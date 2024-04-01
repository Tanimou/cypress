import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster';
import './globals.css'
// import db from '@/lib/supabase/db'
import { ThemeProvider } from '@/lib/providers/next-theme-provider'
import { DM_Sans } from 'next/font/google'
import { twMerge } from 'tailwind-merge'
import AppStateProvider from '@/lib/providers/state-provider';
import { SupabaseUserProvider } from '@/lib/providers/supabase-user-provider';
import { SocketProvider } from '@/lib/providers/socket-provider';


const inter = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cypress',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
  }) {
  // console.log(db)
  return (
    <html lang="en">
      <body className={twMerge('bg-background',inter.className)}>
        <ThemeProvider attribute='class' defaultTheme='dark' enableSystem>

          <AppStateProvider>
            <SupabaseUserProvider>
              <SocketProvider>
                {children}
                <Toaster />
              </SocketProvider>
            </SupabaseUserProvider>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
