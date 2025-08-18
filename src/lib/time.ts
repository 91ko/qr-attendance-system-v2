export function nowKST(): Date {
  return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
}

export function startOfKSTDay(date: Date): Date {
  const kstDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
  kstDate.setHours(0, 0, 0, 0)
  return kstDate
}

export function endOfKSTDay(date: Date): Date {
  const kstDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Seoul"}))
  kstDate.setHours(23, 59, 59, 999)
  return kstDate
}

export function formatKSTTime(date: Date): string {
  return date.toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  })
}

export function isTodayKST(date: Date): boolean {
  const today = startOfKSTDay(new Date())
  const targetDate = startOfKSTDay(date)
  return today.getTime() === targetDate.getTime()
}

