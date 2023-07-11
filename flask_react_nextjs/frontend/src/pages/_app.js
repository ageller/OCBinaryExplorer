// my style sheet
import '@/styles/index.css'

// added by default when I created the next app.  But maybe I don't want this (could delete file)
// import '@/styles/globals.css'

import React from 'react';
import App from 'next/app';
import { GlobalStateProvider } from '../context/globalState';

class MyApp extends App {
    render() {
        const { Component, pageProps } = this.props;
        return (
            <GlobalStateProvider>
                <Component {...pageProps} />
            </GlobalStateProvider>
        );
    }
}

export default MyApp;


// export default function App({ Component, pageProps }) {
//     return <Component {...pageProps} />
// }
