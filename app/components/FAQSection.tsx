"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import { Figtree } from "next/font/google"

type FAQItem = {
  question: string
  answer: string
}

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["Arial", "sans-serif"], // Fallback fonts
})

export default function FAQSection({ view }: { view: "brands" | "creators" }) {
  const [openIndex, setOpenIndex] = useState(0)

  const faqItems: FAQItem[] =
    view === "brands"
      ? [
          {
            question: "How does the performance-based model work?",
            answer:
              "You only pay when your content generates real engagement. Payment is tied to actual views and audience interaction.",
          },
          {
            question: "Can I choose which creators to work with?",
            answer:
              "Yes! You can review creator profiles and approve submissions that align with your brand’s goals.",
          },
          {
            question: "What types of content can I expect?",
            answer:
              "Creators produce high-quality videos optimized for platforms like YouTube, Instagram, and TikTok.",
          },
          {
            question: "How do I track my campaign’s performance?",
            answer:
              "ClipPay provides real-time analytics and detailed insights to help you measure and optimize your campaigns.",
          },
          {
            question: "Are there any hidden costs?",
            answer:
              "No hidden fees. You only pay for actual performance based on verified engagement.",
          },
        ]
      : [
          {
            question: "How do I get started on ClipPay?",
            answer:
              "Sign up, create your profile, and start browsing campaigns. It takes less than 5 minutes to get started.",
          },
          {
            question: "How do I get paid?",
            answer:
              "Payments are based on actual views and engagement. Once the campaign is approved, you’ll receive your earnings securely.",
          },
          {
            question: "Are there any upfront costs?",
            answer:
              "No, ClipPay is completely free to join. You only pay a small platform fee when you earn.",
          },
          {
            question: "What types of content are accepted?",
            answer:
              "ClipPay accepts videos in various formats across social platforms like YouTube, Instagram, and TikTok.",
          },
          {
            question: "Can I choose which campaigns to work on?",
            answer:
              "Absolutely! You have full control over which campaigns align with your style and interests.",
          },
        ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(index === openIndex ? -1 : index)
  }

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center mb-12">
          <h2
            className={`text-4xl font-bold text-center mb-4 ${figtree.className} tracking-tight`}
          >
            <span className="text-[#00000099]">Frequently</span>{" "}
            <span className="text-black">Asked Questions</span>
          </h2>
          <p className="text-center text-gray-600 max-w-xl opacity-80">
            Get answers to the most common questions about our platform and how
            it works for {view === "brands" ? "brands" : "creators"}.
          </p>
        </div>
        <div className="space-y-5">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`
              rounded-2xl overflow-hidden 
              transition-all duration-500 ease-in-out 
              transform 
              ${
                openIndex === index
                  ? "shadows-xl bg-black text-white"
                  : " shadow-sm bg-white text-black"
              }
              relative
            `}
            >
              <button
                className="
                w-full px-6 py-5 text-left flex justify-between items-center
                group relative
                transition-all duration-300 ease-in-out
              "
                onClick={() => toggleFAQ(index)}
              >
                <span
                  className={`
                font-medium text-lg 
                ${
                  openIndex === index
                    ? "text-white"
                    : "text-black group-hover:text-gray-700"
                }
                transition-colors duration-300
              `}
                >
                  {item.question}
                </span>
                <span className="flex-shrink-0 ml-4 transition-transform duration-300 group-hover:rotate-90">
                  {openIndex === index ? (
                    <Minus className="h-6 w-6 text-white animate-pulse" />
                  ) : (
                    <Plus className="h-6 w-6 text-black group-hover:text-white-600" />
                  )}
                </span>
              </button>
              <div
                className={`
                px-6 
                transition-all duration-500 ease-in-out 
                transform origin-top 
                ${
                  openIndex === index
                    ? "opacity-100 max-h-screen"
                    : "opacity-0  max-h-0"
                }
                overflow-hidden
              `}
              >
                <p
                  className={`
                text-[15px] pb-4 leading-relaxed 
                ${openIndex === index ? "text-white/80" : "text-gray-600"}
                transition-colors duration-300
              `}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
