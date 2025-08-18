import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { name, contact, image } = await request.json()

    if (!name || !contact) {
      return NextResponse.json(
        { success: false, message: '이름과 연락처는 필수입니다.' },
        { status: 400 }
      )
    }

    // 이미 등록된 사용자인지 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        name: name
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: '이미 등록된 사용자입니다.' },
        { status: 400 }
      )
    }

    // 새 사용자 생성
    const user = await prisma.user.create({
      data: {
        name: name,
        email: null,
        contact: contact,
        image: image,
      }
    })

    return NextResponse.json({
      success: true,
      message: '사용자 등록이 완료되었습니다.',
      user: {
        id: user.id,
        name: user.name
      }
    })

  } catch (error) {
    console.error('사용자 등록 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
