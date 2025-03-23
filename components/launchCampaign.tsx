
import { ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";

export function LaunchCampaign({ view }: { view: "brands" | "creators" }) {
  return (
     <>
      <Link href={view==="brands" ? '/signup/brand':"/signup/creator"}>
        <button className="bg-white text-[#71717A] flex  px-4 text-sm items-center py-2 gap-1 rounded-full font-bold ">
         {view==="brands" ? "Launch a campaign" :"Start earning"}
         <div className="text-[#71717A] text-sm">

         <ArrowRight className="w-5 h-5"/>
         </div>
        </button>
      </Link>
     </>
  )
  }
  