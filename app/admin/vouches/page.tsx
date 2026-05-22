"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import type { Vouch } from "@/lib/types"
import { Image as ImageIcon, Plus, Trash2 } from "lucide-react"
import Image from "next/image"

export default function AdminVouchesPage() {
  const [vouches, setVouches] = useState<Vouch[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [selectedVouch, setSelectedVouch] = useState<Vouch | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchVouches()
  }, [])

  async function fetchVouches() {
    setLoading(true)
    const { data } = await supabase
      .from("vouches")
      .select("*")
      .order("created_at", { ascending: false })

    setVouches(data || [])
    setLoading(false)
  }

  async function handleAddVouch() {
    if (!file) return

    setSubmitting(true)

    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `vouches/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("vouches")
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from("vouches")
        .getPublicUrl(filePath)

      const publicUrl = data.publicUrl

      await supabase.from("vouches").insert({
        image_url: publicUrl,
      })

      setFile(null)
      setPreview(null)
      setDialogOpen(false)

      fetchVouches()
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  function openDeleteDialog(vouch: Vouch) {
    setSelectedVouch(vouch)
    setDeleteDialogOpen(true)
  }

  async function confirmDelete() {
    if (!selectedVouch) return

    try {
      const url = new URL(selectedVouch.image_url)
      const path = url.pathname.split("/v1/object/public/vouches/")[1]

      if (path) {
        await supabase.storage
          .from("vouches")
          .remove([path])
      }

      await supabase
        .from("vouches")
        .delete()
        .eq("id", selectedVouch.id)

      setVouches((prev) =>
        prev.filter((v) => v.id !== selectedVouch.id)
      )

      setDeleteDialogOpen(false)
      setSelectedVouch(null)
    } catch (err) {
      console.error(err)
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
    <div className="space-y-6 px-2 sm:px-0">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold">
          Vouch Management
        </h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vouch
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vouch</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const selected = e.target.files?.[0]
                    if (!selected) return

                    setFile(selected)

                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setPreview(reader.result as string)
                    }
                    reader.readAsDataURL(selected)
                  }}
                />
              </div>

              {preview && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>

              <Button
                onClick={handleAddVouch}
                disabled={!file || submitting}
              >
                {submitting ? "Uploading..." : "Add Vouch"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* GRID */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Vouches ({vouches.length})
          </CardTitle>
        </CardHeader>

        <CardContent>
          {vouches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vouches.map((vouch) => (
                <div
                  key={vouch.id}
                  className="relative overflow-hidden rounded-lg border border-border"
                >
                  <div className="relative aspect-video w-full">
                    <Image
                      src={vouch.image_url}
                      alt="Vouch"
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* ALWAYS VISIBLE DELETE BUTTON */}
                  <div className="absolute right-2 top-2">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => openDeleteDialog(vouch)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No vouches yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Vouch</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this vouch? This action cannot be undone.
          </p>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}