import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import "./fonts.css"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://v0-jajasolaeci.vercel.app"),

  title: "Honey's Mini Mart - Discounted Robux",
  description:
    "Get discounted Robux at the best prices. Fast, reliable, and secure service.",
  generator: "v0.app",

  icons: {
    icon: [
      {
        url: "/icon.jpg",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon.jpg",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    apple: "/icon.jpg",
  },

  openGraph: {
    title: "Honey's Mini Mart - Discounted Robux",
    description:
      "Get discounted Robux at the best prices. Fast, reliable, and secure service.",
    url: "https://v0-jajasolaeci.vercel.app",
    siteName: "Honey's Mini Mart",
    images: [
      {
        url: "/preview.png", // ✅ relative works because of metadataBase
        width: 1200,
        height: 630,
        alt: "Honey's Mini Mart Preview",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Honey's Mini Mart - Discounted Robux",
    description:
      "Get discounted Robux at the best prices.",
    images: ["/preview.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} ${geistMono.className} antialiased`}>
        {children}

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
