"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  updateUserEmail,
  updateUserPassword,
  updateAutoApproval,
} from "./actions"
import {
  CheckCircle,
  ExternalLink,
  Mail,
  Instagram,
  InstagramIcon as BrandTiktok,
  CreditCard,
  Badge,
} from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PaymentMethodDisplay } from "./payment-method"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { InstagramModal } from "@/components/instausermodel"
import { Separator } from "@/components/ui/separator"
import tittoklogo from "@/public/assets/tittoklogo.svg"
import paypallogo from "@/public/assets/paypallogo.svg"
import Image from "next/image"
interface SettingsFormProps {
  email: string
  userType: "creator" | "brand"
  hasStripeAccount: boolean
  autoApprovalEnabled?: boolean
  tittokConnected: Boolean
  instaConnected: Boolean
  hasPaypalAccount: boolean
}

export function SettingsForm({
  email,
  userType,
  hasStripeAccount,
  autoApprovalEnabled = false,
  tittokConnected,
  instaConnected,
  hasPaypalAccount,
}: SettingsFormProps) {
  const [newEmail, setNewEmail] = useState("")
  const [confirmEmail, setConfirmEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInstagramModalOpen, setInstagramModalOpen] = useState(false)
  const [instagramUsername, setInstagramUsername] = useState("")

  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const [isAutoApprovalEnabled, setIsAutoApprovalEnabled] =
    useState(autoApprovalEnabled)

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailError("")

    if (newEmail !== confirmEmail) {
      setEmailError("Email addresses do not match")
      return
    }

    try {
      await updateUserEmail(newEmail)
      toast.success("Email updated successfully")
      setNewEmail("")
      setConfirmEmail("")
      setShowEmailDialog(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update email"
      )
    }
  }

  const handleTikTokAuth = async () => {
    setError(null)

    try {
      const response = await fetch("/api/tiktok/auth")
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.url) {
        throw new Error("No authentication URL returned")
      }

      window.location.href = data.url
    } catch (err) {
      console.error("Error initiating TikTok auth:", err)
      setError(
        err instanceof Error ? err.message : "Failed to connect with TikTok"
      )
    }
  }
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (newPassword.length < 6) {
      toast.warning("Password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.warning("Passwords do not match")
      return
    }

    try {
      await updateUserPassword(newPassword)
      toast.success("Password updated successfully")
      setNewPassword("")
      setConfirmPassword("")
      setShowPasswordDialog(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update password"
      )
    }
  }

  const handleInstagramSubmit = async (username: string) => {
    setError(null)
    setSuccess(null)

    if (!username) {
      toast.error("Please enter a username.")
      return
    }

    try {
      const response = await fetch("/api/instagram", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramUsername: username }),
      })

      // console.log("API response received:", response)

      const data = await response.json()
      // console.log("API response data:", data)

      if (!response.ok) throw new Error(data.error || "Failed to update")

      toast.success("Instagram username updated successfully!")
      // setTimeout(() => {
      //   router.push("/dashboard")
      // }, 1500)
      setInstagramModalOpen(false)
    } catch (err) {
      console.error("API call failed:", err)
      setError(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="container px-4 mx-auto">
      <Card>
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Authentication
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Manage your login credentials and account security
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
          {/* Email Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Email Address</h3>
              </div>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Change
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change email address</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateEmail} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">New Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter new email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmEmail">Confirm Email Address</Label>
                    <Input
                      id="confirmEmail"
                      type="email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      placeholder="Confirm new email address"
                    />
                  </div>
                  {emailError && (
                    <p className="text-sm text-destructive">{emailError}</p>
                  )}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowEmailDialog(false)}
                      className="mt-2 sm:mt-0"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!newEmail || !confirmEmail}
                      className="w-full sm:w-auto"
                    >
                      Update Email
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Separator />

          {/* Password Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Password</h3>
              </div>
              <p className="text-sm text-muted-foreground">••••••••••••</p>
            </div>
            <Dialog
              open={showPasswordDialog}
              onOpenChange={setShowPasswordDialog}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Change
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change password</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleUpdatePassword}
                  className="space-y-4 pt-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  {passwordError && (
                    <p className="text-sm text-destructive">{passwordError}</p>
                  )}
                  <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPasswordDialog(false)}
                      className="mt-2 sm:mt-0"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!newPassword || !confirmPassword}
                      className="w-full sm:w-auto"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {userType === "creator" && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Connected Accounts
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Link your social media accounts to enable content sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            {/* TikTok Account */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shrink-0 border">
                  {/* <Tittok className="h-5 w-5 text-white" /> */}
                  <Image
                    src={tittoklogo}
                    alt="Tittok logo"
                    className="h-5 w-5 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">TikTok</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {tittokConnected
                      ? "Connected to your TikTok account"
                      : "Connect your TikTok account"}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleTikTokAuth}
                variant={tittokConnected ? "outline" : "default"}
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                {tittokConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Connected
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>

            <Separator />

            {/* Instagram Account */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-orange-400 shrink-0">
                  <Instagram className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">Instagram</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {instaConnected
                      ? "Connected to your Instagram account"
                      : "Connect your Instagram account"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setInstagramModalOpen(true)}
                variant={instaConnected ? "outline" : "default"}
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                {instaConnected ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Connected
                  </>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {userType === "creator" && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Payment Settings
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Manage your payment methods and earnings
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shrink-0 border ">
                  <Image
                    src={paypallogo}
                    alt="Paypal logo"
                    className="h-6 w-6"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">PayPal</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {hasPaypalAccount
                      ? "Your PayPal account is connected for payments"
                      : "Connect PayPal to receive payments"}
                  </p>
                </div>
              </div>
              {hasPaypalAccount ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    onClick={() => (window.location.href = "/earnings")}
                    variant="outline"
                    size="sm"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <CheckCircle className="h-4 w-4" />
                    View earnings
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => (window.location.href = "/api/paypal/connect")}
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  Connect PayPal
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <InstagramModal
        isOpen={isInstagramModalOpen}
        onClose={() => setInstagramModalOpen(false)}
        onSubmit={handleInstagramSubmit}
      />
    </div>
  )
}
