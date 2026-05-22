import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 space-y-6">

      {/* ✅ RULES HEADER + IMAGE */}
      <div className="text-center space-y-3">
        <h2 className="text-lg font-semibold">
          Please Read our Rules & Regulation
        </h2>

        <div className="mx-auto w-full max-w-xs">
          <Image
            src="/r&r.png"
            alt="Rules and Regulation"
            width={600}
            height={400}
            className="w-full h-auto rounded-md shadow object-contain"
            priority
          />
        </div>
      </div>

      {/* ✅ SUCCESS CARD */}
      <Card className="w-full max-w-md text-center">

        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>

          <CardTitle className="text-2xl">
            Thank you for signing up!
          </CardTitle>

          <CardDescription>
            Your account has been created successfully. You can now log in and start placing orders.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-3">

          <Link href="/auth/login">
            <Button className="w-full">
              Go to Login
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full">
              Back to Home
            </Button>
          </Link>

        </CardContent>

      </Card>
    </div>
  )
}