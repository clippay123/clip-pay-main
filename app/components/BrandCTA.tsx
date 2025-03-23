import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function BrandCTA() {
  return (
    <section className="flex justify-center items-center bg-[#7D86AE] p-8">
      <div className="w-full max-w-4xl flex justify-center items-center gap-4">
        <p className="text-white text-sm md:text-base">
          Connect with talented creators to amplify your brand message.
        </p>
        <Link href="/signup/brand">
          <button className="relative border-2 border-transparent bg-gradient-to-r from-[#FE86AF] to-[#F8B6FF] rounded-xl ">
            <div className="flex items-center justify-center px-4 py-2 text-white bg-[#7D86AE] rounded-xl transition">
              Get Started Now <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </button>
        </Link>
      </div>
    </section>
  )
}
