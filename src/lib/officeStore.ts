import { distanceMeters } from "@/lib/geo"

export type OfficeLocation = {
  id: number
  name: string
  address: string
  lat: number
  lng: number
  radiusM: number
  active: boolean
}

const STORAGE_KEY = "hadir-offices-v1"
export const OFFICES_CHANGED_EVENT = "hadir-offices-changed"

/** Default seed — HRD can edit anytime in Pengaturan → Lokasi Kantor. */
export const DEFAULT_OFFICES: OfficeLocation[] = [
  {
    id: 1,
    name: "Kantor Pusat",
    address:
      "Jl. Kamboja No.76, RT.4/RW.7, Kota Bambu Utara, Kec. Palmerah, Jakarta, Daerah Khusus Ibukota Jakarta 11420",
    lat: -6.18153,
    lng: 106.80283,
    radiusM: 200,
    active: true,
  },
  {
    id: 2,
    name: "Kantor Bandung",
    address: "Jl. Braga No. 45, Bandung",
    lat: -6.9175,
    lng: 107.6191,
    radiusM: 150,
    active: true,
  },
  {
    id: 3,
    name: "Kantor Surabaya",
    address: "Jl. Raya Gubeng No. 12, Surabaya",
    lat: -7.2575,
    lng: 112.7521,
    radiusM: 200,
    active: false,
  },
]

function parseOffices(raw: unknown): OfficeLocation[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const parsed: OfficeLocation[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    const lat = Number(o.lat)
    const lng = Number(o.lng)
    const radiusM = Number(o.radiusM ?? o.radius)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue
    parsed.push({
      id: Number(o.id) || parsed.length + 1,
      name: String(o.name || "Kantor"),
      address: String(o.address || ""),
      lat,
      lng,
      radiusM: Number.isFinite(radiusM) ? radiusM : 200,
      active: Boolean(o.active),
    })
  }
  return parsed.length ? parsed : null
}

export function loadOffices(): OfficeLocation[] {
  if (typeof window === "undefined") return DEFAULT_OFFICES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_OFFICES
    return parseOffices(JSON.parse(raw)) ?? DEFAULT_OFFICES
  } catch {
    return DEFAULT_OFFICES
  }
}

export function saveOffices(offices: OfficeLocation[]): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offices))
  window.dispatchEvent(new CustomEvent(OFFICES_CHANGED_EVENT))
}

/** Active offices only (used for multi-site check-in). */
export function getActiveOffices(offices: OfficeLocation[] = loadOffices()): OfficeLocation[] {
  const active = offices.filter((o) => o.active)
  return active.length ? active : offices.slice(0, 1)
}

/** Primary active office used as default map focus. */
export function getPrimaryOffice(offices: OfficeLocation[] = loadOffices()): OfficeLocation {
  return getActiveOffices(offices)[0] ?? offices[0] ?? DEFAULT_OFFICES[0]
}

export type NearestOfficeMatch = {
  office: OfficeLocation
  distanceM: number
  inside: boolean
}

/** Pick nearest active office to a GPS point (for multi-kantor absensi). */
export function findNearestOffice(
  lat: number,
  lng: number,
  offices: OfficeLocation[] = loadOffices(),
): NearestOfficeMatch | null {
  const active = getActiveOffices(offices)
  if (!active.length) return null

  let best: NearestOfficeMatch | null = null
  for (const office of active) {
    const distanceM = distanceMeters(lat, lng, office.lat, office.lng)
    const inside = distanceM <= office.radiusM
    if (!best || distanceM < best.distanceM) {
      best = { office, distanceM, inside }
    }
  }
  return best
}

/** @deprecated Prefer getPrimaryOffice / useOffices — kept as fallback default. */
export const OFFICE = {
  get lat() {
    return getPrimaryOffice().lat
  },
  get lng() {
    return getPrimaryOffice().lng
  },
  get name() {
    return getPrimaryOffice().name
  },
  get address() {
    return getPrimaryOffice().address
  },
  get radiusM() {
    return getPrimaryOffice().radiusM
  },
}
