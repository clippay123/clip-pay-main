
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function LaunchCampaign({ view }: { view: "brands" | "creators" }) {
  return (
     <>
      <Link href={view==="brands" ? '/signup/brand':"/signup/creator"} style={{ fontFamily: "'Satoshi Regular'" }}>
        <button className="bg-black text-white flex gap-2 pl-7 px-2 items-center py-3 rounded-full  font-semibold hover:bg-gray-900 transition">
          Launch a campaign
          <div className="bg-white border rounded-full">
          <ChevronRight className="w-8 h-8 text-sm text-black" />

          </div>
        </button>
      </Link>
     </>
  )
  }
  