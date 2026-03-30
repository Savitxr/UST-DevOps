'use client'

import { User, Package, Heart, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isLoading, signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-16">
        <p className="text-muted-foreground">You are not signed in.</p>
        <Link href="/login">
          <Button className="mt-4 bg-foreground text-background hover:bg-foreground/90">
            Go to Login
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-accent">Account</p>
        <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Profile
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* User Info */}
        <div className="md:col-span-1">
          <div className="flex flex-col items-center border border-border bg-card p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
              <User className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="mt-4 font-serif text-lg font-semibold text-foreground">
              {user.displayName || 'Collector'}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-xs uppercase tracking-wider text-accent">Verified Collector</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4 md:col-span-2">
          <Link
            href="/orders"
            className="flex items-center gap-4 border border-border bg-card p-6 transition-colors hover:border-accent"
          >
            <Package className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">My Orders</p>
              <p className="text-xs text-muted-foreground">Track your purchases and deliveries</p>
            </div>
          </Link>

          <div className="flex items-center gap-4 border border-border bg-card p-6 transition-colors hover:border-accent cursor-pointer">
            <Heart className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Wishlist</p>
              <p className="text-xs text-muted-foreground">Your saved timepieces</p>
            </div>
          </div>

          <Link
            href="/sell/listings"
            className="flex items-center gap-4 border border-border bg-card p-6 transition-colors hover:border-accent"
          >
            <Settings className="h-5 w-5 text-accent" />
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">My Listings</p>
              <p className="text-xs text-muted-foreground">Manage watches you have listed for sale</p>
            </div>
          </Link>

          <div className="mt-4">
            <Button
              variant="outline"
              className="border-border text-muted-foreground hover:border-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
