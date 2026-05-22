import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Card, CardTitle } from "@/components/ui/card"
import { OrderButton } from "./OrderButton"

export async function PricelistSection() {
  const supabase = await createClient()

  const { data: pricelist, error: priceError } = await supabase
    .from("pricelist")
    .select("*")
    .order("robux_amount", { ascending: true })

  if (priceError) {
    console.error(priceError)

    return (
      <section className="px-4 py-20 text-center text-destructive">
        Failed to load pricelist
      </section>
    )
  }

  return (
    <section id="pricelist" className="px-4 py-20">
      <div className="container mx-auto">

        {/* HEADER */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            <span className="text-primary">Discounted</span> Robux
          </h2>

          <p className="mt-4 text-muted-foreground">
            Best prices in the market. Fast delivery guaranteed.
          </p>
        </div>

        {/* NORMAL PRICES */}
        <h3 className="mb-6 text-xl font-semibold">
          Normal Prices
        </h3>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {pricelist?.map((item) => (
            <Card
              key={item.id}
              className="group relative aspect-square flex flex-col justify-between overflow-hidden transition-all hover:border-primary/50 p-3 active:scale-95"
            >

              {/* CLICKABLE AREA */}
              <Link
                href="/auth/sign-up"
                className="absolute inset-0 z-0"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1">
                <CardTitle className="text-xl sm:text-2xl font-bold">
                  {item.robux_amount.toLocaleString()}
                </CardTitle>

                <p className="text-xs sm:text-sm text-muted-foreground">
                  Robux
                </p>

                <div className="mt-2 text-2xl sm:text-3xl font-bold text-primary">
                  ₱{item.regular_price}
                </div>
              </div>

              {/* BUTTON */}
              <div className="relative z-20 mt-2 hidden md:block pointer-events-auto">
                <OrderButton />
              </div>

            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Resellers get special discounted prices. Sign up and contact us for reseller status.
        </p>

      </div>
    </section>
  )
}
