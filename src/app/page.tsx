'use client'

import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, status } = useSession()
  const [isChecking, setIsChecking] = useState(true)
  const [isRegistered, setIsRegistered] = useState(false)
  const [showRegistrationModal, setShowRegistrationModal] = useState(false)
  const [contact, setContact] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // 등록되지 않은 사용자는 등록 모달 표시
  useEffect(() => {
    if (!isChecking && session?.user && !isRegistered) {
      console.log('사용자 등록되지 않음, 등록 모달 표시:', session.user.name)
      setShowRegistrationModal(true)
    }
  }, [isChecking, session, isRegistered])

  const handleRegistration = async () => {
    if (!contact.trim()) {
      alert('연락처를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session?.user?.name,
          email: null,
          contact: contact.trim(),
          image: session?.user?.image,
        }),
      })

      if (response.ok) {
        setIsRegistered(true)
        setShowRegistrationModal(false)
        setContact('')
        alert('등록이 완료되었습니다!')
      } else {
        const error = await response.json()
        alert(error.message || '등록에 실패했습니다.')
      }
    } catch (error) {
      console.error('등록 오류:', error)
      alert('등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

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

              {isRegistered && (
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
              )}
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

      {/* 등록 모달 */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">사용자 등록</h2>
              <p className="text-gray-600">출퇴근을 위해 연락처를 입력해주세요</p>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                {session?.user?.image && (
                  <img
                    src={session.user.image}
                    alt="프로필"
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-sm text-gray-600">카카오 계정</p>
                </div>
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-2">
                  연락처 *
                </label>
                <input
                  type="tel"
                  id="contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="010-1234-5678"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRegistrationModal(false)
                  setContact('')
                  signOut({ callbackUrl: '/' })
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                취소
              </button>
              <button
                onClick={handleRegistration}
                disabled={isSubmitting || !contact.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '등록 중...' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
