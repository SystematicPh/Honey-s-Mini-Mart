"use client"

import Image from "next/image"
import { Header } from "@/components/header"

export default function RulesPage() {
  return (
    <div className="min-h-screen flex flex-col">

      <Header />

      <div className="flex flex-col items-center p-6 space-y-6 mt-16">

        {/* TITLE */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Rules & Regulation</h1>
          <p className="text-muted-foreground text-sm">
            please read carefully!
          </p>
        </div>

        {/* THANK YOU SECTION (NEW) */}
        <div className="text-center max-w-md space-y-2">
          <h2 className="text-lg font-semibold">Thank You 🙏</h2>
          <p className="text-sm text-muted-foreground">
            We appreciate you taking the time to read our rules and regulations.
            Please make sure to follow them to ensure a smooth and safe experience.
          </p>
        </div>

        {/* IMAGE */}
        <div className="w-full max-w-md">
          <Image
            src="/r&r.png"
            alt="Rules and Regulation"
            width={800}
            height={600}
            className="w-full h-auto rounded-md shadow object-contain"
            priority
          />
        </div>

      </div>
    </div>
  )
}