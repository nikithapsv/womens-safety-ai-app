import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function LoginPage(): JSX.Element {
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
            />
            <h1 className="text-2xl font-semibold text-center">Liora</h1>
            <p className="text-sm text-muted-foreground text-center">Women's safety companion</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                autoComplete="off"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                name="remember"
                className="rounded border"
              />
              <label htmlFor="remember" className="text-sm">
                Remember me
              </label>
            </div>

            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              New here?{" "}
              <Link href="/register" className="text-primary underline">
                Create an account
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Language
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              English • हिन्दी • తెలుగు
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}