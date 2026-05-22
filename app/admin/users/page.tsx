"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { Search, Users } from "lucide-react"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })

    setUsers(data || [])
    setLoading(false)
  }

  async function updateUserStatus(userId: string, status: "regular" | "reseller") {
    await supabase
      .from("profiles")
      .update({ status })
      .eq("id", userId)

    fetchUsers()
  }

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          User Management
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage users and their account status
        </p>
      </div>

      {/* 🔥 SEARCH (FIXED MOBILE) */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* USERS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-5 w-5" />
            All Users ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            View and manage user accounts
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-3 sm:space-y-4">

            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:p-4"
              >

                {/* USER INFO */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm sm:text-base">
                      {user.username}
                    </p>

                    {user.is_admin && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-primary">
                        Admin
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 text-[11px] sm:text-sm text-muted-foreground">
                    <span>Orders: {user.total_orders}</span>
                    <span>Total: ₱{user.total_amount}</span>
                    <span>
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* 🔥 ACTIONS (STACKED MOBILE) */}
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">

                  <Select
                    value={user.status}
                    onValueChange={(value: "regular" | "reseller") =>
                      updateUserStatus(user.id, value)
                    }
                    disabled={user.is_admin}
                  >
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="reseller">Reseller</SelectItem>
                    </SelectContent>
                  </Select>

                </div>

              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="py-10 sm:py-12 text-center">
                <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No users found
                </p>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

    </div>
  )
}