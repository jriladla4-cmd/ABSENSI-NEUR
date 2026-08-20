"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  type OfficeLocation,
  DEFAULT_OFFICES,
  OFFICES_CHANGED_EVENT,
  findNearestOffice,
  getActiveOffices,
  getPrimaryOffice,
  loadOffices,
  saveOffices,
} from "@/lib/officeStore"

export function useOffices() {
  const [offices, setOfficesState] = useState<OfficeLocation[]>(DEFAULT_OFFICES)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setOfficesState(loadOffices())
    setHydrated(true)

    const sync = () => setOfficesState(loadOffices())
    window.addEventListener(OFFICES_CHANGED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(OFFICES_CHANGED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const setOffices = useCallback(
    (next: OfficeLocation[] | ((prev: OfficeLocation[]) => OfficeLocation[])) => {
      setOfficesState((prev) => {
        const value = typeof next === "function" ? next(prev) : next
        saveOffices(value)
        return value
      })
    },
    [],
  )

  const activeOffices = useMemo(() => getActiveOffices(offices), [offices])
  const primary = getPrimaryOffice(offices)

  const nearestTo = useCallback(
    (lat: number, lng: number) => findNearestOffice(lat, lng, offices),
    [offices],
  )

  return { offices, setOffices, activeOffices, primary, nearestTo, hydrated }
}
