"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { createClient } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"

import { ArrowLeft, QrCode, Plus, Minus } from "lucide-react"

export default function NewOrderPage() {
  const [username, setUsername] = useState("")
  const [gamepassLink, setGamepassLink] = useState("")
  const [robux, setRobux] = useState(2000)

  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "maribank">("gcash")

  const [bulkPricelist, setBulkPricelist] = useState<any[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)

  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [
        { data: profileData },
        { data: bulkData }
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("bulk_pricelist").select("*").order("min_robux", { ascending: true }),
      ])

      setProfile(profileData)
      setBulkPricelist(bulkData || [])
    }

    fetchData()
  }, [supabase])

  const getTier = () => {
    const tier = bulkPricelist
      .filter((b) => robux >= b.min_robux)
      .sort((a, b) => b.min_robux - a.min_robux)[0]

    return tier || null
  }

  const tier = getTier()

  const getPrice = () => {
    if (!tier) return 0
    return Math.round((robux / 1000) * tier.price_per_robux)
  }

  const increase = () => setRobux(prev => prev + 1000)
  const decrease = () => setRobux(prev => Math.max(2000, prev - 1000))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Only image files allowed")
      return
    }

    setReceiptFile(file)

    const reader = new FileReader()
    reader.onloadend = () => setReceiptPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmitOrder = async () => {
    if (!receiptFile) {
      setError("Attach receipt")
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error()

      const fileName = `${crypto.randomUUID()}.jpg`
      const filePath = `${user.id}/${fileName}`

      await supabase.storage.from("receipts").upload(filePath, receiptFile)

      await supabase.from("orders").insert({
        user_id: user.id,
        username,
        gamepass_link: gamepassLink,
        robux_amount: robux,
        price: getPrice(),
        receipt_url: filePath,
        payment_method: paymentMethod,
        status: "pending",
        is_bulk: true,
        min_robux: tier?.min_robux || null,
      })

      router.push("/dashboard/orders")

    } catch {
      setError("Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md sm:max-w-2xl px-3 sm:px-6 py-4 space-y-6">

      <div className="flex items-center gap-3">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="sm" className="h-10 px-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold">New Order</h1>
      </div>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Order</CardTitle>
          <CardDescription>Choose amount</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-5">

          <input
            className="border p-3 w-full rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
            placeholder="Enter Roblox Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="border p-3 w-full rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-400"
            placeholder="Paste Gamepass Link"
            value={gamepassLink}
            onChange={(e) => setGamepassLink(e.target.value)}
          />

          <div className="text-center space-y-3">
            <Label>Robux</Label>

            <div className="flex items-center justify-center gap-4">
              <Button onClick={decrease} variant="outline" className="h-12 w-12">
                <Minus />
              </Button>

              <div className="text-2xl sm:text-3xl font-bold min-w-[100px]">
                {robux.toLocaleString()}
              </div>

              <Button onClick={increase} variant="outline" className="h-12 w-12">
                <Plus />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Minimum 2,000 • +1,000 per click
            </p>
          </div>

          {tier && (
            <div className="bg-muted p-3 rounded-lg text-sm text-center">
              Tier: Min {tier.min_robux.toLocaleString()} 
              ({tier.price_per_robux}/1k)
            </div>
          )}

          <div className="text-lg sm:text-xl font-semibold text-center">
            Total: ₱{getPrice().toLocaleString()}
          </div>

          <Button
            className="w-full h-12 text-base rounded-xl"
            onClick={() => setShowQR(true)}
          >
            <QrCode className="mr-2 h-5 w-5" />
            Pay Now
          </Button>

        </CardContent>
      </Card>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="w-[90%] max-w-sm sm:max-w-md mx-auto rounded-xl">

          <DialogHeader>
            <DialogTitle className="text-center">Upload Receipt</DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center gap-3">
            <span className="text-sm">GCash</span>

            <button
              onClick={() =>
                setPaymentMethod(prev =>
                  prev === "gcash" ? "maribank" : "gcash"
                )
              }
              className={`w-14 h-8 flex items-center rounded-full p-1 transition ${
                paymentMethod === "maribank"
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${
                  paymentMethod === "maribank"
                    ? "translate-x-6"
                    : ""
                }`}
              />
            </button>

            <span className="text-sm">Maribank</span>
          </div>

          <div className="flex justify-center">
            <Image
              src={paymentMethod === "gcash" ? "/QRGcash.jpg" : "/QRMaribank.jpg"}
              alt="QR"
              width={220}
              height={220}
              className="rounded-md"
            />
          </div>

          <input type="file" onChange={handleFileChange} className="w-full text-sm" />

          {receiptPreview && (
            <div className="flex justify-center">
              <Image src={receiptPreview} alt="preview" width={180} height={180} className="rounded-md" />
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleSubmitOrder} disabled={loading} className="w-full">
              Submit
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

    </div>
  )
}