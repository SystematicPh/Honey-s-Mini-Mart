"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  MessageCircle,
  Image,
  LogOut,
  Home,
  DollarSign,
  Menu,
  X,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/pricelist", label: "Pricelist", icon: DollarSign },
  { href: "/admin/messages", label: "Messages", icon: MessageCircle },
  { href: "/admin/vouches", label: "Vouches", icon: Image },
]

export function AdminNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  useEffect(() => {
    const fetchNotifications = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("receiver_id", user.id)
        .eq("is_read", false)

      setUnreadCount(count || 0)

      const { data: messages } = await supabase
        .from("messages")
        .select("*, sender:profiles!sender_id(id, username), content")
        .eq("receiver_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5)

      setNotifications(
        messages?.map((msg: any) => ({
          id: msg.id,
          senderUsername: msg.sender.username,
          lastMessage: msg.content,
          senderId: msg.sender_id,
          isUnread: msg.is_read === false,
        })) || []
      )
    }

    fetchNotifications()

    const channel = supabase
      .channel("admin-unread")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => fetchNotifications()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const closeMenu = () => setOpen(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* LEFT SIDE */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-spunky text-2xl text-primary">Honey&apos;s</span>
            <span className="font-fredoka text-[10px] font-semibold uppercase tracking-[0.3em] text-foreground/80">
              Mini Mart
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-1">
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
          </nav>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-3 relative">
          {/* NOTIFICATION */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5 text-primary" />
            </Button>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </span>
            )}

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-2">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <Link key={n.id} href="/admin/messages">
                      <div className="flex items-center gap-2 p-3 hover:bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{n.senderUsername}</p>
                          <p className="text-xs text-muted-foreground">
                            sent a message
                          </p>
                        </div>
                        {n.isUnread && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground p-3">
                    No new messages
                  </p>
                )}
              </div>
            )}
          </div>

          {/* USERNAME */}
          <p className="hidden md:block text-sm text-muted-foreground">
            {profile.username}
          </p>

          {/* BURGER */}
          <button onClick={() => setOpen(!open)} className="lg:hidden">
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          {/* MOBILE MENU */}
          <div
            className={cn(
              "lg:hidden absolute right-0 top-12 w-[230px] rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-3 space-y-2 transition-all duration-200 origin-top-right",
              open
                ? "opacity-100 scale-100 translate-y-0"
                : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
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

            {/* ✅ ONLY SHOW FOR NON-ADMIN */}
            {!profile.is_admin && (
              <Link href="/dashboard" onClick={closeMenu}>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                >
                  <Home className="h-4 w-4" />
                  User View
                </Button>
              </Link>
            )}

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
