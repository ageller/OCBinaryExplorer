// import './globals.css'
import './index.css'

import React from 'react';
import { GlobalStateProvider } from './context/globalState';
// import { GlobalStateProvider } from '@/context/GlobalStateProvider';

export const metadata = {
  title: 'OC Binary Explorer',
  description: 'from Aaron M. Geller',
}


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Material Symbols */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />

        {/* Text fonts (moved from CSS) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@100&family=Rubik:wght@400;700&family=Ubuntu:ital,wght@0,400;1,500&display=swap"
        />
      </head>

      <body>
        <GlobalStateProvider>
          {children}
        </GlobalStateProvider>
      </body>
    </html>
  );
}