"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Plus } from "lucide-react"

type BulkItem = {
  id: string
  min_robux: number
  price_per_robux: number
}

export default function BulkPricelistSection() {
  const supabase = createClient()

  const [bulk, setBulk] = useState<BulkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingBulk, setSavingBulk] = useState<string | null>(null)

  useEffect(() => {
    fetchBulkPricelist()
  }, [])

  async function fetchBulkPricelist() {
    setLoading(true)

    const { data, error } = await supabase
      .from("bulk_pricelist")
      .select("*")
      .order("min_robux")

    if (error) {
      console.error(error)
    }

    setBulk(data || [])
    setLoading(false)
  }

  // =========================
  // BULK PRICE EDIT
  // =========================
  function updateBulk(id: string, field: keyof BulkItem, value: number) {
    setBulk((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  async function saveBulk(item: BulkItem) {
    setSavingBulk(item.id)

    const { error } = await supabase
      .from("bulk_pricelist")
      .update({
        min_robux: item.min_robux,
        price_per_robux: item.price_per_robux,
      })
      .eq("id", item.id)

    if (error) {
      console.error(error)
      alert("Failed to update")
    }

    setSavingBulk(null)
  }

  // =========================
  // ADD BULK ROW
  // =========================
  async function addBulkRow() {
    const { data, error } = await supabase
      .from("bulk_pricelist")
      .insert({
        min_robux: 0,
        price_per_robux: 0,
      })
      .select()
      .single()

    if (!error && data) {
      setBulk((prev) => [...prev, data])
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-10">

      {/* ================= NEW BULK ORDER SECTION ================= */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Bulk Order Pricelist</CardTitle>

          <Button onClick={addBulkRow}>
            <Plus className="mr-2 h-4 w-4" />
            Add Bulk
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {bulk.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-lg border p-4"
            >

              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Min Robux
                </span>
                <Input
                  type="number"
                  value={item.min_robux}
                  onChange={(e) =>
                    updateBulk(item.id, "min_robux", Number(e.target.value))
                  }
                />
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">
                  Price per Robux
                </span>
                <Input
                  type="number"
                  value={item.price_per_robux}
                  onChange={(e) =>
                    updateBulk(item.id, "price_per_robux", Number(e.target.value))
                  }
                />
              </div>

              <Button onClick={() => saveBulk(item)} disabled={savingBulk === item.id}>
                <Save className="mr-2 h-4 w-4" />
                {savingBulk === item.id ? "Saving..." : "Save"}
              </Button>

            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  )
}