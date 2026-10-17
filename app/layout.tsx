import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata={title:'Litigation Hold Manager',description:'Personnel file preservation and release reviews.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
