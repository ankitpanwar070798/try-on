import CouplesConnection from '@/components/couple_card_game'
import { Demo } from '@/components/Demo'
import { FAQ } from '@/components/FAQ'
import { Footer } from '@/components/Footer'
import Hero from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import Navbar from '@/components/Navbar'
import { Pricing } from '@/components/Pricing'
import { Testimonials } from '@/components/Testimonials'
import React from 'react'

const page = () => {
  return (
    <div style={{
      backgroundImage: `
        radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.02) 2px, rgba(0,0,0,0.02) 4px)
      `,
      backgroundSize: "8px 8px, 32px 32px, 32px 32px",
    }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Demo />
      <Pricing />
      {/* <Testimonials /> */}
      <FAQ />
      <Footer/>
      <CouplesConnection/>
    </div>
  )
}

export default page