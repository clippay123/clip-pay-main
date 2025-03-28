"use client"

import { useState, useEffect, useId } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { signUp, signInWithGoogle } from "../actions/auth"
import Image from "next/image"
import { CheckCircle2, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

type UserType = "creator" | "brand"

type State = {
  success?: boolean
  message?: string
} | null

const signUpAction = async (prevState: State, formData: FormData) => {
  try {
    await signUp(formData)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unexpected error occurred",
    }
  }
}

// Client-side only wrapper for input fields
function InputWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  if (!mounted) {
    return <div style={{ height: "44px" }} /> // Placeholder with same height as input
  }

  return <div className="relative">{children}</div>
}

interface SignUpFormProps {
  userType: UserType
}

export function SignUpForm({ userType }: SignUpFormProps) {
  const formId = useId()
  const searchParams = useSearchParams()
  const referralCodeFromURL = searchParams.get("ref") || "" // Get referral code from URL

  const [referralCode, setReferralCode] = useState(referralCodeFromURL)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [isGoogleSigningUp, setIsGoogleSigningUp] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [email, setEmail] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningUp(true)
    setError(null)

    const formData = new FormData(e.target as HTMLFormElement)
    formData.append("userType", userType)
    formData.append("referralCode", referralCode)
    try {
      const result = await signUpAction(null, formData)
      if (result.success) {
        setEmail(formData.get("email") as string)
        setShowConfirmation(true)
      } else if (result.message) {
        setError(result.message)
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      )
    } finally {
      setIsSigningUp(false)
    }
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="w-full max-w-[400px] mx-auto space-y-8">
          <div className="flex justify-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={200}
              height={200}
              priority
            />
          </div>

          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-[#1D2939]">
                Check your email
              </h1>
              <p className="text-[#475467]">
                We've sent a confirmation link to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <p className="text-sm font-medium text-zinc-900">Next steps</p>
            </div>
            <p className="text-sm text-zinc-600 pl-4">
              Click the link in your email to confirm your account and complete
              your profile setup
            </p>
          </div>

          <div className="text-center">
            <Link
              href="/signin"
              className="text-sm text-[#1D2939] hover:text-black"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-tr from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-40 h-40 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"></div>
      </div>
      <div className="w-full max-w-[420px] mx-auto space-y-8">
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
          <CardHeader className="space-y-2 text-center pb-">
            <h1 className="text-2xl font-semibold text-[#1D2939]">
              {userType === "creator" ? "Creator Sign Up" : "Brand Sign Up"}
            </h1>
            <p className="text-[#475467]">
              {userType === "creator"
                ? "Create an account to start earning from your content"
                : "Create an account to start working with creators"}
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
                  htmlFor="email"
                  className="text-sm font-medium text-[#1D2939]"
                >
                  Email
                </Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary/70 transition-colors duration-300">
                    <Mail className="h-5 w-5" />
                  </div>
                  <InputWrapper>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="h-12 pl-10 pr-4 rounded-xl transition-all duration-300 border-slate-200 bg-white/50 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/40 focus-visible:border-primary group-hover:border-primary/50"
                      placeholder="name@example.com"
                      required
                    />
                  </InputWrapper>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-[#1D2939]"
                >
                  Password
                </Label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary/70 transition-colors duration-300">
                    <Lock className="h-5 w-5 text-black" />
                  </div>
                  <InputWrapper>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="h-12 pl-10 pr-12 rounded-xl transition-all duration-300 border-slate-200 bg-white/50 focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/40 focus-visible:border-primary group-hover:border-primary/50"
                      required
                      placeholder="••••••••••••"
                    />
                  </InputWrapper>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    tabIndex={-1}
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
                disabled={isSigningUp}
              >
                {isSigningUp ? "Creating account..." : "Create Account"}
              </Button>

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
                className="w-full h-11 dark:text-white border-[#CBD5E1] hover:border-[#5865F2] text-[#1D2939] hover:text-[#5865F2] hover:bg-transparent"
                onClick={async () => {
                  try {
                    setIsGoogleSigningUp(true)
                    setError(null)
                    const url = await signInWithGoogle(
                      userType,
                      true,
                      referralCode
                    )
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
                    setIsGoogleSigningUp(false)
                  }
                }}
                disabled={isGoogleSigningUp}
              >
                <Image
                  src="/google.png"
                  alt="Google"
                  width={20}
                  height={20}
                  className="mr-2"
                />
                {isGoogleSigningUp ? "Connecting..." : "Sign up with Google"}
              </Button>

              <p className="text-center text-sm text-zinc-600">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="text-[#5865F2] hover:text-[#4752C4]"
                >
                  Sign in
                </Link>
              </p>
              <p className="text-center text-sm text-zinc-600">
                {userType === "brand"
                  ? "Are you a creator?"
                  : "Are you a brand?"}{" "}
                <Link
                  href={
                    userType === "brand" ? "/signup/creator" : "/signup/brand"
                  }
                  className="text-[#5865F2] hover:text-[#4752C4]"
                >
                  {userType === "brand"
                    ? "Sign up as a creator"
                    : "Sign up as a brand"}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
