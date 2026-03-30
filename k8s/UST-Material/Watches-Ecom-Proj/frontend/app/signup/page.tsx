'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { registerUser } from '@/lib/api'

export default function SignupPage() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await registerUser({ displayName, email, password })
      if (!response || response.error) {
        setError('Signup failed. Please try again.')
        return
      }
      router.push('/login')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-6 py-16">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Account</p>
      <h1 className="mt-2 font-serif text-4xl font-bold tracking-tight text-foreground">
        Create Account
      </h1>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6">
        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          Display Name
          <input
            type="text"
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            placeholder="Your name"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
            placeholder="Create a password"
          />
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="bg-foreground text-background hover:bg-foreground/90"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        Already have an account?
        <Link href="/login" className="ml-2 text-sm uppercase tracking-widest text-accent">
          Sign In
        </Link>
      </p>
    </div>
  )
}
