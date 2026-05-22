"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[80vh] md:min-h-[85vh] items-center overflow-hidden px-4 sm:px-6 md:px-10 py-16 sm:py-20 pt-32 md:pt-36">

      {/* background glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255, 110, 169, 0.18), var(--background), var(--background))",
        }}
      />

      {/* character */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center md:justify-end md:pr-10">
        <Image
          src="/character2.png"
          alt="Character"
          width={800}
          height={800}
          priority
          className="
            w-[280px] sm:w-[380px] md:w-[600px] lg:w-[650px]
            translate-y-[-5rem] sm:translate-y-[5rem] md:translate-y-0
            opacity-30 sm:opacity-40 md:opacity-100 object-contain
          "
        />
      </div>

      {/* content */}
      <div className="relative z-10 flex w-full flex-col items-start md:pl-20">
        <div className="flex w-full max-w-2xl flex-col items-start">

          {/* TITLE */}
          <h1 className="relative flex w-full flex-col items-start font-spunky leading-[0.82] tracking-tight text-center md:text-left">
            <span className="hero-brand block text-[3.75rem] sm:text-[5.25rem] md:text-[7rem]">
              Honey&apos;s
            </span>
            <span className="hero-brand block text-[3.25rem] sm:text-[4.5rem] md:text-[6.2rem] sm:pl-6 md:pl-10">
              Mini Mart
            </span>
            <span className="mt-5 inline-flex rounded-full border border-white/60 bg-white/75 px-5 py-2 text-sm font-fredoka uppercase tracking-[0.35em] text-primary shadow-[0_10px_30px_rgba(255,110,169,0.18)] backdrop-blur sm:text-base">
              Sweet Deals Daily
            </span>
          </h1>

          {/* DESCRIPTION */}
          <div className="mt-12 sm:mt-16 md:mt-20 flex w-full flex-col items-center md:items-start gap-6 sm:gap-8">

            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xs sm:max-w-md md:max-w-lg text-center md:text-left mx-auto md:mx-0">
              Get discounted Robux at the best prices. Fast, reliable, and secure service with hundreds of satisfied customers.
            </p>

            <div className="flex w-full flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Link href="#pricelist" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:min-w-[170px]">
                  View Prices
                </Button>
              </Link>

              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:min-w-[170px]">
                  Order Now
                </Button>
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* GLOBAL CSS */}
      <style jsx global>{`
        .hero-brand {
          position: relative;
          color: #fffdfd;
          text-shadow:
            0 2px 0 rgba(255, 126, 174, 0.55),
            0 10px 26px rgba(255, 98, 164, 0.28);
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.95);
        }
      `}</style>

    </section>
  );
}
