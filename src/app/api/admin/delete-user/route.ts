import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const { userName } = await request.json()

    if (!userName) {
      return NextResponse.json(
        { success: false, message: '사용자명이 필요합니다.' },
        { status: 400 }
      )
    }

    console.log(`사용자 "${userName}" 삭제 시작`)

    // 해당 사용자의 모든 출퇴근 기록 삭제
    const deletedAttendances = await prisma.attendance.deleteMany({
      where: {
        user: {
          name: userName
        }
      }
    })

    console.log(`삭제된 출퇴근 기록: ${deletedAttendances.count}개`)

    // 사용자 삭제
    const deletedUser = await prisma.user.deleteMany({
      where: {
        name: userName
      }
    })

    if (deletedUser.count === 0) {
      return NextResponse.json(
        { success: false, message: '해당 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log(`사용자 "${userName}" 삭제 완료`)

    return NextResponse.json({
      success: true,
      message: `사용자 "${userName}"와 관련 데이터가 모두 삭제되었습니다.`
    })

  } catch (error) {
    console.error('사용자 삭제 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
