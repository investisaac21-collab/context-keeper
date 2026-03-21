import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Keeper — La memoria operativa de tu IA',
  description: 'Guarda personalidad, instrucciones, variables y contexto. Recupéralos en segundos y continúa donde lo dejaste — en cualquier sesión, con cualquier IA.',
  keywords: ['IA', 'prompts', 'memoria', 'ChatGPT', 'Claude', 'Gemini', 'contexto', 'productividad'],
  authors: [{ name: 'Keeper' }],
  openGraph: {
    title: 'Keeper — La memoria operativa de tu IA',
    description: 'Haz que tu IA no empiece de cero. Guarda contexto, instrucciones y personalidad. Recupéralos en segundos.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Keeper',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Keeper — La memoria operativa de tu IA',
    description: 'Haz que tu IA no empiece de cero. Guarda contexto, instrucciones y personalidad. Recupéralos en segundos.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
