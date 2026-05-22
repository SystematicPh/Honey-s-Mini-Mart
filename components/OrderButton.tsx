"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function OrderButton() {
  const router = useRouter()

  return (
    <Button
      className="w-full"
      variant="outline"
      onClick={() => router.push("/auth/sign-up")}
    >
      Order
    </Button>
  )
}