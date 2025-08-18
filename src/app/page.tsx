'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    const checkUserRegistration = async () => {
      if (status === 'loading') return
      
      if (!session?.user) {
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch('/api/check-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: session.user.name,
          }),
        })

        const data = await response.json()
        setIsRegistered(data.isRegistered)
      } catch (error) {
        console.error('사용자 등록 확인 오류:', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserRegistration()
  }, [session, status])

  // 등록되지 않은 사용자는 등록 페이지로 리다이렉트
  useEffect(() => {
    if (!isChecking && session?.user && !isRegistered) {
      router.push('/register')
    }
  }, [isChecking, session, isRegistered, router])

  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              시그너스 웨딩홀
            </h1>
            <p className="text-gray-600">출퇴근 관리 시스템</p>
          </div>

          {session?.user ? (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {session.user.image && (
                      <img
                        src={session.user.image}
                        alt="프로필"
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{session.user.name}</p>
                      <p className="text-sm text-gray-600">카카오 계정</p>
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1 rounded hover:bg-gray-100"
                  >
                    로그아웃
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/scan?site=HQ&type=in"
                    className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-center font-medium"
                  >
                    출근
                  </Link>
                  <Link
                    href="/scan?site=HQ&type=out"
                    className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors text-center font-medium"
                  >
                    퇴근
                  </Link>
                </div>
                
                {/* 관리자 링크 - 특정 사용자만 표시 */}
                {session.user.name === '관리자' && (
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      href="/admin/auth"
                      className="block w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-center text-sm"
                    >
                      관리자 페이지
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">출퇴근을 위해 카카오 로그인이 필요합니다</p>
              <Link
                href="/api/auth/signin/kakao"
                className="bg-yellow-400 text-black py-3 px-6 rounded-lg hover:bg-yellow-500 transition-colors inline-block font-medium"
              >
                카카오 로그인
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
