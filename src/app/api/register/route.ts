import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('등록 API 호출됨')
    
    const body = await request.json()
    console.log('요청 데이터:', body)
    
    const { name, contact, image } = body

    if (!name || !contact) {
      console.log('필수 필드 누락:', { name, contact })
      return NextResponse.json(
        { success: false, message: '이름과 연락처는 필수입니다.' },
        { status: 400 }
      )
    }

    console.log('데이터베이스 연결 확인 중...')
    
    // 데이터베이스 연결 테스트
    await prisma.$connect()
    console.log('데이터베이스 연결 성공')

    // 이미 등록된 사용자인지 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        name: name
      }
    })

    if (existingUser) {
      console.log('이미 등록된 사용자:', existingUser)
      return NextResponse.json(
        { success: true, message: '이미 등록된 사용자입니다.', user: existingUser },
        { status: 200 }
      )
    }

    console.log('새 사용자 생성 중...')
    
    // 새 사용자 생성
    const user = await prisma.user.create({
      data: {
        name: name,
        email: null,
        contact: contact,
        image: image,
      } as any // eslint-disable-line @typescript-eslint/no-explicit-any
    })

    console.log('사용자 생성 성공:', user)

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
      { success: false, message: `서버 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
