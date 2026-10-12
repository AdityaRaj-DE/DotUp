import './globals.css';

export const metadata = {
  title: 'DotUp V3',
  description: 'DotUp V3 Platform Foundation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
