"use client"; // 👈 add this because it's a client-side page in Next.js (App Router)

import React from "react"; // 👈 ensures JSX types are available
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-[#3b1d96] via-[#7b3fe4] to-[#ff4f8b]">
      <div className="w-full max-w-sm mx-auto rounded-xl border p-6 shadow-lg relative bg-white/10 border-white/20 backdrop-blur-md text-white animate-fade-slide-up">
        
        <Link 
          href="/" 
          className="absolute top-4 left-4 text-white/80 text-sm hover:text-white transition-colors"
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
              className="h-14 w-14 mx-auto drop-shadow-lg animate-heartbeat"
            />
            <h1 className="text-2xl font-semibold text-center">Liora</h1>
            <p className="text-sm text-center text-white/80">
              Women's safety companion
            </p>
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
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white/10 border-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
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
                className="w-full rounded-lg border px-3 py-2 text-sm bg-white/10 border-white/20 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/40"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                name="remember"
                className="rounded border border-white/30 bg-white/10"
              />
              <label htmlFor="remember" className="text-sm text-white/90">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-white/20 hover:bg-white/30 text-white glow-soft transition-all duration-300 hover:scale-[1.02]"
            >
              Sign in
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-white/85">
              New here?{" "}
              <Link
                href="/register"
                className="underline underline-offset-4 hover:text-white"
              >
                Create an account
              </Link>
            </p>
          </div>

          <div className="text-center">
            <p className="text-xs text-white/70">Language</p>
            <p className="text-xs text-white/80 mt-1">
              English • हिन्दी • తెలుగు
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
