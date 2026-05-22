"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import {
  Home,
  ShoppingCart,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  X,
  BookText,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/orders", label: "My Orders", icon: ShoppingCart },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/rules-regulation", label: "Rules & Regulation", icon: BookText },
]

export function DashboardNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const closeMenu = () => setOpen(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* LEFT SIDE (LOGO ONLY) */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-spunky text-2xl text-primary">Honey&apos;s</span>
            <span className="font-fredoka text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/80">
              Mini Mart
            </span>
          </Link>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("gap-2", isActive && "bg-secondary")}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}

            {/* LOGOUT DESKTOP */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-red-500 ml-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </nav>

          {/* MOBILE BURGER (NOW RIGHT SIDE AGAIN) */}
          <button onClick={() => setOpen(!open)} className="md:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* MOBILE MENU (LEFT DRAWER) */}
          <div
            className={cn(
              "md:hidden absolute left-0 top-16 w-[260px] rounded-r-xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-3 space-y-2 transition-all duration-200 origin-top-left",
              open
                ? "opacity-100 scale-100 translate-x-0"
                : "opacity-0 scale-95 -translate-x-4 pointer-events-none"
            )}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-muted",
                    isActive && "bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}

            <div className="border-t my-2" />

            <div className="px-3">
              <p className="text-sm font-medium">{profile.username}</p>
              <p className="text-xs text-muted-foreground">
                {profile.status === "reseller" ? "Reseller" : "Customer"}
              </p>
            </div>

            {profile.is_admin && (
              <Link href="/admin" onClick={closeMenu}>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}

            {/* LOGOUT MOBILE */}
            <Button
              variant="ghost"
              onClick={() => {
                handleSignOut()
                closeMenu()
              }}
              className="w-full justify-start gap-2 text-red-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>

        </div>
      </div>
    </header>
  )
}
