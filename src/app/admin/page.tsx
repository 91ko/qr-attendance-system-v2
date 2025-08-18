'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatKSTTime } from '@/lib/time'
import EditModal from './components/EditModal'
import Link from 'next/link'

interface Attendance {
  id: string
  type: 'IN' | 'OUT'
  at: string
  user: {
    name: string
    image: string
  }
}

interface UserAttendance {
  name: string
  image: string
  date: string
  inTime?: string
  outTime?: string
  workHours?: number
  salary?: number
  inId?: string
  outId?: string
}

export default function AdminPage() {
  const router = useRouter()
  const [, setAttendances] = useState<Attendance[]>([])
  const [userAttendances, setUserAttendances] = useState<UserAttendance[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [editModal, setEditModal] = useState<{
    isOpen: boolean
    user: UserAttendance | null
  }>({
    isOpen: false,
    user: null
  })
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    // 관리자 인증 확인
    const isAuthenticated = sessionStorage.getItem('adminAuthenticated')
    if (!isAuthenticated) {
      router.push('/admin/auth')
      return
    }

    fetchAttendances()
  }, [router, startDate, endDate])

  const fetchAttendances = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      
      const response = await fetch(`/api/admin/attendances?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        setAttendances(data.attendances)
        processAttendances(data.attendances)
      }
    } catch (error) {
      console.error('출퇴근 데이터 로드 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }, [startDate, endDate])

  const processAttendances = (attendanceData: Attendance[]) => {
    const userMap = new Map<string, UserAttendance>()

    // 선택된 날짜 범위로 필터링
    const selectedStartDate = startDate || new Date().toISOString().split('T')[0]
    const selectedEndDate = endDate || new Date().toISOString().split('T')[0]
    
    attendanceData.forEach(attendance => {
      const attendanceDate = attendance.at.split('T')[0]
      if (attendanceDate < selectedStartDate || attendanceDate > selectedEndDate) return

      const key = `${attendance.user.name}-${attendanceDate}` // 사용자명 + 날짜로 키 생성
      
      if (!userMap.has(key)) {
        userMap.set(key, {
          name: attendance.user.name,
          image: attendance.user.image,
          date: attendanceDate
        })
      }

      const user = userMap.get(key)!
      
      if (attendance.type === 'IN') {
        user.inTime = attendance.at
        user.inId = attendance.id
      } else if (attendance.type === 'OUT') {
        user.outTime = attendance.at
        user.outId = attendance.id
      }
    })

    // 완전한 출퇴근 기록만 필터링 (출근과 퇴근이 모두 있는 경우만)
    const processedUsers = Array.from(userMap.values())
      .map(user => {
        if (user.inTime && user.outTime) {
          // 출근과 퇴근이 모두 있는 경우
          const inTime = new Date(user.inTime!)
          const outTime = new Date(user.outTime!)
          const workHours = Math.max(0, (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60))
          const salary = workHours > 0 ? Math.floor(workHours) * 10000 + 10000 : 0 // 0시간이면 0원, 그 외에는 시간당 1만원 + 기본 1만원
          
          return {
            ...user,
            workHours: Math.floor(workHours),
            salary
          }
        } else if (user.inTime) {
          // 출근만 있는 경우
          return {
            ...user,
            workHours: 0,
            salary: 0
          }
        } else {
          // 퇴근만 있는 경우 (이론적으로는 없어야 함)
          return {
            ...user,
            workHours: 0,
            salary: 0
          }
        }
      })

    setUserAttendances(processedUsers)
  }

  const filteredUsers = userAttendances.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated')
    router.push('/admin/auth')
  }

  const handleEdit = (user: UserAttendance) => {
    setEditModal({
      isOpen: true,
      user
    })
  }

  const handleEditSave = async (data: { inTime: string; outTime: string }) => {
    if (!editModal.user) return

    try {
      const response = await fetch('/api/admin/attendances', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inId: editModal.user.inId,
          outId: editModal.user.outId,
          inTime: data.inTime,
          outTime: data.outTime
        }),
      })

      const result = await response.json()
      
      if (result.success) {
        alert('기록이 수정되었습니다.')
        fetchAttendances() // 데이터 새로고침
      } else {
        alert('수정 실패: ' + result.message)
      }
    } catch (error) {
      console.error('수정 오류:', error)
      alert('수정 중 오류가 발생했습니다.')
    }
  }

  const handleDelete = async (user: UserAttendance) => {
    if (!confirm(`정말로 ${user.name}의 ${user.date} 기록을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const response = await fetch('/api/admin/attendances', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inId: user.inId,
          outId: user.outId || null
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        alert('기록이 삭제되었습니다.')
        fetchAttendances() // 데이터 새로고침
      } else {
        alert('삭제 실패: ' + data.message)
      }
    } catch (error) {
      console.error('삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  const handleSelectAll = () => {
    if (selectedItems.size === filteredUsers.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredUsers.map(user => `${user.name}-${user.date}`)))
    }
  }

  const handleSelectItem = (key: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(key)) {
      newSelected.delete(key)
    } else {
      newSelected.add(key)
    }
    setSelectedItems(newSelected)
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      alert('삭제할 항목을 선택해주세요.')
      return
    }

    if (!confirm(`선택한 ${selectedItems.size}개의 기록을 삭제하시겠습니까?`)) {
      return
    }

    try {
      const itemsToDelete = filteredUsers.filter(user => 
        selectedItems.has(`${user.name}-${user.date}`)
      )

      const deletePromises = itemsToDelete.map(user => 
        fetch('/api/admin/attendances', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inId: user.inId,
            outId: user.outId || null
          }),
        })
      )

      const responses = await Promise.all(deletePromises)
      const results = await Promise.all(responses.map(r => r.json()))

      const successCount = results.filter(r => r.success).length
      
      if (successCount === itemsToDelete.length) {
        alert(`${successCount}개의 기록이 삭제되었습니다.`)
        setSelectedItems(new Set())
        fetchAttendances()
      } else {
        alert(`${successCount}개 삭제 성공, ${itemsToDelete.length - successCount}개 삭제 실패`)
      }
    } catch (error) {
      console.error('일괄 삭제 오류:', error)
      alert('삭제 중 오류가 발생했습니다.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">출퇴근 관리</h1>
            <div className="flex space-x-4">
              {selectedItems.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  선택 삭제 ({selectedItems.size}개)
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                로그아웃
              </button>
              <Link
                href="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                홈으로
              </Link>
            </div>
          </div>

          {/* 검색 및 날짜 필터 */}
          <div className="mb-6 space-y-4">
            {/* 검색 */}
            <div className="relative">
              <input
                type="text"
                placeholder="이름으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* 날짜 필터 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  날짜 초기화
                </button>
              </div>
            </div>
          </div>

          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">총 직원</h3>
              <p className="text-2xl font-bold text-blue-900">{userAttendances.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">출근 완료</h3>
              <p className="text-2xl font-bold text-green-900">
                {userAttendances.filter(u => u.inTime).length}
              </p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-red-800">퇴근 완료</h3>
              <p className="text-2xl font-bold text-red-900">
                {userAttendances.filter(u => u.outTime).length}
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">총 급여</h3>
              <p className="text-2xl font-bold text-purple-900">
                {userAttendances.reduce((sum, u) => sum + (u.salary || 0), 0).toLocaleString()}원
              </p>
            </div>
          </div>

          {/* 출퇴근 테이블 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    직원명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    날짜
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    출근시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    퇴근시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    근무시간
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    급여
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    관리
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(`${user.name}-${user.date}`)}
                        onChange={() => handleSelectItem(`${user.name}-${user.date}`)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {user.image && (
                          <img
                            src={user.image}
                            alt="프로필"
                            className="w-8 h-8 rounded-full mr-3"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {user.name}
                        </span>
                      </div>
                    </td>
                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                               {user.date}
                             </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.inTime ? formatKSTTime(new Date(user.inTime)) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.outTime ? formatKSTTime(new Date(user.outTime)) : '미퇴근'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.workHours !== undefined ? `${user.workHours}시간` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.salary ? `${user.salary.toLocaleString()}원` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 font-medium"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '오늘 출퇴근 기록이 없습니다.'}
            </div>
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      <EditModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, user: null })}
        user={editModal.user}
        onSave={handleEditSave}
      />
    </div>
  )
}

