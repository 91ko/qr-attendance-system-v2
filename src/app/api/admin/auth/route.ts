import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { success: false, message: '비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    // 환경변수에서 관리자 비밀번호 확인
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.')
      return NextResponse.json(
        { success: false, message: '서버 설정 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (password === adminPassword) {
      return NextResponse.json({
        success: true,
        message: '인증이 완료되었습니다.'
      })
    } else {
      return NextResponse.json(
        { success: false, message: '비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

  } catch (error) {
    console.error('관리자 인증 오류:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
