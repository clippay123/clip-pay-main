"use client"

import { useState, useId } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { signIn, signInWithGoogle } from "../actions/auth"
import Image from "next/image"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type State = {
  message: string
  redirectTo?: string
} | null

const signInAction = async (prevState: State, formData: FormData) => {
  try {
    const result = await signIn(formData)
    if (result?.redirectTo) {
      return { redirectTo: result.redirectTo }
    }

    return null
  } catch (error) {
    return {
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

export default function SignInForm() {
  const formId = useId()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningIn(true)
    setError(null)

    const formData = new FormData(e.target as HTMLFormElement)

    try {
      const result = await signInAction(null, formData)
      if (result?.redirectTo) {
        window.location.href = result.redirectTo
        return
      }
      if (result?.message) {
        setError(result.message)
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tr from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-[420px] space-y-6">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-[180px] h-[60px] rounded-md flex items-center justify-center animate-fade-in">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={200}
              height={200}
              priority
            />
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden animate-slide-up">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
          <CardHeader className="space-y-2 text-center pb-2">
            <h1 className="text-2xl font-semibold text-[#1D2939]">
              Welcome back
            </h1>
            <p className="text-[#475467]">
              Sign in to your account to continue
            </p>
          </CardHeader>
          <CardContent>
            <form
              key={formId}
              onSubmit={handleSubmit}
              className="space-y-4"
              suppressHydrationWarning
            >
              <div className="space-y-2">
                <Label
                  htmlFor={`email-${formId}`}
                  className="text-sm font-medium text-[#1D2939]"
                >
                  Email
                </Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary/70 transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    id={`email-${formId}`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="h-12 pl-10 pr-4 rounded-xl transition-all duration-300 border-slate-200 bg-white/50 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/40 focus-visible:border-primary group-hover:border-primary/50"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`password-${formId}`}
                    className="text-sm font-medium text-[#1D2939]"
                  >
                    Password
                  </Label>
                </div>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary/70 transition-colors duration-300">
                    <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    id={`password-${formId}`}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="h-12 pl-10 pr-12 rounded-xl transition-all duration-300 border-slate-200 bg-white/50 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/40 focus-visible:border-primary group-hover:border-primary/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors duration-300"
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:translate-y-[-1px] active:translate-y-[1px]"
                disabled={isSigningIn}
              >
                {isSigningIn ? "Signing in..." : "Sign In"}
              </Button>
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#5865F2] hover:text-[#4752C4]"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-zinc-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className={`w-full h-11 dark:text-white border-[#CBD5E1] hover:border-[#5865F2] text-[#1D2939] hover:text-[#5865F2] hover:bg-transparent transition-opacity ${
                  isGoogleSigningIn ? "opacity-70" : ""
                }`}
                onClick={async () => {
                  try {
                    setIsGoogleSigningIn(true)
                    setError(null)
                    const url = await signInWithGoogle("creator", false)
                    // console.log("url", url)
                    if (url) {
                      window.location.assign(url)
                    } else {
                      throw new Error("No authentication URL returned")
                    }
                  } catch (error) {
                    console.error("Google sign in error:", error)
                    setError(
                      error instanceof Error
                        ? error.message
                        : "Failed to sign in with Google"
                    )
                    setIsGoogleSigningIn(false)
                  }
                }}
                disabled={isGoogleSigningIn}
              >
                <Image
                  src="/google.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {isGoogleSigningIn ? "Connecting..." : "Sign in with Google"}
              </Button>

              <p className="text-center text-sm text-zinc-600">
                Don't have an account?{" "}
                <Link
                  href="/signup/creator"
                  className="text-[#5865F2] hover:text-[#4752C4]"
                >
                  Sign up
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
