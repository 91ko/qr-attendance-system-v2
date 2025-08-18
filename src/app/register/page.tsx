'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contact, setContact] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contact.trim()) {
      setMessage('연락처를 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: session.user?.name,
          email: null,
          contact: contact.trim(),
          image: session.user?.image,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setMessage('등록이 완료되었습니다!')
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } else {
        setMessage(data.message || '등록 중 오류가 발생했습니다.')
      }
    } catch {
      setMessage('서버 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">사용자 등록</h2>
          <p className="text-gray-600">출퇴근 시스템 사용을 위한 정보를 입력해주세요</p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              출퇴근 기록 시 연락처로 확인됩니다
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('완료') 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
