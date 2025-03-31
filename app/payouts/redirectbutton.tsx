"use client"

import { useRouter } from "next/navigation"

export function RedirectButton({ to }: { to: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.push(to)}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
    >
      Go Home
    </button>
  )
}
