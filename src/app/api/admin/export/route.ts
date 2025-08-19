import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const { startDate, endDate } = await request.json()

    // 날짜 필터 설정
    let dateFilter: { gte?: Date; lte?: Date } = {}
    
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // 종료일의 마지막 시간으로 설정
      dateFilter = { gte: start, lte: end }
    } else {
      // 날짜가 지정되지 않으면 오늘 날짜로 설정
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)
      dateFilter = { gte: startOfDay, lte: endOfDay }
    }

    // 출퇴근 데이터 조회
    const attendances = await prisma.attendance.findMany({
      where: {
        at: dateFilter
      },
      include: {
        user: {
          select: {
            name: true,
            contact: true,
            image: true
          }
        }
      },
      orderBy: [
        { user: { name: true } },
        { at: true }
      ]
    })

    // 데이터를 사용자별로 그룹화
    const userAttendanceMap = new Map()

    attendances.forEach(attendance => {
      const userName = attendance.user.name || 'Unknown'
      const dateKey = attendance.at.toISOString().split('T')[0]
      const key = `${userName}-${dateKey}`

      if (!userAttendanceMap.has(key)) {
        userAttendanceMap.set(key, {
          직원명: userName,
          연락처: attendance.user.contact || '-',
          날짜: dateKey,
          출근시간: '',
          퇴근시간: '',
          근무시간: 0,
          급여: 0
        })
      }

      const record = userAttendanceMap.get(key)
      if (attendance.type === 'IN') {
        record.출근시간 = attendance.at.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      } else if (attendance.type === 'OUT') {
        record.퇴근시간 = attendance.at.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        })
      }
    })

    // 근무시간과 급여 계산
    const processedData = Array.from(userAttendanceMap.values()).map(record => {
      if (record.출근시간 && record.퇴근시간) {
        const inTime = new Date(`2000-01-01T${record.출근시간}`)
        const outTime = new Date(`2000-01-01T${record.퇴근시간}`)
        const workHours = (outTime.getTime() - inTime.getTime()) / (1000 * 60 * 60)
        record.근무시간 = Math.round(workHours * 100) / 100
        record.급여 = workHours > 0 ? Math.floor(workHours) * 10000 + 10000 : 0
      } else {
        record.퇴근시간 = record.퇴근시간 || '미퇴근'
        record.근무시간 = 0
        record.급여 = 0
      }
      return record
    })

    // 엑셀 워크북 생성
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(processedData)

    // 열 너비 설정
    const columnWidths = [
      { wch: 15 }, // 직원명
      { wch: 15 }, // 연락처
      { wch: 12 }, // 날짜
      { wch: 10 }, // 출근시간
      { wch: 10 }, // 퇴근시간
      { wch: 10 }, // 근무시간
      { wch: 12 }  // 급여
    ]
    worksheet['!cols'] = columnWidths

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, '출퇴근 기록')

    // 엑셀 파일 생성
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // 파일명 생성
    const startDateStr = startDate ? new Date(startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const endDateStr = endDate ? new Date(endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const fileName = `출퇴근기록_${startDateStr}_${endDateStr}.xlsx`

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })

  } catch (error) {
    console.error('엑셀 내보내기 오류:', error)
    return NextResponse.json(
      { success: false, message: '엑셀 내보내기 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
