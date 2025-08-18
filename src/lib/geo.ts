/**
 * 하버사인 공식을 사용하여 두 지점 간의 거리를 계산합니다 (미터 단위)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000 // 지구 반지름 (미터)
  
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * 위치가 지정된 반경 내에 있는지 확인합니다
 */
export function isWithinRadius(
  userLat: number,
  userLng: number,
  siteLat: number,
  siteLng: number,
  radiusM: number
): boolean {
  const distance = calculateDistance(userLat, userLng, siteLat, siteLng)
  return distance <= radiusM
}

/**
 * 위치 정보가 유효한지 확인합니다 (2분 이내)
 */
export function isLocationFresh(timestamp: number): boolean {
  const now = Date.now()
  const twoMinutes = 2 * 60 * 1000 // 2분을 밀리초로
  return (now - timestamp) <= twoMinutes
}

