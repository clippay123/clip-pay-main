import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { LaunchCampaign } from "@/components/launchCampaign"
import { ChevronRight } from "lucide-react"

export default function Footer({ view }: { view: "brands" | "creators" }) {
  return (
    <footer className="w-full">
      {/* Top section with gradient background */}
      <div className="bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 px-4 md:px-20 py-12 md:py-16">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="max-w-xl mb-8 md:mb-0">
            <h2
              className="text-3xl md:text-4xl font-semibold text-black mb-4"
              style={{ fontFamily: "'THICCCBOI Regular'" }}
            >
              {view === "creators"
                ? "Ready to Monetize Your Creativity?"
                : " Ready to Boost Your Brand with Creator Content?"}
            </h2>
            <p className="text-[#555555]">
              {view === "creators"
                ? "Join ClipPay today and start earning for every view your content generates"
                : "Leverage the power of authentic creator content and maximize your brand’s reach effortlessly"}
            </p>
          </div>

          <Link
            href={view === "brands" ? "/signup/brand" : "/signup/creator"}
            style={{ fontFamily: "'Satoshi Regular'" }}
          >
            <button className="bg-black text-white flex items-center gap-2 pl-5 pr-2 py-3 rounded-full font-semibold hover:bg-gray-900 transition group">
              {view === "brands" ? "Launch a campaign" : "Start earning"}
              <div className="bg-white border rounded-full ml-2 group-hover:bg-gray-100 transition">
                <ChevronRight className="w-6 h-6 text-black" />
              </div>
            </button>
          </Link>
          {/* </div> */}
        </div>
      </div>

      {/* Bottom section with copyright and links */}
      <div className="bg-black text-white py-6 px-20">
        <div className="container mx-auto flex flex-col items-center md:flex-row md:justify-between">
          <div className="text-sm mb-4 md:mb-0">Copyright © 2025</div>

          {/* Centering the social media icons */}
          <div className="flex gap-6 mb-4 md:mb-0 justify-center">
            <Link href="#" aria-label="Facebook">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hover:text-gray-400 transition-colors"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Link>
            <Link href="#" aria-label="Twitter">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hover:text-gray-400 transition-colors"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </Link>
            <Link href="#" aria-label="Instagram">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hover:text-gray-400 transition-colors"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Link>
            <Link href="#" aria-label="LinkedIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hover:text-gray-400 transition-colors"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Link>
            <Link href="#" aria-label="YouTube">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hover:text-gray-400 transition-colors"
              >
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
              </svg>
            </Link>
          </div>

          <div className="text-sm text-center md:text-left">
            All Rights Reserved |
            <Link
              href="/legal/terms"
              className="ml-1 hover:text-gray-400 transition-colors text-[#B6B0FF]"
            >
              Terms and Conditions
            </Link>{" "}
            |
            <Link
              href="/legal/privacy"
              className="ml-1 hover:text-gray-400 transition-colors text-[#B6B0FF]"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
