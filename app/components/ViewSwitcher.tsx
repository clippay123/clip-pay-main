"use client"
import { useState } from "react"

export default function ViewSwitcher({
  view,
  setView,
}: {
  view: string
  setView: (view: string) => void
}) {
  return (
    <div className="flex items-center space-x-4">
      <button
        className={`font-semibold transition-colors ${
          view === "brands" ? "text-black" : "text-gray-400"
        }`}
        onClick={() => setView("brands")}
      >
        Brands
      </button>
      <button
        className="relative w-12 h-6 bg-gray-800 rounded-full flex items-center transition-colors"
        onClick={() => setView(view === "brands" ? "creators" : "brands")}
      >
        <span
          className={`absolute left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            view === "brands" ? "" : "translate-x-6"
          }`}
        />
      </button>
      <button
        className={`font-semibold transition-colors ${
          view === "creators" ? "text-black" : "text-gray-400"
        }`}
        onClick={() => setView("creators")}
      >
        Creators
      </button>
    </div>
  )
}
