import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-foreground text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
              Meridian
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-primary-foreground/60">
              The premier destination for luxury timepieces. Buy and sell with confidence.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary-foreground/40">
              Navigation
            </h3>
            <ul className="flex flex-col gap-3">
              {['Home', 'Shop', 'Sell', 'Orders'].map((item) => (
                <li key={item}>
                  <Link
                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    className="text-sm text-primary-foreground/60 transition-colors hover:text-accent"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary-foreground/40">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              {['About Us', 'Contact', 'Careers', 'Press'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-primary-foreground/60 transition-colors hover:text-accent cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary-foreground/40">
              Connect
            </h3>
            <ul className="flex flex-col gap-3">
              {['Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-primary-foreground/60 transition-colors hover:text-accent cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 md:flex-row">
          <p className="text-xs text-primary-foreground/40">
            &copy; 2026 Meridian. All rights reserved.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-primary-foreground/40 hover:text-primary-foreground/60 cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-xs text-primary-foreground/40 hover:text-primary-foreground/60 cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
