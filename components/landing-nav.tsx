import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Menu, X } from "lucide-react";

export function LandingNav({ view }: { view: "brands" | "creators" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        // Scrolling Down - Hide Navbar
        setIsVisible(false);
      } else {
        // Scrolling Up - Show Navbar
        setIsVisible(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`bg-black fixed top-0 left-1/2 transform -translate-x-1/2 mt-12 z-50 w-[90%] max-w-2xl rounded-full shadow-xl transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "hidden"
      }`}
    >
      <div className="flex items-center justify-between w-full bg-black backdrop-blur-md rounded-full px-6 py-2">
        <div className="flex gap-8 items-center">
          <Link href="/" className="font-bold text-lg text-white">
            Clip Pay
          </Link>
          <div className="hidden md:flex gap-3 items-center">
            <Link href="/brands" className="text-sm text-white">
              Home
            </Link>
            <Link href="/brands" className="text-sm text-white">
              How it Works
            </Link>
            <Link href="/brands" className="text-sm text-white">
              FAQ
            </Link>
          </div>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href={view === "brands" ? "/signup/brand" : "/signup/creator"}
            className="flex font-medium items-center text-sm text-[#A1A1AA]"
          >
            Login
          </Link>
          <Link
            href={view === "brands" ? "/signup/brand" : "/signup/creator"}
            className="flex font-medium items-center text-sm bg-white text-black px-5 py-2 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:brightness-100 transition"
          >
            Dashboard <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white/80 backdrop-blur-md shadow-lg rounded-lg w-[90%] max-w-xs flex flex-col items-center p-4 md:hidden">
          <Link href="/brands" className="text-sm py-2 w-full text-center text-black">
            Home
          </Link>
          {view === "creators" ? (
            <Link href="/" className="text-sm py-2 w-full text-center text-black">
              Brands
            </Link>
          ) : (
            <Link href="/creators" className="text-sm py-2 w-full text-center text-black">
              Creators
            </Link>
          )}
          <Link
            href={view === "brands" ? "/signup/brand" : "/signup/creator"}
            className="flex items-center justify-center text-sm bg-black text-white p-2 px-6 border rounded-full w-full"
          >
            Get Started <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )}
    </nav>
  );
}
