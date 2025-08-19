import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfKSTDay, endOfKSTDay } from '@/lib/time'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // 날짜 범위 설정
               let dateFilter: { gte?: Date; lte?: Date } = {}
    
    if (startDate && endDate) {
      // 선택된 날짜 범위
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      
      dateFilter = {
        gte: start,
        lte: end
      }
    } else {
      // 기본값: 오늘
      const todayStart = startOfKSTDay(new Date())
      const todayEnd = endOfKSTDay(new Date())
      
      dateFilter = {
        gte: todayStart,
        lte: todayEnd
      }
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        at: dateFilter
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            contact: true
          } as any // eslint-disable-line @typescript-eslint/no-explicit-any
        }
      },
      orderBy: {
        at: 'desc'
      }
    })

    console.log('조회된 출퇴근 데이터:', (attendances as any).map((a: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
      userName: a.user.name,
      userContact: a.user.contact,
      userContactType: typeof a.user.contact,
      type: a.type,
      at: a.at
    })))
    
    // 연락처가 없는 사용자들 확인
    const usersWithoutContact = (attendances as any).filter((a: any) => !a.user.contact) // eslint-disable-line @typescript-eslint/no-explicit-any
    if (usersWithoutContact.length > 0) {
      console.log('연락처가 없는 사용자들:', usersWithoutContact.map((a: any) => a.user.name)) // eslint-disable-line @typescript-eslint/no-explicit-any
    }

    return NextResponse.json({
      success: true,
      attendances
    })

  } catch (error) {
    console.error('관리자 출퇴근 데이터 조회 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { inId, outId, inTime, outTime } = await request.json()

               if (!inId || !inTime) {
             return NextResponse.json(
               { success: false, message: '출근 정보가 누락되었습니다.' },
               { status: 400 }
             )
           }

           // 출근 시간 수정
           await prisma.attendance.update({
             where: { id: inId },
             data: { at: new Date(inTime) }
           })

           // 퇴근 시간이 있는 경우에만 수정
           if (outId && outTime) {
             await prisma.attendance.update({
               where: { id: outId },
               data: { at: new Date(outTime) }
             })
           }

    return NextResponse.json({
      success: true,
      message: '기록이 수정되었습니다.'
    })

  } catch (error) {
    console.error('관리자 출퇴근 데이터 수정 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
               const { inId, outId } = await request.json()

           // 삭제할 기록들 수집
           const idsToDelete: string[] = []
           if (inId) idsToDelete.push(inId)
           if (outId && outId !== null) idsToDelete.push(outId)

    if (idsToDelete.length === 0) {
      return NextResponse.json(
        { success: false, message: '삭제할 기록이 없습니다.' },
        { status: 400 }
      )
    }

    // 출퇴근 기록 삭제
    await prisma.attendance.deleteMany({
      where: {
        id: {
          in: idsToDelete
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: '기록이 삭제되었습니다.'
    })

  } catch (error) {
    console.error('관리자 출퇴근 데이터 삭제 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
