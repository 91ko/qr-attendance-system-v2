import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('=== 등록 API 호출됨 ===')
    console.log('요청 URL:', request.url)
    console.log('요청 메서드:', request.method)
    
    const body = await request.json()
    console.log('요청 데이터:', body)
    console.log('연락처 값:', body.contact)
    console.log('연락처 타입:', typeof body.contact)
    
    console.log('DATABASE_URL 환경변수 확인:', process.env.DATABASE_URL ? '설정됨' : '설정되지 않음')
    
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
    console.log('생성할 데이터:', { name, contact, image })
    
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
    console.log('저장된 연락처:', (user as any).contact) // eslint-disable-line @typescript-eslint/no-explicit-any

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
    
    // 데이터베이스 연결 오류인지 확인
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('Can\'t reach database server')) {
      return NextResponse.json(
        { success: false, message: '데이터베이스 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { success: false, message: `서버 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
