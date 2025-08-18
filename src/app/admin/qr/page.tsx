'use client'

import { useState, useEffect } from 'react'
import { getSiteIds, getSite } from '@/lib/sites'

export default function QRPage() {
  const [selectedSite, setSelectedSite] = useState('HQ')
  const [origin, setOrigin] = useState('')
  const sites = getSiteIds()

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const generateQRCode = (siteId: string, type: 'in' | 'out') => {
    if (!origin) return ''
    const url = `${origin}/scan?site=${siteId}&type=${type}`
    return url
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">QR 코드 생성</h1>
            <a
              href="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              관리자 페이지로
            </a>
          </div>

          <div className="mb-6">
            <label htmlFor="site" className="block text-sm font-medium text-gray-700 mb-2">
              현장 선택
            </label>
            <select
              id="site"
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sites.map(siteId => {
                const site = getSite(siteId)
                return (
                  <option key={siteId} value={siteId}>
                    {site?.name || siteId}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 출근 QR */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800 mb-4">출근 QR 코드</h3>
              <div className="bg-white p-4 rounded border">
                <p className="text-sm text-gray-600 mb-2">URL:</p>
                <p className="text-xs font-mono text-gray-800 break-all">
                  {generateQRCode(selectedSite, 'in')}
                </p>
              </div>
              <div className="mt-4">
                {origin && (
                  <a
                    href={generateQRCode(selectedSite, 'in')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    출근 페이지 열기
                  </a>
                )}
              </div>
            </div>

            {/* 퇴근 QR */}
            <div className="bg-red-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-800 mb-4">퇴근 QR 코드</h3>
              <div className="bg-white p-4 rounded border">
                <p className="text-sm text-gray-600 mb-2">URL:</p>
                <p className="text-xs font-mono text-gray-800 break-all">
                  {generateQRCode(selectedSite, 'out')}
                </p>
              </div>
              <div className="mt-4">
                {origin && (
                  <a
                    href={generateQRCode(selectedSite, 'out')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    퇴근 페이지 열기
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

