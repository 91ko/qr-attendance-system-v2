export interface Site {
  name: string
  lat: number
  lng: number
  radiusM: number
}

export const SITES: Record<string, Site> = {
  HQ: {
    name: "시그너스 웨딩홀",
    lat: 35.1686875,
    lng: 126.8011569,
    radiusM: 150
  }
}

export function getSite(siteId: string): Site | null {
  return SITES[siteId] || null
}

export function getAllSites(): Site[] {
  return Object.values(SITES)
}

export function getSiteIds(): string[] {
  return Object.keys(SITES)
}

