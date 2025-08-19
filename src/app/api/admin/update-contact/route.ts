import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const { userName, contact } = await request.json()

    if (!userName || !contact) {
      return NextResponse.json(
        { success: false, message: '사용자명과 연락처가 필요합니다.' },
        { status: 400 }
      )
    }

    // 사용자 찾기 및 연락처 업데이트
    const updatedUser = await prisma.user.updateMany({
      where: {
        name: userName
      },
      data: {
        contact: contact
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    })

    if (updatedUser.count === 0) {
      return NextResponse.json(
        { success: false, message: '해당 사용자를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    console.log(`사용자 "${userName}"의 연락처를 "${contact}"로 업데이트했습니다.`)

    return NextResponse.json({
      success: true,
      message: '연락처가 업데이트되었습니다.'
    })

  } catch (error) {
    console.error('연락처 업데이트 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
