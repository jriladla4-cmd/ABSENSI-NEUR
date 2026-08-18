"use client"

import { useEffect, useRef, useState } from "react"
import type {
  LeafletCircle,
  LeafletMap,
  LeafletMarker,
  LeafletStatic,
} from "@/types/leaflet"
import { DEFAULT_OFFICES } from "@/lib/officeStore"

export type MapMarker = {
  id: string
  lat: number
  lng: number
  label?: string
  color?: string
  selected?: boolean
}

export type MapSite = {
  id: string | number
  lat: number
  lng: number
  name: string
  radiusM: number
  highlight?: boolean
}

type GeoMapProps = {
  height?: number | string
  userLat?: number | null
  userLng?: number | null
  showOffice?: boolean
  showGeofence?: boolean
  officeLat?: number
  officeLng?: number
  officeName?: string
  radiusM?: number
  /** Multiple kantor — when set, draws all sites (multi-office). */
  sites?: MapSite[]
  markers?: MapMarker[]
  focusLat?: number
  focusLng?: number
  zoom?: number
  className?: string
}

let leafletPromise: Promise<LeafletStatic> | null = null

function loadLeafletCss(): Promise<void> {
  return new Promise((resolve) => {
    const cssId = "hadir-leaflet-css"
    const existing = document.getElementById(cssId) as HTMLLinkElement | null
    if (existing) {
      if (existing.dataset.loaded === "1") resolve()
      else existing.addEventListener("load", () => resolve(), { once: true })
      // already in DOM from a prior visit
      if (existing.sheet) {
        existing.dataset.loaded = "1"
        resolve()
      }
      return
    }
    const link = document.createElement("link")
    link.id = cssId
    link.rel = "stylesheet"
    link.href = "/leaflet/leaflet.css"
    link.onload = () => {
      link.dataset.loaded = "1"
      resolve()
    }
    link.onerror = () => resolve()
    document.head.appendChild(link)
  })
}

function loadLeaflet(): Promise<LeafletStatic> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet requires browser"))
  }
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise

  leafletPromise = (async () => {
    await loadLeafletCss()
    if (window.L) return window.L

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(
        'script[data-hadir-leaflet="1"]',
      ) as HTMLScriptElement | null
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true })
        existing.addEventListener("error", () => reject(new Error("Failed to fetch Leaflet")), {
          once: true,
        })
        if (window.L) resolve()
        return
      }
      const script = document.createElement("script")
      script.src = "/leaflet/leaflet.js"
      script.async = true
      script.dataset.hadirLeaflet = "1"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to fetch Leaflet"))
      document.body.appendChild(script)
    })

    if (!window.L) throw new Error("Leaflet failed to load")
    return window.L
  })()

  return leafletPromise
}

function makePinIcon(
  L: LeafletStatic,
  color: string,
  label?: string,
  selected?: boolean,
) {
  const size = selected ? 16 : 12
  return L.divIcon({
    className: "hadir-map-pin",
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 8px ${color}88;${selected ? "outline:2px solid #2563eb;outline-offset:2px;" : ""}"></div>
      ${label ? `<div style="font:600 10px Outfit,sans-serif;color:#0f172a;background:#fff;padding:1px 6px;border-radius:4px;border:1px solid rgba(37,99,235,0.12);white-space:nowrap">${label}</div>` : ""}
    </div>`,
    iconSize: [90, 36],
    iconAnchor: [45, 10],
  })
}

export default function GeoMap({
  height = 280,
  userLat = null,
  userLng = null,
  showOffice = true,
  showGeofence = true,
  officeLat = DEFAULT_OFFICES[0].lat,
  officeLng = DEFAULT_OFFICES[0].lng,
  officeName = DEFAULT_OFFICES[0].name,
  radiusM = DEFAULT_OFFICES[0].radiusM,
  sites,
  markers = [],
  focusLat,
  focusLng,
  zoom = 16,
  className,
}: GeoMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const userMarkerRef = useRef<LeafletMarker | null>(null)
  const siteMarkersRef = useRef<LeafletMarker[]>([])
  const siteCirclesRef = useRef<LeafletCircle[]>([])
  const markerLayerRef = useRef<LeafletMarker[]>([])
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resolvedSites: MapSite[] =
    sites && sites.length > 0
      ? sites
      : [{ id: "default", lat: officeLat, lng: officeLng, name: officeName, radiusM }]

  const sitesKey = resolvedSites
    .map((s) => `${s.id}:${s.lat}:${s.lng}:${s.radiusM}:${s.highlight ? 1 : 0}:${s.name}`)
    .join("|")

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    let cancelled = false
    let resizeObserver: ResizeObserver | null = null

    ;(async () => {
      try {
        const L = await loadLeaflet()
        if (cancelled || !containerRef.current || mapRef.current) return

        const centerLat = focusLat ?? userLat ?? resolvedSites[0]?.lat ?? officeLat
        const centerLng = focusLng ?? userLng ?? resolvedSites[0]?.lng ?? officeLng

        const map = L.map(containerRef.current, {
          zoomControl: true,
          attributionControl: true,
        }).setView([centerLat, centerLng], zoom)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        mapRef.current = map
        setReady(true)

        const fixSize = () => map.invalidateSize()
        requestAnimationFrame(fixSize)
        setTimeout(fixSize, 50)
        setTimeout(fixSize, 250)
        setTimeout(fixSize, 600)

        if (typeof ResizeObserver !== "undefined" && containerRef.current) {
          const el = containerRef.current
          resizeObserver = new ResizeObserver(() => fixSize())
          resizeObserver.observe(el)
          if (el.parentElement) resizeObserver.observe(el.parentElement)
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Gagal memuat peta")
      }
    })()

    return () => {
      cancelled = true
      resizeObserver?.disconnect()
      mapRef.current?.remove()
      mapRef.current = null
      userMarkerRef.current = null
      siteMarkersRef.current = []
      siteCirclesRef.current = []
      markerLayerRef.current = []
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Keep map sized when parent height prop / layout changes
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const map = mapRef.current
    const t = window.setTimeout(() => map.invalidateSize(), 30)
    return () => window.clearTimeout(t)
  }, [ready, height])

  useEffect(() => {
    if (!ready || !mapRef.current) return
    let cancelled = false

    ;(async () => {
      const L = await loadLeaflet()
      const map = mapRef.current
      if (cancelled || !map) return

      siteCirclesRef.current.forEach((c) => c.remove())
      siteCirclesRef.current = []
      siteMarkersRef.current.forEach((m) => m.remove())
      siteMarkersRef.current = []

      if (showGeofence) {
        for (const site of resolvedSites) {
          const circle = L.circle([site.lat, site.lng], {
            radius: site.radiusM,
            color: site.highlight ? "#0d9488" : "#2563eb",
            weight: site.highlight ? 3 : 2,
            dashArray: "6 6",
            fillColor: site.highlight ? "#0d9488" : "#2563eb",
            fillOpacity: site.highlight ? 0.12 : 0.08,
          }).addTo(map)
          siteCirclesRef.current.push(circle)
        }
      }

      if (showOffice) {
        for (const site of resolvedSites) {
          const color = site.highlight ? "#0d9488" : "#2563eb"
          const icon = L.divIcon({
            className: "hadir-map-pin",
            html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
              <div style="width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 2px 8px ${color}80"></div>
              <div style="font:700 11px Outfit,sans-serif;color:${color};background:#fff;padding:2px 8px;border-radius:6px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.12)">${site.name}</div>
            </div>`,
            iconSize: [140, 36],
            iconAnchor: [70, 10],
          })
          const marker = L.marker([site.lat, site.lng], {
            icon,
            zIndexOffset: site.highlight ? 250 : 100,
          }).addTo(map)
          siteMarkersRef.current.push(marker)
        }
      }
    })()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, showOffice, showGeofence, sitesKey])

  useEffect(() => {
    if (!ready || !mapRef.current) return
    let cancelled = false

    ;(async () => {
      const L = await loadLeaflet()
      const map = mapRef.current
      if (cancelled || !map) return

      if (userLat == null || userLng == null) {
        userMarkerRef.current?.remove()
        userMarkerRef.current = null
        return
      }

      const icon = makePinIcon(L, "#10b981", "Anda")
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLat, userLng])
        userMarkerRef.current.setIcon(icon)
      } else {
        userMarkerRef.current = L.marker([userLat, userLng], {
          icon,
          zIndexOffset: 400,
        }).addTo(map)
      }
      map.panTo([userLat, userLng], { animate: true })
    })()

    return () => {
      cancelled = true
    }
  }, [ready, userLat, userLng])

  useEffect(() => {
    if (!ready || !mapRef.current) return
    let cancelled = false

    ;(async () => {
      const L = await loadLeaflet()
      const map = mapRef.current
      if (cancelled || !map) return

      markerLayerRef.current.forEach((m) => m.remove())
      markerLayerRef.current = []

      for (const m of markers) {
        const icon = makePinIcon(L, m.color ?? "#10b981", m.label, m.selected)
        const marker = L.marker([m.lat, m.lng], {
          icon,
          zIndexOffset: m.selected ? 500 : 200,
        }).addTo(map)
        markerLayerRef.current.push(marker)
      }

      if (focusLat != null && focusLng != null) {
        map.panTo([focusLat, focusLng], { animate: true })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [ready, markers, focusLat, focusLng])

  return (
    <div
      className={className}
      style={{
        height,
        width: "100%",
        minHeight: typeof height === "number" ? height : undefined,
        overflow: "hidden",
        position: "relative",
        background: "var(--muted)",
      }}
    >
      <div
        ref={containerRef}
        className="hadir-geomap"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      />
      {(!ready || error) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Outfit",
            fontSize: 13,
            color: error ? "var(--danger)" : "var(--muted-foreground)",
            background: "var(--muted)",
            padding: 16,
            textAlign: "center",
            zIndex: 1,
          }}
        >
          {error ?? "Memuat peta…"}
        </div>
      )}
    </div>
  )
}
