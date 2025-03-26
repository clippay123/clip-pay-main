"use client"

import {
  Bell,
  Settings,
  LogOut,
  Home,
  FileText,
  DollarSign,
  Share2,
  X,
  Menu,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Poppins } from "next/font/google"
import { usePathname } from "next/navigation"
import Category from "@/public/assets/Category.svg"
import Gift from "@/public/assets/Gift.svg"
import SeafCheck from "@/public/assets/SealCheck.svg"
import Wallet from "@/public/assets/Wallet.svg"
import Image from "next/image"
interface DashboardHeaderProps {
  userType: "creator" | "brand"
  email: string
  organization_name?: string
}
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Specify the weights you need
})

export function DashboardHeader({
  userType,
  email,
  organization_name,
}: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [showNotifications, setShowNotifications] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)

  const pathname = usePathname()
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push("/signin")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  const navItems =
    userType === "creator"
      ? [
          { href: "/dashboard", label: "Dashboard", icon: Category },
          { href: "/submissions", label: "My Submissions", icon: SeafCheck },
          { href: "/earnings", label: "Earnings", icon: Wallet },
          { href: "/refer", label: "Refer", icon: Gift },
        ]
      : [
          { href: "/dashboard", label: "Dashboard", icon: Category },
          { href: "/payouts", label: "Payouts", icon: Wallet },
          { href: "/transactionHistory", label: "Transaction", icon: Wallet },
        ]

  return (
    <>
      {/* Mobile/Tablet Header */}
      <div
        className={` lg:hidden fixed top-0 left-0 right-0 h-16  border-b border-zinc-200 z-50`}
      >
        <div className="flex items-center justify-between px-4 h-full">
          <button
            onClick={() => setIsNavOpen(true)}
            className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/dashboard">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Left Navigation */}
      
      <div
        className={cn(
          "fixed inset-y-0 left-0 w-80  transition-transform duration-300 lg:translate-x-0",
          isNavOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile/tablet */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setIsNavOpen(false)}
              className="p-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

         {/* Logo and Navigation */}
<div className="flex-1 mx-2">
  <div className="p-3 bg-white m-4 rounded-2xl shadow-sm border border-zinc-200">
    {/* Logo */}
    <div className="flex justify-center mb-3">
      <Link href="/dashboard">
        <Logo className="h-8 w-auto hover:scale-105 transition-transform" />
      </Link>
    </div>

    {/* Navigation Links */}
    <nav className="flex flex-col py-4 px-3 bg-zinc-50 rounded-xl">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href // Check if the link is active

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all font-medium",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 shadow-inner"
                    : "text-[#989BAC] hover:text-zinc-900 hover:bg-zinc-100"
                )}
                onClick={() => setIsNavOpen(false)}
              >
                <Image
                  className="w-5 h-5"
                  src={item.icon}
                  alt={item.label}
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  </div>
</div>

          {/* User Info & Settings */}
          <div className="mx-2">
            <div className="p-3 bg-white m-4 rounded-2xl shadow-sm border border-zinc-200">
              <div className="px-3 py-2 rounded-lg bg-zinc-50 mb-2">
                {organization_name && (
                  <span className="text-sm font-medium text-zinc-900 max-w-[180px] truncate block">
                    {organization_name}
                  </span>
                )}
                <span className="text-sm text-zinc-500 max-w-[180px] truncate block">
                  {email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900 transition-colors hover:bg-zinc-100 rounded-lg px-3 py-2">
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-64 bg-white border border-zinc-200 shadow-lg rounded-xl mb-12 mx-8"
                  >
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg px-3 py-2 transition-all"
                      onClick={() => {
                        router.push("/settings")
                        setIsNavOpen(false)
                      }}
                    >
                      <Settings className="h-4 w-4" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg px-3 py-2 transition-all"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Overlay for mobile/tablet */}
      {isNavOpen && (
        <div
          className="lg:hidden fixed inset-0   z-40"
          onClick={() => setIsNavOpen(false)}
        />
      )}
    </>
  )
}
