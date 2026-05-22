"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart } from "lucide-react"

export function NewOrderButton() {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)

    const { data } = await supabase
      .from("shop_settings")
      .select("is_open")
      .eq("id", 1)
      .single()

    setLoading(false)

    if (!data?.is_open) {
      // 🚫 SHOW POPUP
      setOpen(true)
      return
    }

    // ✅ GO TO ORDER PAGE
    router.push("/dashboard/orders/new")
  }

  return (
    <>
      <Button size="lg" onClick={handleClick} disabled={loading}>
        <ShoppingCart className="mr-2 h-5 w-5" />
        {loading ? "Checking..." : "New Order"}
      </Button>

      {/* 🚨 POPUP */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🚫 Shop Closed</DialogTitle>
            <DialogDescription>
              The shop is temporarily closed. Please come back later.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}