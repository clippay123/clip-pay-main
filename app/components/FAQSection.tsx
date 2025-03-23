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
          <div className="bg-black text-white text-xs font-medium px-4 py-1 rounded-full mb-4">
            FAQs
          </div>
          <h2
            className={`text-4xl font-bold text-center mb-4  ${figtree.className}`}
          >
            <span className="text-[#00000099]">Frequently</span>{" "}
            <span className="text-black">Asked Questions</span>
          </h2>
          <p className="text-center text-gray-600 max-w-xl">
            Get answers to the most common questions about our platform and how
            it works for {view === "brands" ? "brands" : "creators"}.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`rounded-xl overflow-hidden transition-all duration-300 shadow-md ${
                openIndex === index
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center"
                onClick={() => toggleFAQ(index)}
              >
                <span className="font-medium">{item.question}</span>
                <span className="flex-shrink-0 ml-2">
                  {openIndex === index ? (
                    <Minus className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </span>
              </button>
              <div
                className={`px-6 pb-4 transition-all duration-300 ${openIndex === index ? "block" : "hidden"}`}
              >
                <p className="text-sm">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
