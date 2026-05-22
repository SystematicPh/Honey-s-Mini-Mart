"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Save, Plus, Trash2 } from "lucide-react"

type PriceItem = {
  id: string
  robux_amount: number
  regular_price: number
  reseller_price: number
}

type BulkItem = {
  id: string
  min_robux: number
  price_per_robux: number
}

export default function AdminPricelistPage() {
  const supabase = createClient()

  const [items, setItems] = useState<PriceItem[]>([])
  const [bulk, setBulk] = useState<BulkItem[]>([])
  const [loading, setLoading] = useState(true)

  const [saving, setSaving] = useState<string | null>(null)
  const [savingBulk, setSavingBulk] = useState<string | null>(null)

  // 🔥 DELETE DIALOG STATE
  const [deleteTarget, setDeleteTarget] = useState<BulkItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  async function fetchAll() {
    setLoading(true)

    const [priceRes, bulkRes] = await Promise.all([
      supabase.from("pricelist").select("*").order("robux_amount"),
      supabase.from("bulk_pricelist").select("*").order("min_robux"),
    ])

    setItems(priceRes.data || [])
    setBulk(bulkRes.data || [])
    setLoading(false)
  }

  // =========================
  // PRICELIST (UNCHANGED)
  // =========================
  function updatePrice(id: string, field: keyof PriceItem, value: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  async function saveItem(item: PriceItem) {
    setSaving(item.id)

    await supabase
      .from("pricelist")
      .update({
        regular_price: item.regular_price,
        reseller_price: item.reseller_price,
      })
      .eq("id", item.id)

    setSaving(null)
  }

  // =========================
  // BULK EDIT
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

    await supabase
      .from("bulk_pricelist")
      .update({
        min_robux: item.min_robux,
        price_per_robux: item.price_per_robux,
      })
      .eq("id", item.id)

    setSavingBulk(null)
  }

  // =========================
  // ADD BULK
  // =========================
  async function addBulkRow() {
    const { data } = await supabase
      .from("bulk_pricelist")
      .insert({
        min_robux: 0,
        price_per_robux: 0,
      })
      .select()
      .single()

    if (data) {
      setBulk((prev) => [...prev, data])
    }
  }

  // =========================
  // DELETE BULK (CUSTOM DIALOG)
  // =========================
  async function confirmDelete() {
    if (!deleteTarget) return

    setDeleting(true)

    await supabase
      .from("bulk_pricelist")
      .delete()
      .eq("id", deleteTarget.id)

    setBulk((prev) =>
      prev.filter((item) => item.id !== deleteTarget.id)
    )

    setDeleting(false)
    setDeleteTarget(null)
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

      {/* ================= PRICELIST ================= */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Prices</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-end md:justify-between"
            >
              <div className="w-32 font-semibold">
                {item.robux_amount.toLocaleString()} Robux
              </div>

              {/* 🔥 REGULAR USER LABEL */}
              <div className="flex flex-col w-full">
                <span className="mb-1 text-xs text-muted-foreground">
                  Regular User Price
                </span>

                <Input
                  type="number"
                  value={item.regular_price}
                  onChange={(e) =>
                    updatePrice(
                      item.id,
                      "regular_price",
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              {/* 🔥 RESELLER LABEL */}
              <div className="flex flex-col w-full">
                <span className="mb-1 text-xs text-muted-foreground">
                  Reseller Price
                </span>

                <Input
                  type="number"
                  value={item.reseller_price}
                  onChange={(e) =>
                    updatePrice(
                      item.id,
                      "reseller_price",
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <Button onClick={() => saveItem(item)}>
                <Save className="mr-2 h-4 w-4" />
                {saving === item.id ? "Saving..." : "Save"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= BULK PRICELIST ================= */}
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
                  Price per 1k Robux
                </span>

                <Input
                  type="number"
                  value={item.price_per_robux}
                  onChange={(e) =>
                    updateBulk(
                      item.id,
                      "price_per_robux",
                      Number(e.target.value)
                    )
                  }
                />
              </div>

              <Button onClick={() => saveBulk(item)}>
                <Save className="mr-2 h-4 w-4" />
                {savingBulk === item.id ? "Saving..." : "Save"}
              </Button>

              {/* 🔥 DELETE BUTTON */}
              <Button
                variant="destructive"
                onClick={() => setDeleteTarget(item)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ================= CUSTOM DELETE DIALOG ================= */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>

          <DialogHeader>
            <DialogTitle>Delete Bulk Price</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this bulk pricing?
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="rounded-lg border p-3 text-sm">
              <p>
                <b>Min Robux:</b> {deleteTarget.min_robux}
              </p>

              <p>
                <b>Price:</b> ₱{deleteTarget.price_per_robux}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  )
}