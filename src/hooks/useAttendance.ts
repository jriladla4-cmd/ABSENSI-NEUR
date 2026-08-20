"use client"

import { useCallback, useEffect, useState } from "react"
import {
  type AttendanceRecord,
  ATTENDANCE_CHANGED_EVENT,
  checkInToday,
  checkOutToday,
  getTodayRecord,
  loadAttendance,
} from "@/lib/attendanceStore"

export function useAttendance() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [hydrated, setHydrated] = useState(false)

  const sync = useCallback(() => {
    setRecords(loadAttendance())
  }, [])

  useEffect(() => {
    sync()
    setHydrated(true)
    window.addEventListener(ATTENDANCE_CHANGED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(ATTENDANCE_CHANGED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [sync])

  const today = getTodayRecord(records)

  return {
    records,
    today,
    hydrated,
    checkIn: (officeName: string, meta?: Parameters<typeof checkInToday>[2]) => {
      const row = checkInToday(officeName, new Date(), meta)
      sync()
      return row
    },
    checkOut: (meta?: Parameters<typeof checkOutToday>[1]) => {
      const row = checkOutToday(new Date(), meta)
      sync()
      return row
    },
  }
}
