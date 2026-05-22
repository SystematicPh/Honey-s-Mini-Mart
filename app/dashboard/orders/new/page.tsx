"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
 DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import type { PriceItem, Profile } from "@/lib/types"
import { ArrowLeft, QrCode } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function NewOrderPage() {
  const [username, setUsername] = useState("")
  const [gamepassLink, setGamepassLink] = useState("")
  const [selectedRobux, setSelectedRobux] = useState("")

  // ✅ PAYMENT TOGGLE
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "maribank">("gcash")

  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const [pricelist, setPricelist] = useState<PriceItem[]>([])
  const [bulkPricelist, setBulkPricelist] = useState<any[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)

  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const [
        { data: profileData },
        { data: pricelistData },
        { data: bulkData },
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single(),

        supabase
          .from("pricelist")
          .select("*")
          .order("robux_amount", { ascending: true }),

        supabase
          .from("bulk_pricelist")
          .select("*")
          .order("min_robux", { ascending: true }),
      ])

      setProfile(profileData)
      setPricelist(pricelistData || [])
      setBulkPricelist(bulkData || [])
    }

    fetchData()
  }, [supabase])

  const selectedPrice = pricelist.find(
    (item) => item.robux_amount.toString() === selectedRobux
  )

  const getPrice = () => {
    if (!selectedPrice) return 0

    const robux = selectedPrice.robux_amount

    const bulkTier =
      profile?.status === "reseller"
        ? bulkPricelist
            .filter((b) => robux >= b.min_robux)
            .sort((a, b) => b.min_robux - a.min_robux)[0]
        : null

    if (bulkTier) {
      return Math.round((robux / 1000) * bulkTier.price_per_robux)
    }

    return profile?.status === "reseller"
      ? selectedPrice.reseller_price
      : selectedPrice.regular_price
  }

  // ✅ OPEN PAYMENT MODAL
  const handlePayClick = () => {
    if (!username || !gamepassLink || !selectedRobux) {
      setError("Please fill all fields")
      return
    }

    setError(null)
    setShowQR(true)
  }

  // ✅ SUBMIT ORDER
  const handleSubmitOrder = async () => {
    setError(null)
    setLoading(true)

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        throw new Error("Not authenticated")
      }

      const user = session.user

      if (!receiptFile || receiptFile.size === 0) {
        throw new Error("Receipt file is required")
      }

      const fileExt = receiptFile.name.split(".").pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(filePath, receiptFile, {
          cacheControl: "3600",
          upsert: false,
          contentType: receiptFile.type,
        })

      if (uploadError) throw uploadError

      // ✅ STORE ONLY FILE PATH
      const { error: insertError } = await supabase.from("orders").insert({
        user_id: user.id,
        username,
        gamepass_link: gamepassLink,
        robux_amount: parseInt(selectedRobux),
        price: getPrice(),
        receipt_url: filePath,
        payment_method: paymentMethod,
        status: "pending",
      })

      if (insertError) throw insertError

      router.push("/dashboard/orders")
      router.refresh()

    } catch (err: any) {
      console.error(err)
      setError(err.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold">
            New Order
          </h1>
        </div>
      </div>

      {/* FORM */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div>
            <Label>Username</Label>

            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <Label>Gamepass Link</Label>

            <Input
              value={gamepassLink}
              onChange={(e) => setGamepassLink(e.target.value)}
            />
          </div>

          <div>
            <Label>Robux</Label>

            <Select
              value={selectedRobux}
              onValueChange={setSelectedRobux}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>

              <SelectContent>
                {pricelist.map((item) => (
                  <SelectItem
                    key={item.id}
                    value={item.robux_amount.toString()}
                  >
                    {item.robux_amount}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={handlePayClick}
          >
            <QrCode className="mr-2 h-4 w-4" />
            Pay Now
          </Button>

        </CardContent>
      </Card>

      {/* PAYMENT MODAL */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent>

          <DialogHeader>
            <DialogTitle>
              Scan & Pay
            </DialogTitle>
          </DialogHeader>

          {/* ✅ TOGGLE */}
          <div className="flex items-center justify-between rounded-lg border p-3">

            <div>
              <p className="font-medium">
                {paymentMethod === "gcash"
                  ? "GCash"
                  : "Maribank"}
              </p>

              <p className="text-xs text-muted-foreground">
                Toggle payment method
              </p>
            </div>

            <button
              onClick={() =>
                setPaymentMethod(
                  paymentMethod === "gcash"
                    ? "maribank"
                    : "gcash"
                )
              }
              className={`relative h-6 w-11 rounded-full transition ${
                paymentMethod === "maribank"
                  ? "bg-blue-500"
                  : "bg-green-500"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition ${
                  paymentMethod === "maribank"
                    ? "translate-x-5"
                    : ""
                }`}
              />
            </button>

          </div>

          {/* ✅ QR IMAGE SWITCH */}
          <div className="flex justify-center">
            <Image
              src={
                paymentMethod === "gcash"
                  ? "/QRGcash.jpg"
                  : "/QRMaribank.jpg"
              }
              alt="QR"
              width={250}
              height={250}
              className="rounded border"
            />
          </div>

          {/* RECEIPT */}
          <div className="space-y-2">
            <Label>Upload Receipt</Label>

            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return

                setReceiptFile(file)
              }}
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleSubmitOrder}
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Order"}
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  )
}