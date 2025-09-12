"use client";

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function RegisterPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirm: formData.get("confirm") as string,
    }

    if (data.password !== data.confirm) {
      toast.error("Passwords do not match")
      return
    }

    if (data.password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      })

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "Email already registered. Please sign in instead.",
          INVALID_EMAIL: "Please enter a valid email address",
          WEAK_PASSWORD: "Password is too weak. Please choose a stronger password"
        }
        toast.error(errorMap[error.code] || "Registration failed. Please try again.")
        return
      }

      toast.success("Account created! Please check your email to verify your account.")
      router.push("/login?registered=true")
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="w-full max-w-sm mx-auto bg-card rounded-xl border p-6 shadow-sm relative">
        <Link 
          href="/" 
          className="absolute top-4 left-4 text-muted-foreground text-sm hover:text-foreground transition-colors"
        >
          ← Home
        </Link>

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/1757662879639-swapt40byxl.png"
              alt="Liora logo"
              width={56}
              height={56}
              className="h-14 w-14 mx-auto"
              priority
            />
            <h1 className="text-2xl font-semibold text-center font-heading">Liora</h1>
            <p className="text-sm text-muted-foreground text-center">Women's safety companion</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                disabled={isLoading}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                name="password"
                required
                disabled={isLoading}
                autoComplete="off"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Create a password"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm" className="text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                name="confirm"
                required
                disabled={isLoading}
                autoComplete="off"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Re-enter password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary underline hover:text-primary/80 transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">Language</p>
            <p className="text-xs text-muted-foreground mt-1">English • हिन्दी • తెలుగు</p>
          </div>
        </div>
      </div>
    </div>
  )
}