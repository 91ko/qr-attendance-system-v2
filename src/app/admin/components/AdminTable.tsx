"use client"

import { formatKSTTime } from "@/lib/time"
import { getSite } from "@/lib/sites"

interface Attendance {
  id: string
  userId: string
  site: string
  type: string
  at: Date
  source: string
  createdAt: Date
  user: {
    name: string | null
    email: string | null
  }
}

interface AdminTableProps {
  attendances: Attendance[]
}

export default function AdminTable({ attendances }: AdminTableProps) {
  if (attendances.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">오늘 출퇴근 기록이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              이름
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              이메일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              현장
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              타입
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              시간
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              소스
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {attendances.map((attendance) => {
            const site = getSite(attendance.site)
            return (
              <tr key={attendance.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {attendance.user.name || "이름 없음"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {attendance.user.email || "이메일 없음"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {site?.name || attendance.site}
                  </div>
                  <div className="text-xs text-gray-500">
                    {attendance.site}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    attendance.type === "IN" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {attendance.type === "IN" ? "출근" : "퇴근"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatKSTTime(attendance.at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    attendance.source === "QR" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {attendance.source}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

