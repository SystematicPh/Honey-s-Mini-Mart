import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Facebook, MessageCircle } from "lucide-react"
import Link from "next/link"

export function SocialMediaSection() {
  return (
    <section className="border-t border-border bg-secondary/30 px-4 py-20">
      <div className="container mx-auto">

        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            Join Our <span className="text-primary">Community</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stay updated and connect with us on our social platforms
          </p>
        </div>

        {/* Social Cards */}
        <div className="grid gap-4 sm:grid-cols-2">

          {/* DISCORD */}
          <Card className="hover:border-primary/50 transition-all">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-6 text-center">
              <MessageCircle className="h-10 w-10 text-primary" />

              <h3 className="text-lg font-semibold">Discord</h3>

              <p className="text-sm text-muted-foreground">
                Join our server for updates, support, and giveaways
              </p>

              <Link
                href="https://discord.gg/YOUR_INVITE_LINK"
                target="_blank"
                className="w-full"
              >
                <Button className="w-full">
                  Join Discord
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* FACEBOOK */}
          <Card className="hover:border-primary/50 transition-all">
            <CardContent className="flex flex-col items-center justify-center gap-4 p-6 text-center">
              <Facebook className="h-10 w-10 text-primary" />

              <h3 className="text-lg font-semibold">Facebook</h3>

              <p className="text-sm text-muted-foreground">
                Follow our page for announcements and updates
              </p>

              <Link
                href="https://www.facebook.com/profile.php?id=61580686751047"
                target="_blank"
                className="w-full"
              >
                <Button className="w-full" variant="outline">
                  Visit Facebook
                </Button>
              </Link>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  )
}