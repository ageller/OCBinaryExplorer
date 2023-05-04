// my style sheet
import '@/styles/index.css'

// added by default when I created the next app.  But maybe I don't want this (could delete file)
// import '@/styles/globals.css'

export default function App({ Component, pageProps }) {
    return <Component {...pageProps} />
}
