import './globals.css';

export const metadata = {
  title: 'DotUp — White & Lush Sanctuary Edition',
  description: 'Interactive 3D Voxel Developer Workstation Configurator & Sanctuary Engine',
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
