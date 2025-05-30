import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hexy Framework - Semantic Context Language (SCL)',
  description: 'SCL es un lenguaje vivo que evoluciona con tu organización. Define conceptos, procesos y reglas en un formato que tanto humanos como IA pueden entender y transformar en sistemas ejecutables.',
  keywords: ['SCL', 'Semantic Context Language', 'Organization Framework', 'DDD', 'Hexagonal Architecture', 'AI', 'Automation'],
  authors: [{ name: 'HEXI Organization' }],
  openGraph: {
    title: 'Hexy Framework - Semantic Context Language (SCL)',
    description: 'Un lenguaje operativo que conecte humanos, máquinas e inteligencia artificial desde el contexto.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hexy Framework - SCL',
    description: 'Semantic Context Language para organizaciones vivas',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 