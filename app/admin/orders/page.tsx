"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"

import { createClient } from "@/lib/supabase/client"
import type { Order } from "@/lib/types"

import {
  Eye,
  ExternalLink,
  Search,
} from "lucide-react"

import Image from "next/image"

type StatusFilter =
  | "all"
  | "pending"
  | "noted"
  | "completed"

type OrderWithSignedReceipt = Order & {
  signed_receipt_url?: string | null
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<
    OrderWithSignedReceipt[]
  >([])

  const [loading, setLoading] =
    useState(true)

  const [filter, setFilter] =
    useState<StatusFilter>("all")

  const [shopOpen, setShopOpen] =
    useState(true)

  // GAMEPASS CHECKER
  const [gamepassOpen, setGamepassOpen] =
    useState(false)

  const [gamepassId, setGamepassId] =
    useState("")

  const [checkingGamepass, setCheckingGamepass] =
    useState(false)

  const [gamepassData, setGamepassData] =
    useState<{
      gamepassName: string
      creator: string
      price: number | null
      isForSale: boolean
      regionalPricing: boolean
    } | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
    fetchShopStatus()
  }, [])

  async function fetchShopStatus() {
    const { data } = await supabase
      .from("shop_settings")
      .select("is_open")
      .eq("id", 1)
      .single()

    if (data) setShopOpen(data.is_open)
  }

  async function toggleShop() {
    const newState = !shopOpen

    await supabase
      .from("shop_settings")
      .update({
        is_open: newState,
      })
      .eq("id", 1)

    setShopOpen(newState)
  }

  async function fetchOrders() {
    setLoading(true)

    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", {
        ascending: false,
      })

    if (!data) {
      setOrders([])
      setLoading(false)
      return
    }

    const withSigned = await Promise.all(
      data.map(async (order) => {
        if (!order.receipt_url) {
          return {
            ...order,
            signed_receipt_url: null,
          }
        }

        const cleanPath =
          order.receipt_url
            .replace(/^receipts\//, "")
            .replace(
              /^https?:\/\/.*\/storage\/v1\/object\/public\/receipts\//,
              ""
            )

        const { data: signed } =
          await supabase.storage
            .from("receipts")
            .createSignedUrl(
              cleanPath,
              60 * 60
            )

        return {
          ...order,
          signed_receipt_url:
            signed?.signedUrl || null,
        }
      })
    )

    setOrders(withSigned)
    setLoading(false)
  }

  async function updateOrderStatus(
    id: string,
    status:
      | "pending"
      | "noted"
      | "completed"
  ) {
    await supabase
      .from("orders")
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)

    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? {
              ...order,
              status,
            }
          : order
      )
    )
  }

  async function checkGamepass() {
    if (!gamepassId) return

    setCheckingGamepass(true)

    try {
      const response = await fetch(
        `https://billowing-sky-14c1.macheterbx.workers.dev/?id=${gamepassId}`
      )

      if (!response.ok) {
        throw new Error("Failed")
      }

      const data = await response.json()

      setGamepassData({
        gamepassName:
          data?.name ||
          data?.productName ||
          "Unknown",

        creator:
          data?.creator ||
          data?.Creator?.Name ||
          "Unknown",

        price:
          data?.priceInRobux ??
          data?.price ??
          data?.priceFromProductInfo ??
          null,

        isForSale:
          data?.isForSale === true,

        regionalPricing:
          data?.regionalPricing === "ON" ||
          data?.regionalPricing === true,
      })
    } catch {
      setGamepassData({
        gamepassName: "Unknown",
        creator: "Unknown",
        price: null,
        isForSale: false,
        regionalPricing: false,
      })
    }

    setCheckingGamepass(false)
  }

  const downloadReceipt = async (
    url: string
  ) => {
    const res = await fetch(url)

    const blob = await res.blob()

    const blobUrl =
      window.URL.createObjectURL(blob)

    const a =
      document.createElement("a")

    a.href = blobUrl

    a.download = `receipt-${Date.now()}.jpg`

    document.body.appendChild(a)

    a.click()

    a.remove()

    window.URL.revokeObjectURL(
      blobUrl
    )
  }

  const filtered =
    filter === "all"
      ? orders
      : orders.filter(
          (o) => o.status === filter
        )

  const normalOrders =
    filtered.filter((o) => !o.is_bulk)

  const bulkOrders =
    filtered.filter((o) => o.is_bulk)

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const OrderCard = ({
    order,
  }: {
    order: OrderWithSignedReceipt
  }) => (
    <div className="flex flex-col gap-4 rounded-lg border p-4">

      <div className="space-y-1">
        <p className="font-semibold">
          {order.username}
        </p>

        <p className="text-sm text-muted-foreground">
          {order.robux_amount.toLocaleString()}{" "}
          Robux - ₱{order.price}
        </p>

        <a
          href={order.gamepass_link}
          target="_blank"
          className="flex items-center gap-1 break-all text-xs text-primary hover:underline"
        >
          Gamepass

          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Order Status
        </p>

        <Select
          defaultValue={order.status}
          onValueChange={(value) =>
            updateOrderStatus(
              order.id,
              value as
                | "pending"
                | "noted"
                | "completed"
            )
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="pending">
              Pending
            </SelectItem>

            <SelectItem value="noted">
              Noted
            </SelectItem>

            <SelectItem value="completed">
              Completed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">

        {order.signed_receipt_url ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
                <Eye className="mr-2 h-4 w-4" />

                View Receipt
              </Button>
            </DialogTrigger>

            <DialogContent className="w-[95vw] max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  Payment Receipt
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">

                <div className="flex justify-center">
                  <Image
                    src={
                      order.signed_receipt_url
                    }
                    alt="receipt"
                    width={800}
                    height={1200}
                    className="h-auto max-h-[70vh] w-auto rounded-lg border object-contain"
                    unoptimized
                  />
                </div>

                <Button
                  onClick={() =>
                    downloadReceipt(
                      order.signed_receipt_url!
                    )
                  }
                  className="w-full"
                >
                  Download Receipt
                </Button>

              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <span className="text-xs text-muted-foreground">
            No receipt
          </span>
        )}

      </div>
    </div>
  )

  return (
    <div className="space-y-6 px-3 sm:px-0">

      <h1 className="text-2xl sm:text-3xl font-bold">
        Order Management
      </h1>

      <div className="flex items-center gap-3 flex-wrap">

        <span className="text-sm font-medium">
          Shop Status:
        </span>

        <button
          onClick={toggleShop}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition ${
            shopOpen
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              shopOpen
                ? "translate-x-8"
                : "translate-x-1"
            }`}
          />
        </button>

        <span className="text-sm font-medium">
          {shopOpen
            ? "Open"
            : "Closed"}
        </span>

        {/* GAMEPASS CHECKER */}
        <Dialog
          open={gamepassOpen}
          onOpenChange={
            setGamepassOpen
          }
        >
          <DialogTrigger asChild>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />

              Gamepass Checker
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">

            <DialogHeader>
              <DialogTitle>
                Gamepass Checker
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

              <Input
                placeholder="Enter Gamepass ID"
                value={gamepassId}
                onChange={(e) =>
                  setGamepassId(
                    e.target.value
                  )
                }
              />

              <Button
                className="w-full"
                onClick={
                  checkGamepass
                }
                disabled={
                  checkingGamepass
                }
              >
                {checkingGamepass
                  ? "Checking..."
                  : "Check Gamepass"}
              </Button>

              {gamepassData && (
                <div className="space-y-2 rounded-lg border p-4 text-sm">

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Gamepass Name
                    </span>

                    <span>
                      {
                        gamepassData.gamepassName
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Creator
                    </span>

                    <span>
                      {
                        gamepassData.creator
                      }
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Price
                    </span>

                    <span>
                      {gamepassData.price !==
                      null
                        ? `${gamepassData.price} Robux`
                        : "Unknown"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      For Sale
                    </span>

                    <span>
                      {gamepassData.isForSale
                        ? "Yes"
                        : "No"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Regional Pricing
                    </span>

                    <span>
                      {gamepassData.regionalPricing
                        ? "On"
                        : "Off"}
                    </span>
                  </div>

                </div>
              )}

            </div>

          </DialogContent>
        </Dialog>

      </div>

      <Select
        value={filter}
        onValueChange={(v) =>
          setFilter(
            v as StatusFilter
          )
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All
          </SelectItem>

          <SelectItem value="pending">
            Pending
          </SelectItem>

          <SelectItem value="noted">
            Noted
          </SelectItem>

          <SelectItem value="completed">
            Completed
          </SelectItem>
        </SelectContent>
      </Select>

      <Card>
        <CardHeader>
          <CardTitle>
            Normal Orders
          </CardTitle>

          <CardDescription>
            Standard customer orders
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">

          {normalOrders.length >
          0 ? (
            normalOrders.map(
              (o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                />
              )
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              No normal orders
            </p>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Bulk Orders
          </CardTitle>

          <CardDescription>
            Reseller bulk transactions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">

          {bulkOrders.length >
          0 ? (
            bulkOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No bulk orders
            </p>
          )}

        </CardContent>
      </Card>

    </div>
  )
}