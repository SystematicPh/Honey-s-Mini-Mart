export function Footer() {
  return (
    <footer className="border-t border-border bg-background px-4 py-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex flex-col items-center leading-none md:items-start">
          <span className="font-spunky text-2xl text-primary">Honey&apos;s</span>
          <span className="font-fredoka text-xs font-semibold uppercase tracking-[0.35em] text-foreground/80">
            Mini Mart
          </span>
        </div>

        <p className="text-sm text-muted-foreground">
          {"\u00A9"} {new Date().getFullYear()} Honey&apos;s Mini Mart. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
