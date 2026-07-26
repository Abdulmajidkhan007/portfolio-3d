import { useState } from 'react'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { useLenis } from '@/hooks/useLenis'
import Navbar from '@/components/Navbar'
import ScrollProgress from '@/components/ScrollProgress'
import CustomCursor from '@/components/CustomCursor'
import LoadingScreen, { introAlreadySeen } from '@/components/LoadingScreen'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Projects from '@/components/Projects'
import Skills from '@/components/Skills'
import Experience from '@/components/Experience'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

function Site() {
  const [intro, setIntro] = useState(() => !introAlreadySeen())
  useLenis()

  return (
    <>
      {intro && <LoadingScreen onDone={() => setIntro(false)} />}
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <LanguageProvider>
      <Site />
    </LanguageProvider>
  )
}
