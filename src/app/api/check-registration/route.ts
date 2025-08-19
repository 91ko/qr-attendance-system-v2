import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('=== 등록 상태 확인 API 호출됨 ===')
    
    const { name } = await request.json()
    console.log('확인할 사용자명:', name)

    if (!name) {
      console.log('사용자명이 없음')
      return NextResponse.json(
        { success: false, message: '이름이 필요합니다.' },
        { status: 400 }
      )
    }

    console.log('데이터베이스 연결 시도...')
    
    // 사용자 등록 여부 확인
    const user = await prisma.user.findFirst({
      where: {
        name: name
      }
    })

    console.log('조회 결과:', user ? '사용자 발견' : '사용자 없음')

    return NextResponse.json({
      success: true,
      isRegistered: !!user
    })

  } catch (error) {
    console.error('사용자 등록 확인 오류:', error)
    console.error('오류 타입:', typeof error)
    console.error('오류 메시지:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
