"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { getSiteIds, getSite } from "@/lib/sites"

interface SiteFilterProps {
  selectedSite: string
}

export default function SiteFilter({ selectedSite }: SiteFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const siteIds = getSiteIds()

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSearchParams = new URLSearchParams(searchParams)
    
    if (e.target.value === "all") {
      newSearchParams.delete("site")
    } else {
      newSearchParams.set("site", e.target.value)
    }
    
    router.push(`/admin?${newSearchParams.toString()}`)
  }

  return (
    <div className="mb-6">
      <label htmlFor="site-filter" className="block text-sm font-medium text-gray-700 mb-2">
        현장 필터
      </label>
      <select
        id="site-filter"
        value={selectedSite}
        onChange={handleSiteChange}
        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">모든 현장</option>
        {siteIds.map((siteId) => (
          <option key={siteId} value={siteId}>
            {getSite(siteId)?.name} ({siteId})
          </option>
        ))}
      </select>
    </div>
  )
}
