import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ShoppingCart, DollarSign, TrendingUp } from "lucide-react"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get statistics
  const [
    { count: totalUsers },
    { count: totalOrders },
    { data: orders },
    { count: pendingOrders },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("price, created_at"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ])

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.price), 0) || 0

  // Calculate weekly, monthly, yearly orders
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

  const weeklyOrders = orders?.filter(o => new Date(o.created_at) >= weekAgo).length || 0
  const monthlyOrders = orders?.filter(o => new Date(o.created_at) >= monthAgo).length || 0
  const yearlyOrders = orders?.filter(o => new Date(o.created_at) >= yearAgo).length || 0

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your shop statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₱{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingOrders || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Timeline */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Orders in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{weeklyOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>This Month</CardTitle>
            <CardDescription>Orders in the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{monthlyOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>This Year</CardTitle>
            <CardDescription>Orders in the last 365 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{yearlyOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders that need attention</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4"
                >
                  <div>
                    <p className="font-medium">{order.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.robux_amount.toLocaleString()} Robux - {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">₱{order.price}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      order.status === "completed" 
                        ? "bg-green-500/10 text-green-500"
                        : order.status === "noted"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No orders yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
