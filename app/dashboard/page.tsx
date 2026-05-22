import { createClient } from "@/lib/supabase/server"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ShoppingCart, Package } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single()

  const { data: pricelist } = await supabase
    .from("pricelist")
    .select("*")
    .order("robux_amount", { ascending: true })

  const { data: bulkPricelist } = await supabase
    .from("bulk_pricelist")
    .select("*")
    .order("min_robux", { ascending: true })

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const isReseller = profile?.status === "reseller"

  return (
    // ✅ FIX: prevents header overlap on mobile + desktop
    <div className="space-y-6 px-2 sm:px-0 pt-20 md:pt-24">

      {/* HEADER */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, {profile?.username}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isReseller ? "You have reseller access!" : "Regular customer"}
          </p>
        </div>

        <Link href="/dashboard/orders" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Order Here
          </Button>
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Orders</p>
            <p className="text-xl font-bold">{profile?.total_orders || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Spent</p>
            <p className="text-xl font-bold">₱{profile?.total_amount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Status</p>
            <p
              className={`text-xl font-bold ${
                isReseller ? "text-primary" : ""
              }`}
            >
              {isReseller ? "Reseller" : "Regular"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Member</p>
            <p className="text-sm font-bold">
              {new Date(profile?.created_at || "").toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  year: "numeric",
                }
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PRICELIST */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isReseller ? "Reseller Pricelist" : "Pricelist"}
          </CardTitle>
          <CardDescription>
            {isReseller
              ? "You're seeing discounted reseller prices"
              : "Contact us for reseller pricing"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {pricelist?.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1 rounded-lg border border-border bg-secondary/30 p-3"
              >
                <p className="font-semibold text-sm">
                  {item.robux_amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Robux</p>

                <p className="text-lg font-bold text-primary mt-1">
                  ₱
                  {isReseller
                    ? item.reseller_price
                    : item.regular_price}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* BULK PRICING */}
      {isReseller && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Pricing</CardTitle>
            <CardDescription>
              Discounted rates for large Robux purchases
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {bulkPricelist?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-1 rounded-lg border border-primary/20 bg-primary/5 p-3"
                >
                  <p className="text-xs text-muted-foreground">
                    Min {item.min_robux.toLocaleString()} Robux
                  </p>

                  <p className="text-lg font-bold text-primary">
                    ₱{item.price_per_robux}/1K Robux
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* RECENT ORDERS */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest order history</CardDescription>
          </div>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-start justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {order.robux_amount.toLocaleString()} Robux
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        order.status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : order.status === "noted"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {order.status}
                    </span>

                    <p className="text-sm font-semibold">
                      ₱{order.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Package className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No orders yet
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}