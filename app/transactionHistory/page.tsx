import { DashboardHeader } from "@/components/dashboard-header"
import { Card } from "@/components/ui/card"
import { createServerSupabaseClient } from "@/lib/supabase-server"
import { CircleArrowUpIcon, FileText } from "lucide-react"
import { redirect } from "next/navigation"
import equlImg from "@/public/assets/equlImg.svg"
import loadImg from "@/public/assets/loadImg.svg"
import React from "react"
import Image from "next/image"

export default async function TransactionHistory() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/signin")
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type, organization_name")
    .eq("user_id", user.id)
    .single()

  if (!profile) {
    redirect("/dashboard")
  }

  let brandId = null

  if (profile.user_type === "brand") {
    // Fetch brand details for brand users
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!brand) {
      redirect("/dashboard")
    }
    brandId = brand.id
  } else if (profile.user_type === "brand_team") {
    // Fetch brand_id for brand_team members
    const { data: teamMember } = await supabase
      .from("brand_team_members")
      .select("brand_id")
      .eq("user_id", user.id)
      .single()

    if (!teamMember) {
      redirect("/dashboard")
    }
    brandId = teamMember.brand_id
  }

  if (!brandId) {
    redirect("/dashboard")
  }

  // Fetch transactions
  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      `
      id, 
      amount, 
      created_at, 
      submission_id,
      submissions ( campaign_id, campaigns:campaigns!inner(title) )
      `
    )
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false })

  // Calculate total amount spent
  const totalAmountSpent =
    transactions?.reduce((sum, txn) => sum + txn.amount, 0) || 0

  // Fetch total remaining budget from all campaigns of the brand
  const { data: campaigns, error: campaignError } = await supabase
    .from("campaigns")
    .select("remaining_budget")
    .eq("user_id", brandId)

  if (campaignError) {
    console.error("Error fetching campaigns:", campaignError.message)
  }

  // Calculate total remaining budget
  const totalRemainingBudget =
    campaigns?.reduce((sum, campaign) => sum + campaign.remaining_budget, 0) ||
    0

  return (
    <div className="min-h-screen bg-[#F2F6FA]">
      <DashboardHeader
        userType={profile.user_type}
        email={user.email || ""}
        organization_name={profile.organization_name}
      />
      <main className="lg:ml-72 min-h-screen pt-20 lg:pt-8">
        <div className="p-6">
          <h2 className="text-2xl font-medium text-zinc-900">Brand Balance</h2>

          <div className={"grid grid-cols-1 lg:grid-cols-5 gap-8 mt-4 "}>
            <Card className="p-4 rounded-2xl shadow-lg bg-white inline-flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600">
                  Total Spent
                </span>
                <div className="">
                  <Image
                    src={equlImg}
                    alt="Total Spent"
                    className="w-5 h-5 text-zinc-600"
                  />
                </div>
              </div>
              <p className="text-2xl font-semibold text-zinc-900">
                ${totalAmountSpent}
              </p>
            </Card>
            <Card className="p-4 rounded-2xl shadow-lg bg-white inline-flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-600">
                  Remaining Budget
                </span>
                <div className="">
                  <Image
                    alt="Remaining Budget"
                    src={loadImg}
                    className="w-5 h-5 text-zinc-600"
                  />
                </div>
              </div>
              <p className="text-2xl font-semibold text-zinc-900">
                ${totalRemainingBudget}
              </p>
            </Card>
          </div>

          <div className="mt-4">
            <div className="text-xl font-medium">Transaction History</div>
            <div className="text-sm font-light text-[#272830]">
              See all your transactions
            </div>
            <div className="space-y-4 bg-white rounded-xl mt-4">
              {transactions && transactions.length > 0 ? (
                <ul className="bg-white p-2 rounded-lg shadow">
                  {transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between p-4 px-6"
                    >
                      <div className="flex items-center gap-4 text-[#54CC8B]">
                        <CircleArrowUpIcon />
                        <div>
                          <h3 className="font-medium text-zinc-900 text-xl">
                            {txn.submissions?.[0]?.campaigns?.[0]?.title ||
                              "Unknown"}
                          </h3>
                          <p className="text-xs text-zinc-500">
                            {new Date(txn.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-zinc-900">
                          ${txn.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-zinc-600">No Transactions Found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
