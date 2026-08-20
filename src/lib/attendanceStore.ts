import { DEFAULT_OFFICES } from "@/lib/officeStore"

export type AttendanceStatus = "hadir" | "telat" | "izin" | "alfa"

export type AttendanceRecord = {
  id: string
  /** YYYY-MM-DD */
  dateKey: string
  /** Display e.g. 13 Agu */
  dateLabel: string
  checkIn: string
  checkOut: string
  status: AttendanceStatus
  dur: string
  loc: string
  locAddress?: string
  lat?: number
  lng?: number
  distanceM?: number
  checkInPhoto?: string
  checkOutPhoto?: string
  outLoc?: string
  outLocAddress?: string
  outLat?: number
  outLng?: number
  outDistanceM?: number
  year: number
}

export type AttendancePunchMeta = {
  photo?: string
  locAddress?: string
  lat?: number
  lng?: number
  distanceM?: number
}

const STORAGE_KEY = "hadir-attendance-v1"
export const ATTENDANCE_CHANGED_EVENT = "hadir-attendance-changed"

const SHIFT_START_MINUTES = 8 * 60 // 08:00
const TOLERANCE_MINUTES = 15

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export function toDateKey(d = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function toDateLabel(d = new Date()): string {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ]
  return `${d.getDate()} ${months[d.getMonth()]}`
}

export function formatClock(d = new Date()): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function parseClockToMinutes(time: string): number | null {
  const m = String(time).trim().match(/^(\d{1,2})[:.](\d{2})/)
  if (!m) return null
  const hours = Number(m[1])
  const minutes = Number(m[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

export function calcDuration(checkIn: string, checkOut: string): string {
  const a = parseClockToMinutes(checkIn)
  const b = parseClockToMinutes(checkOut)
  if (a == null || b == null) return "—"
  const mins = b >= a ? b - a : 24 * 60 - a + b
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return `${h}j ${pad(m)}m`
}

export function statusFromCheckIn(checkIn: string): AttendanceStatus {
  const mins = parseClockToMinutes(checkIn)
  if (mins == null) return "hadir"
  return mins > SHIFT_START_MINUTES + TOLERANCE_MINUTES ? "telat" : "hadir"
}

/** Seed history so Riwayat isn't empty on first load. */
const SEED: AttendanceRecord[] = [
  { id: "seed-12", dateKey: "2026-08-12", dateLabel: "12 Agu", checkIn: "08:02", checkOut: "17:05", status: "hadir", dur: "9j 03m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-11", dateKey: "2026-08-11", dateLabel: "11 Agu", checkIn: "08:11", checkOut: "17:10", status: "hadir", dur: "9j 01m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-10", dateKey: "2026-08-10", dateLabel: "10 Agu", checkIn: "09:14", checkOut: "17:00", status: "telat", dur: "7j 46m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-09", dateKey: "2026-08-09", dateLabel: "09 Agu", checkIn: "—", checkOut: "—", status: "izin", dur: "—", loc: "—", year: 2026 },
  { id: "seed-08", dateKey: "2026-08-08", dateLabel: "08 Agu", checkIn: "07:58", checkOut: "16:55", status: "hadir", dur: "8j 57m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-07", dateKey: "2026-08-07", dateLabel: "07 Agu", checkIn: "08:04", checkOut: "17:08", status: "hadir", dur: "9j 04m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-06", dateKey: "2026-08-06", dateLabel: "06 Agu", checkIn: "08:00", checkOut: "17:02", status: "hadir", dur: "9j 02m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-05", dateKey: "2026-08-05", dateLabel: "05 Agu", checkIn: "08:22", checkOut: "17:00", status: "telat", dur: "8j 38m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-04", dateKey: "2026-08-04", dateLabel: "04 Agu", checkIn: "07:55", checkOut: "17:12", status: "hadir", dur: "9j 17m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-03", dateKey: "2026-08-03", dateLabel: "03 Agu", checkIn: "—", checkOut: "—", status: "izin", dur: "—", loc: "—", year: 2026 },
  { id: "seed-02", dateKey: "2026-08-02", dateLabel: "02 Agu", checkIn: "08:01", checkOut: "16:58", status: "hadir", dur: "8j 57m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-01", dateKey: "2026-08-01", dateLabel: "01 Agu", checkIn: "08:09", checkOut: "17:06", status: "hadir", dur: "8j 57m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-31", dateKey: "2026-07-31", dateLabel: "31 Jul", checkIn: "08:03", checkOut: "17:01", status: "hadir", dur: "8j 58m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-30", dateKey: "2026-07-30", dateLabel: "30 Jul", checkIn: "09:05", checkOut: "17:00", status: "telat", dur: "7j 55m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-29", dateKey: "2026-07-29", dateLabel: "29 Jul", checkIn: "08:00", checkOut: "17:04", status: "hadir", dur: "9j 04m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-28", dateKey: "2026-07-28", dateLabel: "28 Jul", checkIn: "—", checkOut: "—", status: "alfa", dur: "—", loc: "—", year: 2026 },
  { id: "seed-27", dateKey: "2026-07-27", dateLabel: "27 Jul", checkIn: "07:59", checkOut: "17:03", status: "hadir", dur: "9j 04m", loc: "Kantor Pusat", year: 2026 },
  { id: "seed-26", dateKey: "2026-07-26", dateLabel: "26 Jul", checkIn: "08:06", checkOut: "17:00", status: "hadir", dur: "8j 54m", loc: "Kantor Pusat", year: 2026 },
]

function parseRecords(raw: unknown): AttendanceRecord[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  const out: AttendanceRecord[] = []
  for (const item of raw) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    if (typeof o.dateKey !== "string") continue
    const checkIn = String(o.checkIn || "—")
    const checkOut = String(o.checkOut || "—")
    const storedDur = String(o.dur || "").trim()
    const dur =
      checkIn !== "—" && checkOut !== "—"
        ? calcDuration(checkIn, checkOut)
        : storedDur && storedDur !== "—"
          ? storedDur
          : "—"
    out.push({
      id: String(o.id || o.dateKey),
      dateKey: o.dateKey,
      dateLabel: String(o.dateLabel || o.date || ""),
      checkIn,
      checkOut,
      status: (o.status as AttendanceStatus) || "hadir",
      dur,
      loc: String(o.loc || DEFAULT_OFFICES[0].name),
      locAddress: typeof o.locAddress === "string" ? o.locAddress : undefined,
      lat: typeof o.lat === "number" ? o.lat : undefined,
      lng: typeof o.lng === "number" ? o.lng : undefined,
      distanceM: typeof o.distanceM === "number" ? o.distanceM : undefined,
      checkInPhoto: typeof o.checkInPhoto === "string" ? o.checkInPhoto : undefined,
      checkOutPhoto: typeof o.checkOutPhoto === "string" ? o.checkOutPhoto : undefined,
      outLoc: typeof o.outLoc === "string" ? o.outLoc : undefined,
      outLocAddress: typeof o.outLocAddress === "string" ? o.outLocAddress : undefined,
      outLat: typeof o.outLat === "number" ? o.outLat : undefined,
      outLng: typeof o.outLng === "number" ? o.outLng : undefined,
      outDistanceM: typeof o.outDistanceM === "number" ? o.outDistanceM : undefined,
      year: Number(o.year) || Number(String(o.dateKey).slice(0, 4)) || new Date().getFullYear(),
    })
  }
  return out.length ? out : null
}

export function loadAttendance(): AttendanceRecord[] {
  if (typeof window === "undefined") return SEED
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return SEED
    return parseRecords(JSON.parse(raw)) ?? SEED
  } catch {
    return SEED
  }
}

function pruneOldPhotos(records: AttendanceRecord[], keepDays = 14): AttendanceRecord[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - keepDays)
  const cutoffKey = toDateKey(cutoff)
  return records.map((r) => {
    if (r.dateKey >= cutoffKey) return r
    const next = { ...r }
    delete next.checkInPhoto
    delete next.checkOutPhoto
    return next
  })
}

function stripAllPhotosExcept(records: AttendanceRecord[], keepDateKey: string): AttendanceRecord[] {
  return records.map((r) => {
    if (r.dateKey === keepDateKey) return r
    const next = { ...r }
    delete next.checkInPhoto
    delete next.checkOutPhoto
    return next
  })
}

function saveAttendance(records: AttendanceRecord[]) {
  if (typeof window === "undefined") return
  const pruned = pruneOldPhotos(records)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned))
  } catch {
    const todayKey = toDateKey()
    const slim = stripAllPhotosExcept(pruned, todayKey)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slim))
  }
  window.dispatchEvent(new CustomEvent(ATTENDANCE_CHANGED_EVENT))
}

function sortByDateDesc(records: AttendanceRecord[]) {
  return [...records].sort((a, b) => (a.dateKey < b.dateKey ? 1 : a.dateKey > b.dateKey ? -1 : 0))
}

export function getTodayRecord(records: AttendanceRecord[] = loadAttendance()): AttendanceRecord | null {
  const key = toDateKey()
  return records.find((r) => r.dateKey === key) ?? null
}

export function checkInToday(officeName: string, at = new Date(), meta: AttendancePunchMeta = {}): AttendanceRecord {
  const records = loadAttendance()
  const dateKey = toDateKey(at)
  const checkIn = formatClock(at)
  const status = statusFromCheckIn(checkIn)
  const existing = records.find((r) => r.dateKey === dateKey)

  const next: AttendanceRecord = existing
    ? {
        ...existing,
        checkIn,
        status: existing.status === "izin" || existing.status === "alfa" ? status : status,
        loc: officeName,
        locAddress: meta.locAddress ?? existing.locAddress,
        lat: meta.lat ?? existing.lat,
        lng: meta.lng ?? existing.lng,
        distanceM: meta.distanceM ?? existing.distanceM,
        checkInPhoto: meta.photo ?? existing.checkInPhoto,
        checkOut: existing.checkOut === "—" ? "—" : existing.checkOut,
        dur: existing.checkOut !== "—" ? calcDuration(checkIn, existing.checkOut) : "—",
      }
    : {
        id: `att-${dateKey}`,
        dateKey,
        dateLabel: toDateLabel(at),
        checkIn,
        checkOut: "—",
        status,
        dur: "—",
        loc: officeName,
        locAddress: meta.locAddress,
        lat: meta.lat,
        lng: meta.lng,
        distanceM: meta.distanceM,
        checkInPhoto: meta.photo,
        year: at.getFullYear(),
      }

  const merged = sortByDateDesc([next, ...records.filter((r) => r.dateKey !== dateKey)])
  saveAttendance(merged)
  return next
}

export function checkOutToday(at = new Date(), meta: AttendancePunchMeta & { loc?: string } = {}): AttendanceRecord | null {
  const records = loadAttendance()
  const dateKey = toDateKey(at)
  const existing = records.find((r) => r.dateKey === dateKey)
  if (!existing || existing.checkIn === "—") return null

  const checkOut = formatClock(at)
  const next: AttendanceRecord = {
    ...existing,
    checkOut,
    dur: calcDuration(existing.checkIn, checkOut),
    checkOutPhoto: meta.photo ?? existing.checkOutPhoto,
    outLoc: meta.loc ?? existing.outLoc,
    outLocAddress: meta.locAddress ?? existing.outLocAddress,
    outLat: meta.lat ?? existing.outLat,
    outLng: meta.lng ?? existing.outLng,
    outDistanceM: meta.distanceM ?? existing.outDistanceM,
  }
  const merged = sortByDateDesc([next, ...records.filter((r) => r.dateKey !== dateKey)])
  saveAttendance(merged)
  return next
}
