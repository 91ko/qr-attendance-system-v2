import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json(
        { success: false, message: '이름이 필요합니다.' },
        { status: 400 }
      )
    }

    // 사용자 등록 여부 확인
    const user = await prisma.user.findFirst({
      where: {
        name: name
      }
    })

    return NextResponse.json({
      success: true,
      isRegistered: !!user
    })

  } catch (error) {
    console.error('사용자 등록 확인 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
