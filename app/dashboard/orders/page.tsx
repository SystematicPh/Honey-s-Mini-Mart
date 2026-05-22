import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { NewOrderButton } from "@/components/NewOrderButton"
import { BulkOrderButton } from "@/components/BulkOrderButton"
import { Package, ExternalLink, Calculator } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import RobuxCalculator from "./RobuxCalculator"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user!.id)
    .single()

  const isReseller = profile?.status === "reseller"

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  // ✅ SAFE RECEIPT HANDLING (supports both stored path and full URL)
  const ordersWithSignedUrls = await Promise.all(
    (orders || []).map(async (order) => {
      if (!order.receipt_url) return order

      // already full URL
      if (order.receipt_url.startsWith("http")) {
        return {
          ...order,
          receipt_url: order.receipt_url,
        }
      }

      // storage path → signed URL
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(order.receipt_url, 60 * 60)

      return {
        ...order,
        receipt_url: data?.signedUrl || null,
      }
    })
  )

  return (
    <div className="space-y-6 px-3 sm:px-0">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            My Orders
          </h1>
          <p className="text-sm text-muted-foreground">
            View and track all your orders
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">

          {/* CALCULATOR */}
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs hover:bg-muted">
                <Calculator className="h-4 w-4" />
                Calculator
              </button>
            </DialogTrigger>

            <DialogContent className="w-[90%] max-w-sm">
              <DialogHeader>
                <DialogTitle>Robux Calculator</DialogTitle>
              </DialogHeader>

              <RobuxCalculator />
            </DialogContent>
          </Dialog>

          {isReseller && <BulkOrderButton />}
          <NewOrderButton />

        </div>
      </div>

      {/* ORDERS LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            All your past and current orders
          </CardDescription>
        </CardHeader>

        <CardContent>
          {ordersWithSignedUrls.length > 0 ? (
            <div className="space-y-4">

              {ordersWithSignedUrls.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >

                  {/* LEFT SIDE */}
                  <div className="space-y-1">
                    <p className="font-semibold">
                      {order.robux_amount.toLocaleString()} Robux
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Username: {order.username}
                    </p>

                    <a
                      href={order.gamepass_link}
                      target="_blank"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Gamepass
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>

                  {/* RIGHT SIDE */}
                  <div className="flex items-center gap-3">

                    {/* PRICE */}
                    <p className="font-bold text-primary">
                      ₱{order.price}
                    </p>

                    {/* VIEW RECEIPT BUTTON */}
                    {order.receipt_url ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button className="rounded-md border px-3 py-1 text-xs hover:bg-muted">
                            View Receipt
                          </button>
                        </DialogTrigger>

                        <DialogContent className="w-[90%] max-w-md">
                          <DialogHeader>
                            <DialogTitle>Receipt</DialogTitle>
                          </DialogHeader>

                          <Image
                            src={order.receipt_url}
                            alt="receipt"
                            width={800}
                            height={1200}
                            className="h-auto max-h-[70vh] w-auto rounded-lg border object-contain"
                            unoptimized
                          />
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No receipt
                      </span>
                    )}

                  </div>

                </div>
              ))}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="mb-4 h-14 w-14 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No orders yet</h3>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}