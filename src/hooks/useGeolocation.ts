"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { distanceMeters } from "@/lib/geo"
import { getPrimaryOffice } from "@/lib/officeStore"

export type GeoStatus =
  | "idle"
  | "locating"
  | "ready"
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported"

export type GeoState = {
  status: GeoStatus
  lat: number | null
  lng: number | null
  accuracy: number | null
  distanceM: number | null
  insideGeofence: boolean
  errorMessage: string | null
  refresh: () => void
}

type Options = {
  /** Watch position while mounted (default true). */
  watch?: boolean
  radiusM?: number
  officeLat?: number
  officeLng?: number
}

export function useGeolocation(options: Options = {}): GeoState {
  const primary = getPrimaryOffice()
  const {
    watch = true,
    radiusM = primary.radiusM,
    officeLat = primary.lat,
    officeLng = primary.lng,
  } = options

  const [status, setStatus] = useState<GeoStatus>("idle")
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const watchIdRef = useRef<number | null>(null)

  const applyPosition = useCallback((pos: GeolocationPosition) => {
    setLat(pos.coords.latitude)
    setLng(pos.coords.longitude)
    setAccuracy(pos.coords.accuracy)
    setStatus("ready")
    setErrorMessage(null)
  }, [])

  const applyError = useCallback((err: GeolocationPositionError) => {
    if (err.code === err.PERMISSION_DENIED) {
      setStatus("denied")
      setErrorMessage("Izin lokasi ditolak. Aktifkan GPS di browser untuk absensi.")
    } else if (err.code === err.TIMEOUT) {
      setStatus("timeout")
      setErrorMessage("Timeout mencari lokasi. Coba lagi.")
    } else {
      setStatus("unavailable")
      setErrorMessage("Lokasi tidak tersedia saat ini.")
    }
  }, [])

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported")
      setErrorMessage("Browser ini tidak mendukung geolocation.")
      return
    }

    setStatus("locating")
    const opts: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    }

    navigator.geolocation.getCurrentPosition(applyPosition, applyError, opts)

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        applyPosition,
        applyError,
        opts,
      )
    }

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [watch, tick, applyPosition, applyError])

  const distanceM =
    lat != null && lng != null
      ? distanceMeters(lat, lng, officeLat, officeLng)
      : null
  const insideGeofence = distanceM != null ? distanceM <= radiusM : false

  return {
    status,
    lat,
    lng,
    accuracy,
    distanceM,
    insideGeofence,
    errorMessage,
    refresh: () => setTick((t) => t + 1),
  }
}
