/** Minimal Leaflet typings used by GeoMap (vendored from /public/leaflet). */
export type LatLngTuple = [number, number]

export interface LeafletMap {
  setView(center: LatLngTuple, zoom: number): LeafletMap
  panTo(latlng: LatLngTuple, opts?: { animate?: boolean }): LeafletMap
  invalidateSize(options?: boolean | { animate?: boolean }): LeafletMap
  remove(): void
  removeLayer(layer: LeafletLayer): LeafletMap
}

export interface LeafletLayer {
  remove(): this
  addTo(map: LeafletMap): this
}

export interface LeafletMarker extends LeafletLayer {
  setLatLng(latlng: LatLngTuple): this
  setIcon(icon: LeafletIcon): this
}

export interface LeafletCircle extends LeafletLayer {
  setLatLng(latlng: LatLngTuple): this
  setRadius(radius: number): this
}

export interface LeafletIcon {
  options: Record<string, unknown>
}

export interface LeafletStatic {
  map(
    el: HTMLElement,
    options?: { zoomControl?: boolean; attributionControl?: boolean },
  ): LeafletMap
  tileLayer(
    url: string,
    options?: { maxZoom?: number; attribution?: string },
  ): LeafletLayer
  marker(
    latlng: LatLngTuple,
    options?: { icon?: LeafletIcon; zIndexOffset?: number },
  ): LeafletMarker
  circle(
    latlng: LatLngTuple,
    options: {
      radius: number
      color?: string
      weight?: number
      dashArray?: string
      fillColor?: string
      fillOpacity?: number
    },
  ): LeafletCircle
  divIcon(options: {
    className?: string
    html?: string
    iconSize?: [number, number]
    iconAnchor?: [number, number]
  }): LeafletIcon
}

declare global {
  interface Window {
    L?: LeafletStatic
  }
}

export {}
