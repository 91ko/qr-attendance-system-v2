"use server"

import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { getSite } from "@/lib/sites"
import { isWithinRadius, isLocationFresh } from "@/lib/geo"
import { startOfKSTDay, endOfKSTDay } from "@/lib/time"
import { revalidatePath } from "next/cache"

export interface ScanResult {
  success: boolean
  message: string
  type?: "IN" | "OUT"
  siteName?: string
}

export async function processAttendance(
  siteId: string,
  lat: number,
  lng: number,
  timestamp: number
): Promise<ScanResult> {
  try {
    // 1. 사용자 세션 확인
    const session = await getServerSession()
    console.log("Session info:", JSON.stringify(session, null, 2))
    
    if (!session?.user) {
      return {
        success: false,
        message: "로그인이 필요합니다. 카카오 로그인을 먼저 진행해주세요."
      }
    }

    // 2. 현장 정보 확인
    const site = getSite(siteId)
    if (!site) {
      return {
        success: false,
        message: "유효하지 않은 현장입니다."
      }
    }

    // 3. 위치 정보 유효성 확인 (2분 이내)
    if (!isLocationFresh(timestamp)) {
      return {
        success: false,
        message: "위치 정보가 오래되었습니다. 다시 시도하세요."
      }
    }

    // 4. 거리 계산 및 반경 내 확인
    const distance = isWithinRadius(lat, lng, site.lat, site.lng, site.radiusM)
    if (!distance) {
      const actualDistance = Math.round(
        Math.sqrt(
          Math.pow(lat - site.lat, 2) + Math.pow(lng - site.lng, 2)
        ) * 111000 // 대략적인 미터 변환
      )
      return {
        success: false,
        message: `현장 반경(${site.radiusM}m) 밖입니다. 현재 거리: ${actualDistance}m`
      }
    }

    // 5. 사용자 정보 조회 (이메일 또는 이름으로)
    let user = null
    
    console.log("User email:", session.user.email)
    console.log("User name:", session.user.name)
    
    // 먼저 이름으로 사용자 찾기 (카카오는 항상 이름을 제공)
    if (session.user.name) {
      user = await prisma.user.findFirst({
        where: {
          name: session.user.name
        }
      })
      console.log("User found by name:", user)
    }
    


    if (!user) {
      // 모든 사용자 조회해서 확인
      const allUsers = await prisma.user.findMany()
      console.log("All users in DB:", allUsers)
      
      return {
        success: false,
        message: "사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요."
      }
    }

    // 6. 오늘 마지막 출퇴근 기록 조회
    const todayStart = startOfKSTDay(new Date())
    const todayEnd = endOfKSTDay(new Date())

    const lastAttendance = await prisma.attendance.findFirst({
      where: {
        userId: user.id,
        at: {
          gte: todayStart,
          lte: todayEnd
        }
      },
      orderBy: {
        at: "desc"
      }
    })

    // 7. 중복 출퇴근 방지 로직
    let attendanceType: 'IN' | 'OUT'
    if (!lastAttendance) {
      // 오늘 첫 기록이면 IN
      attendanceType = 'IN'
    } else if (lastAttendance.type === 'IN') {
      // 마지막이 IN이면 OUT
      attendanceType = 'OUT'
    } else {
      // 마지막이 OUT이면 중복 방지
      return {
        success: false,
        message: "이미 퇴근 처리되었습니다. 내일 다시 출근해주세요."
      }
    }

    // 8. 출퇴근 기록 저장
    await prisma.attendance.create({
      data: {
        userId: user.id,
        site: siteId,
        type: attendanceType,
        source: "QR",
        at: new Date()
      }
    })

    revalidatePath("/admin")

    return {
      success: true,
      message: `${site.name} ${site.radiusM}m 이내로 확인됨 — ${attendanceType === "IN" ? "출근" : "퇴근"}(${attendanceType}) 처리 완료`,
      type: attendanceType,
      siteName: site.name
    }

  } catch (error) {
    console.error("출퇴근 처리 오류:", error)
    return {
      success: false,
      message: "서버 오류가 발생했습니다. 다시 시도해주세요."
    }
  }
}

