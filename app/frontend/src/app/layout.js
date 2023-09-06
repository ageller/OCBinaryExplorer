// import './globals.css'
import './index.css'

import React from 'react';
import { GlobalStateProvider } from './context/globalState';

export const metadata = {
  title: 'OC Binary Explorer',
  description: 'from Aaron M. Geller',
}

export default function RootLayout({ children }) {
  return (
    <GlobalStateProvider>
        <html lang="en">
            <body>{children}</body>
        </html>
    </GlobalStateProvider>
  )
}