"use client"

import { LandingNav } from "@/components/landing-nav"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CircleCheckBig } from "lucide-react"
import { Figtree, Inter } from "next/font/google"
import { LaunchCampaign } from "@/components/launchCampaign"
import Image, { StaticImageData } from "next/image"
import FAQSection from "./FAQSection"
import Footer from "./Footer"
import joinpay from "@/public/assets/joinpay.svg"
import client2 from "@/public/assets/client2.svg"
import client3 from "@/public/assets/client3.svg"
import brand1 from "@/public/assets/brand1.svg"
import brand2 from "@/public/assets/brand2.svg"
import brand3 from "@/public/assets/brand3.svg"
import herobrand from "@/public/assets/herobrand.png"
import herocreator from "@/public/assets/herocreator.png"
import { useRouter } from "next/navigation"
import BrandCTA from "./BrandCTA"
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Choose weights you need
})

const inter = Inter({ subsets: ["latin"] })

const brandsContent = {
  hero: {
    title: "Go Viral with Performance-Based Creators",
    description:
      "Access 100s of talented creators who work on a CPM basis and skyrocket your brand's visibility",
    cta: {
      text: "Launch a Campaign",
      link: "/signup/brand",
    },
  },
  features: {
    title: "Why Brands love",
    description: "Boost ROI and Visibility with Authentic Creator Content",
    items: [
      {
        title: "Performance-Based Model",
        description:
          "Earn based on your content's performance. The more views, the more you make!",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        ),
      },
      {
        title: "Cost-Effective Advertising",
        description:
          "Earn based on your content's performance. The more views, the more you make!.",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        ),
      },
      {
        title: "Access to Diverse Creators",
        description:
          "Earn based on your content's performance. The more views, the more you make!",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        ),
      },
      {
        title: "Real-time Analytics",
        description:
          "Earn based on your content's performance. The more views, the more you make!",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        ),
      },
    ],
  },
  howItWorks: {
    title: "How it Works for",
    title2: "Brands",
    description: "Ready to Boost Your Brand with Creator Content?",
    steps: [
      {
        number: 1,
        title: "Launch a Campaign",
        description: "Create your Creator Account",
        icon: brand1,
      },
      {
        number: 2,
        title: "Creators Submit Videos",
        description: "Find brands that match your style",
        icon: brand2,
      },
      {
        number: 3,
        title: "Watch the Views Roll In",
        description: "Produce videos based on campagin briefs",
        icon: brand3,
      },
    ],
  },
}

const creatorsContent = {
  hero: {
    title: "Get Paid to Create Content",
    description:
      "Join our platform and earn money for every view your content generates. No upfront costs, just pure creativity.",
    cta: {
      text: "Start Creating",
      link: "/signup/creator",
    },
  },
  features: {
    title: "Why Creators love",
    description: "Unlock Unlimited Earning Potential and Work on Your Terms",
    items: [
      {
        title: "Performance-Based Pay",
        description:
          "Earn more as your content gains views—fair pay based on engagement, not just submission.",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        ),
      },
      {
        title: "Work with Top Brands",
        description:
          "Work with trusted brands, grow your audience, and get paid for authentic content.",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        ),
      },
      {
        title: "Flexible Campaigns",
        description:
          "Pick campaigns that match your style and schedule while keeping full creative freedom.",
        icon: (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        ),
      },
    ],
  },
  howItWorks: {
    title: "How it Works for",
    title2: "Creators",
    description: "Ready to Monetize Your Creativity?",
    steps: [
      {
        number: 1,
        title: "Join & Filter",
        description: "Create your Creator Account",
        icon: joinpay,
      },
      {
        number: 2,
        title: "Create & Submit",
        description: "Find brands that match your style",

        icon: client2,
      },
      {
        number: 3,
        title: "Track & Cash Out",
        description: "Produce videos based on campaign briefs",
        icon: client3,
      },
      // {
      //   number: 4,
      //   title: "Earn Money",
      //   description: "Earn money for every view your content receives once it has been approved. Maximize your earnings by creating engaging, high-quality content that resonates with your audience. The more views you generate, the more you get paid—turn your creativity into a steady income stream!",
      //   icon: (
      //     <svg
      //       width="24"
      //       height="24"
      //       viewBox="0 0 24 24"
      //       fill="none"
      //       xmlns="http://www.w3.org/2000/svg"
      //     >
      //       <path
      //         d="M12 4.5V19.5M19.5 12H4.5"
      //         stroke="currentColor"
      //         strokeWidth="2"
      //         strokeLinecap="round"
      //         strokeLinejoin="round"
      //       />
      //     </svg>
      //   ),
      // },
    ],
  },
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="bg-[#FAFAFA] p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between pl-3">
        <div className="text-black font-medium text-lg">{title}</div>
        <div className="w-8 h-8 flex items-center justify-center rounded-full">
          <svg
            className="text-black w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {icon}
          </svg>
        </div>
      </div>
      <div className="text-[#71717A] font-normal mt-1 pr-2">{description}</div>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className="relative w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-4">
      <div className="flex items-start mb-4 justify-start align-top">
        <div className="w-10 h-10 rounded-full border-2 border-zinc-600 flex items-center justify-center text-zinc-600 font-semibold text-lg flex-shrink-0">
          {number}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-zinc-900">{title}</h3>
          <p className="text-[#71717A]  md:w-3/4">{description}</p>
        </div>
      </div>
    </div>
  )
}

interface LandingPageProps {
  view: "brands" | "creators"
}

export function LandingPage({ view }: LandingPageProps) {
  const content = view === "brands" ? brandsContent : creatorsContent

  const router = useRouter()
  const toggleView = () => {
    router.push(view === "brands" ? "/creators" : "/")
  }

  return (
    <div className={"min-h-screen from-blue-50 to-white"}>
      <LandingNav view={view} />

      <main>
        {/* Hero Section */}
        <div className="h-full mx-4 md:mx-8 mt-8 flex flex-col items-center rounded-3xl text-center bg-[url('/assets/heroImage.png')] bg-cover bg-center">
          <div className="max-w-3xl mx-auto space-y-6 mt-16 md:mt-24 px-4">
            {/* Toggle Switch */}
            <label className="inline-flex items-center cursor-pointer font-bold text-lg md:text-2xl gap-4 mt-2">
              <span
                className={view === "creators" ? "text-gray-400" : "text-black"}
              >
                Brands
              </span>
              <input
                type="checkbox"
                className="sr-only peer"
                checked={view === "creators"}
                onChange={toggleView}
              />
              <div className="relative w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-gray-700 transition">
                <div
                  className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full transition ${view === "creators" ? "translate-x-full" : ""}`}
                ></div>
              </div>
              <span
                className={view === "creators" ? "text-black" : "text-gray-400"}
              >
                Creators
              </span>
            </label>

            <h1 className="text-3xl md:text-5xl font-bold text-black">
              {content.hero.title}
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-lg mx-auto -mt-2">
              {content.hero.description}
            </p>

            <div className="flex items-center justify-center">
              <LaunchCampaign view={view} />
            </div>

            {/* Free Plan Info */}
            <div className="flex flex-col md:flex-row justify-center gap-2 text-gray-600 text-xs md:text-sm">
              <div>No credit card needed</div>
              <div>• Unlimited time on Free plan</div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="w-full mt-6">
            {view === "brands" ? (
              <Image
                src={herocreator}
                alt="Hero Creator"
                className="w-full object-cover"
              />
            ) : (
              <Image
                src={herobrand}
                alt="Hero Brand"
                className="w-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-black">
              {content.features.title} ClipPay
            </h2>

            {/* Feature Grid */}
            <div
              className={`grid gap-6 mt-8 ${
                content.features.items.length === 3
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-center"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              } justify-center`}
            >
              {content.features.items.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-[#E8F0FF] via-[#E0ECFF] to-[#F5E8FF] rounded-3xl p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">
              Join the ClipPay Revolution
            </h2>
            <p className="text-zinc-600 text-sm md:text-base max-w-md mx-auto my-4">
              Whether you're a brand looking to boost your visibility or a
              creator ready to monetize your talent, ClipPay is your gateway to
              success in the digital content world.
            </p>
            <div className="flex items-center justify-center">
              <Link href="/signup/creator">
                <button className="relative p-[2px] rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:brightness-110 group">
                  <div className="text-md bg-white rounded-xl w-[250px] md:w-[300px] flex items-center justify-center p-3 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-pink-50 group-hover:to-purple-50 group-hover:text-gray-800">
                    Start Your Creator Journey
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-purple-600" />
                  </div>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section className="py-10" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h2 className="text-2xl md:text-3xl font-bold text-black text-center">
              {content.howItWorks.title}
            </h2>

            <div className="flex flex-wrap  items-center md:justify-center gap-8 mt-8 mx-4">
              {content.howItWorks.steps.map((step) => (
                <StepCard
                  key={step.number}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                />
              ))}
            </div>
          </div>
        </section>

        <p className="text-center text-lg md:text-2xl font-bold">
          {content.howItWorks.description}
        </p>

        {/* FAQ + Footer */}
        <section id="faq">
          <FAQSection view={view} />
        </section>
        <BrandCTA />
        <Footer view={view} />
      </main>
    </div>
  )
}
