import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { PricelistSection } from "@/components/pricelist-section"
import { VouchesSection } from "@/components/vouches-section"
import { SocialMediaSection } from "@/components/social-media-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <PricelistSection />
        <VouchesSection />

        {/* ✅ ADD THIS */}
        <SocialMediaSection />
      </main>

      <Footer />
    </div>
  )
}