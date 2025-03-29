import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Menu, X } from "lucide-react";

export function LandingNav({ view }: { view: "brands" | "creators" }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#EBF4FF] fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-4xl rounded-full shadow-xl before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-[#EBF4FF] before:from-[#FAFEFF] before:to-[#EBF4FF] before:p-[3px]">
      <div className="flex items-center justify-between w-full bg-white/50 backdrop-blur-md rounded-full px-6 py-2">
        <Link
          href="/"
          className="font-bold text-lg text-black"
          style={{ fontFamily: "'Venite Adoremus Regular', sans-serif" }}
        >
          Clip Pay
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-gray-800">
          {/* <Link href="/brands" className="text-sm">
           Login
          </Link>
        
          <Link href="/creators" className="text-sm">
           Signup
          </Link> */}
          <Link href="/brands" className="text-sm text-black">
            Home
          </Link>
        
        
          {view === "creators" ? (
            <>
              <Link href="/" className="text-sm text-black">
            Brands
          </Link></>
          ) :(

            <>
            <Link href="/creators" className="text-sm text-black">
            Creators
          </Link>
            </>
          ) }
          <Link
           href={view==="brands" ? '/signup/brand':"/signup/creator"}
            className="flex items-center text-sm bg-black text-white px-5 py-2 rounded-full shadow-md hover:bg-gray-900 transition"
          >
            Get Started <ArrowRight className="w-3 h-3 ml-2" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-black"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6 text-black" /> : <Menu className="w-6 h-6 text-black" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-lg rounded-lg w-[90%] max-w-xs flex flex-col items-center p-4 md:hidden">
        
          <Link href="/" className="text-sm py-2 w-full text-center text-black">
            Home
          </Link>
          {view === "creators" ? (
            <>
              <Link href="/" className="text-sm py-2 w-full text-center text-black">
            Brands
          </Link></>
          ) :(

            <>
            <Link href="/creators" className="text-sm py-2 w-full text-center text-black">
            Creators
          </Link>
            </>
          ) }
          <Link
              href={view==="brands" ? '/signup/brand':"/signup/creator"}
            className="flex items-center justify-center text-sm bg-black text-white p-2 px-6 border rounded-full w-full"
          >
            Get Started <ArrowRight className="w-3 h-3 ml-2" />
          </Link>
        </div>
      )}
    </nav>
  );
}