"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import type { Profile } from "@/lib/types"
import { Menu, X } from "lucide-react"

export function Header() {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        setUser(profile)
      }

      setLoading(false)
    }

    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-[9999] border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LOGO */}
        <Link href="/" className="flex flex-col leading-none">
          <span className="font-spunky text-2xl text-primary sm:text-3xl">Honey&apos;s</span>
          <span className="font-fredoka text-xs font-semibold uppercase tracking-[0.35em] text-foreground/80 sm:text-sm">
            Mini Mart
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/#pricelist" className="text-sm text-muted-foreground hover:text-foreground">
            Pricelist
          </Link>
          <Link href="/#vouches" className="text-sm text-muted-foreground hover:text-foreground">
            Vouches
          </Link>
          <Link href="/rules-regulation" className="text-sm text-muted-foreground hover:text-foreground">
            Rules
          </Link>
        </nav>

        {/* RIGHT */}
        <div className="flex items-center gap-3 relative">

          {/* DESKTOP USER */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <>
                {user.is_admin ? (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">Admin</Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm">Dashboard</Button>
                  </Link>
                )}

                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden">
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* MOBILE MENU */}
          <div
            className={`
              md:hidden absolute right-0 top-14 w-[220px]
              rounded-xl border border-border/50
              bg-background/80 backdrop-blur-xl
              shadow-2xl p-3 space-y-2
              transition-all duration-200 origin-top-right
              ${menuOpen
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
            `}
          >
            <Link href="/#pricelist" onClick={closeMenu} className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
              Pricelist
            </Link>

            <Link href="/#vouches" onClick={closeMenu} className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
              Vouches
            </Link>

            <Link href="/rules-regulation" onClick={closeMenu} className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
              Rules
            </Link>

            <div className="border-t my-2" />

            {user ? (
              <>
                {user.is_admin ? (
                  <Link href="/admin" onClick={closeMenu} className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
                    Admin
                  </Link>
                ) : (
                  <Link href="/dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleSignOut()
                    closeMenu()
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={closeMenu} className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
                  Login
                </Link>

                <Link href="/auth/sign-up" onClick={closeMenu} className="block px-3 py-2 rounded-md hover:bg-muted text-sm">
                  Sign Up
                </Link>
              </>
            )}
          </div>

        </div>
      </div>
    </header>
  )
}
