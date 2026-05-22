import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, ExternalLink } from "lucide-react"
import Link from "next/link"

export default async function BulkOrderPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // get profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const isReseller = profile?.status?.toLowerCase() === "reseller"

  // ❌ block non-resellers
  if (!isReseller) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Bulk orders are only available for resellers.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // ✅ fetch bulk orders from SAME orders table
  const { data: bulkOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_bulk", true)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Orders</h1>
          <p className="text-muted-foreground">
            Manage your reseller bulk transactions
          </p>
        </div>

        <Link href="/dashboard/orders/bulk/new">
          <Button>
            New Bulk Order
          </Button>
        </Link>
      </div>

      {/* LIST */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Order History</CardTitle>
          <CardDescription>
            Large volume Robux purchases
          </CardDescription>
        </CardHeader>

        <CardContent>
          {bulkOrders && bulkOrders.length > 0 ? (
            <div className="space-y-4">

              {bulkOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >

                  {/* LEFT */}
                  <div>
                    <p className="font-semibold text-lg">
                      {order.robux_amount.toLocaleString()} Robux
                    </p>

                    {order.min_robux && (
                      <p className="text-sm text-muted-foreground">
                        Min Tier: {order.min_robux}
                      </p>
                    )}

                    <a
                      href={order.gamepass_link}
                      target="_blank"
                      className="flex items-center gap-1 text-sm hover:underline"
                    >
                      Gamepass <ExternalLink className="h-3 w-3" />
                    </a>

                    {/* ✅ receipt preview */}
                    {order.receipt_url && (
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/receipts/${order.receipt_url}`}
                        alt="receipt"
                        className="mt-2 w-24 rounded border"
                      />
                    )}
                  </div>

                  {/* RIGHT */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      ₱{order.price ?? 0}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>

                    <span
                      className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        order.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : order.status === "pending"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Package className="mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No bulk orders yet
              </p>

              <Link href="/dashboard/orders/bulk/new">
                <Button className="mt-4">
                  Create Bulk Order
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}