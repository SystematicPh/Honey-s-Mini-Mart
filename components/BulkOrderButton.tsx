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
import { Package } from "lucide-react"

export function BulkOrderButton() {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)

    const { data, error } = await supabase
      .from("shop_settings")
      .select("is_open")
      .eq("id", 1)
      .single()

    setLoading(false)

    // 🔥 SAFETY CHECK (prevents wrong "shop closed")
    if (error) {
      console.error("Shop settings error:", error)
      setOpen(true)
      return
    }

    // 🔥 STRICT BOOLEAN CHECK (IMPORTANT FIX)
    if (data?.is_open !== true) {
      setOpen(true)
      return
    }

    router.push("/dashboard/orders/bulk/new")
  }

  return (
    <>
      {/* BUTTON (same design as NewOrderButton) */}
      <Button size="lg" onClick={handleClick} disabled={loading}>
        <Package className="mr-2 h-5 w-5" />

        {loading ? "Checking..." : "Bulk Order"}
      </Button>

      {/* 🚫 SHOP CLOSED POPUP */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🚫 Shop Closed</DialogTitle>
            <DialogDescription>
              The shop is temporarily closed. Please try again later.
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