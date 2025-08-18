"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { getSession } from "next-auth/react"
import { processAttendance, ScanResult } from "./actions"

function ScanPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const siteId = searchParams.get("site")
  const type = searchParams.get("type") // "in" 또는 "out"
  
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Awaited<ReturnType<typeof getSession>>>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession()
      if (!session) {
        setIsRedirecting(true)
        const callbackUrl = `/scan?site=${siteId}&type=${type}`
        // 강제로 카카오 로그인 페이지로 리다이렉트
        window.location.href = `/api/auth/signin?provider=kakao&callbackUrl=${encodeURIComponent(callbackUrl)}`
        return
      }
      setSession(session)
    }

    if (siteId) {
      checkAuth()
    } else {
      setError("현장 정보가 없습니다.")
    }
  }, [siteId, type])

  const handleScan = async () => {
    if (!siteId) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // 위치 권한 요청 및 위치 정보 수집
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        )
      })

      const { latitude, longitude } = position.coords
      const timestamp = position.timestamp

      // 서버 액션 호출
      const result = await processAttendance(siteId, latitude, longitude, timestamp)
      setResult(result)

    } catch (error: unknown) {
      console.error("위치 정보 수집 오류:", error)
      
      if (error && typeof error === 'object' && 'code' in error) {
        const geolocationError = error as GeolocationPositionError
        if (geolocationError.code === 1) {
          setError("위치 권한이 거부되었습니다.")
        } else if (geolocationError.code === 2) {
          setError("위치 정보를 가져올 수 없습니다.")
        } else if (geolocationError.code === 3) {
          setError("위치 정보 요청 시간이 초과되었습니다.")
        } else {
          setError("위치 정보 수집 중 오류가 발생했습니다.")
        }
      } else {
        setError("위치 정보 수집 중 오류가 발생했습니다.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!siteId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류</h1>
          <p className="text-gray-600">현장 정보가 없습니다.</p>
        </div>
      </div>
    )
  }

  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">로그인 중...</h1>
          <p className="text-gray-600">카카오 로그인으로 이동합니다.</p>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">로그인 중...</h1>
          <p className="text-gray-600">카카오 로그인으로 이동합니다.</p>
        </div>
      </div>
    )
  }

  const typeText = type === "in" ? "출근" : "퇴근"
  const buttonColor = type === "in" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">시그너스 웨딩홀</h1>
          <p className="text-gray-600">
            {session.user?.name}님, 안녕하세요!
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {typeText}을 기록합니다
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className={`mb-4 p-4 border rounded-lg ${
            result.success 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
          }`}>
            <p className={`text-sm ${
              result.success ? "text-green-600" : "text-red-600"
            }`}>
              {result.message}
            </p>
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : `${buttonColor} text-white`
          }`}
        >
          {isLoading ? "처리 중..." : `${typeText} 처리`}
        </button>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push("/")}
            className="text-gray-600 hover:text-gray-700 text-sm"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4">로딩 중...</h1>
          <div className="mt-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <ScanPageContent />
    </Suspense>
  )
}

