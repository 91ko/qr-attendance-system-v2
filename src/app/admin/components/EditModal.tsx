'use client'

import { useState, useEffect } from 'react'

interface EditModalProps {
  isOpen: boolean
  onClose: () => void
  user: {
    name: string
    date: string
    inTime?: string
    outTime?: string
    inId?: string
    outId?: string
  } | null
  onSave: (data: { inTime: string; outTime: string }) => void
}

export default function EditModal({ isOpen, onClose, user, onSave }: EditModalProps) {
  const [inTime, setInTime] = useState('')
  const [outTime, setOutTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 모달이 열릴 때 초기값 설정
  useEffect(() => {
    if (user) {
      setInTime(user.inTime ? user.inTime.slice(0, 16) : '')
      setOutTime(user.outTime ? user.outTime.slice(0, 16) : '')
    }
  }, [user])

           const handleSave = async () => {
           if (!inTime) {
             alert('출근시간을 입력해주세요.')
             return
           }

           if (outTime && new Date(inTime) >= new Date(outTime)) {
             alert('출근시간은 퇴근시간보다 빨라야 합니다.')
             return
           }

    setIsLoading(true)
    try {
      await onSave({ inTime, outTime })
      onClose()
    } catch (error) {
      console.error('수정 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">출퇴근 시간 수정</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            <strong>{user.name}</strong> - {user.date}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출근시간
            </label>
            <input
              type="datetime-local"
              value={inTime}
              onChange={(e) => setInTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

                           <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     퇴근시간 (선택사항)
                   </label>
                   <input
                     type="datetime-local"
                     value={outTime}
                     onChange={(e) => setOutTime(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   />
                 </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
