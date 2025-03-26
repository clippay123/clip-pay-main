
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function LaunchCampaign({ view }: { view: "brands" | "creators" }) {
  return (
     <>
 <Link href={view === "brands" ? '/signup/brand' : "/signup/creator"}>
  <button className="bg-white text-[#71717A] flex px-4 text-sm items-center py-2 gap-1 rounded-full font-bold 
    transition-all duration-300 
    hover:bg-gray-100 
    hover:text-gray-900 
    hover:shadow-md 
    active:scale-[0.98] 
    group">
    {view === "brands" ? "Launch a Campaign" : "Start Earning"}
    <div className="text-[#71717A] text-sm transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-gray-900">
      <ArrowRight className="w-5 h-5 transition-all duration-300"/>
    </div>
  </button>
</Link>

     </>
  )
  }
  