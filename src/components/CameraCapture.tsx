'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'
import type { MapSite } from '@/components/GeoMap'

const GeoMap = dynamic(() => import('@/components/GeoMap'), { ssr: false })

function compressDataUrl(dataUrl: string, maxW = 480, quality = 0.55): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxW / img.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

function compressVideoFrame(video: HTMLVideoElement): string {
  const maxW = 480
  const vw = video.videoWidth || 640
  const vh = video.videoHeight || 480
  const scale = Math.min(1, maxW / vw)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(vw * scale)
  canvas.height = Math.round(vh * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.55)
}

export type CameraCaptureHandle = {
  show: (title: string) => void
  useStream: (stream: MediaStream) => void
  fail: (message: string) => void
  pickFile: () => void
  close: () => void
}

export type CameraLocationInfo = {
  officeName: string
  officeAddress: string
  officeLat: number
  officeLng: number
  radiusM: number
  sites: MapSite[]
  userLat: number | null
  userLng: number | null
  insideGeofence: boolean
  gpsLabel: string
}

const CameraCapture = forwardRef<CameraCaptureHandle, {
  onCapture: (dataUrl: string) => void
  location?: CameraLocationInfo
}>(function CameraCapture({ onCapture, location }, ref) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('Absensi')
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    const video = videoRef.current
    if (video) video.srcObject = null
  }, [])

  const close = useCallback(() => {
    stopStream()
    setReady(false)
    setError(null)
    setBusy(false)
    setPreview(null)
    setOpen(false)
  }, [stopStream])

  const useStream = useCallback((stream: MediaStream) => {
    stopStream()
    streamRef.current = stream
    const video = videoRef.current
    if (!video) return
    video.srcObject = stream
    video.muted = true
    video.setAttribute('playsinline', 'true')
    void video.play().then(() => setReady(true)).catch(() => setReady(true))
    setError(null)
    setPreview(null)
  }, [stopStream])

  const restartCamera = useCallback(async () => {
    setPreview(null)
    setReady(false)
    setError(null)
    setBusy(false)
    stopStream()
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Browser tidak mendukung kamera.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      useStream(stream)
    } catch {
      setError('Tidak bisa membuka kamera lagi. Izinkan kamera di browser.')
    }
  }, [stopStream, useStream])

  useImperativeHandle(ref, () => ({
    show: (nextTitle: string) => {
      setTitle(nextTitle)
      setOpen(true)
      setReady(false)
      setError(null)
      setPreview(null)
    },
    useStream,
    fail: (message: string) => {
      setOpen(true)
      setReady(false)
      setError(message)
      setPreview(null)
    },
    pickFile: () => {
      const input = fileRef.current
      if (!input) return
      input.value = ''
      input.click()
    },
    close,
  }), [close, useStream])

  const onFile = (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    const reader = new FileReader()
    reader.onload = async () => {
      const compact = await compressDataUrl(String(reader.result || ''))
      stopStream()
      setBusy(false)
      setReady(false)
      setPreview(compact)
    }
    reader.onerror = () => {
      setBusy(false)
      setError('Gagal membaca foto. Coba lagi.')
    }
    reader.readAsDataURL(file)
  }

  const snap = () => {
    const video = videoRef.current
    if (!video || !ready || busy) return
    setBusy(true)
    const dataUrl = compressVideoFrame(video)
    stopStream()
    setReady(false)
    if (dataUrl) {
      setPreview(dataUrl)
      setBusy(false)
    } else {
      setError('Gagal mengambil foto. Coba lagi.')
      setBusy(false)
    }
  }

  const confirmPhoto = () => {
    if (!preview || busy) return
    setBusy(true)
    const photo = preview
    setPreview(null)
    setOpen(false)
    setBusy(false)
    onCapture(photo)
  }

  const inPreview = Boolean(preview)

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="modal-backdrop modal-backdrop--camera"
      style={{
        visibility: open ? 'visible' : 'hidden',
        pointerEvents: open ? 'auto' : 'none',
        opacity: open ? 1 : 0,
        transition: 'opacity 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="modal-panel"
        style={{
          width: 'min(100%, 720px)',
          height: 'min(100%, 960px)',
          maxHeight: '100%',
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: 17, color: 'var(--foreground)' }}>{title}</div>
              <div style={{ fontSize: 12, color: 'var(--muted-foreground)', marginTop: 2 }}>
                {inPreview
                  ? 'Cek foto & lokasi sebelum konfirmasi'
                  : ready
                    ? 'Siap ambil foto'
                    : 'Izinkan kamera di popup browser'}
              </div>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Tutup"
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--muted)',
                cursor: 'pointer',
                color: 'var(--muted-foreground)',
                fontSize: 16,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                position: 'relative',
                flex: inPreview ? '0 0 auto' : '1 1 auto',
                minHeight: inPreview ? 220 : 'min(48vh, 420px)',
                height: inPreview ? 'min(42vh, 360px)' : undefined,
                background: '#0f172a',
                overflow: 'hidden',
              }}
            >
              {inPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview!}
                  alt="Preview absensi"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
                />
              ) : (
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  autoPlay
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: 'scaleX(-1)',
                    background: '#0f172a',
                  }}
                />
              )}

              {!ready && !inPreview && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 14,
                    padding: 24,
                    textAlign: 'center',
                    background: 'rgba(15,23,42,0.82)',
                  }}
                >
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 15, color: '#f1f5f9' }}>
                    {error ? 'Kamera belum aktif' : 'Menunggu izin kamera…'}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, maxWidth: 280 }}>
                    {error ?? 'Klik Izinkan di popup browser agar preview kamera muncul.'}
                  </div>
                </div>
              )}
            </div>

            {inPreview && location && (
              <div style={{ borderTop: '1px solid var(--border)' }}>
                <div style={{ padding: '10px 14px 8px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: location.insideGeofence ? '#10b981' : '#ef4444',
                      boxShadow: location.insideGeofence ? '0 0 0 3px rgba(16,185,129,0.25)' : undefined,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13 }}>{location.officeName}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted-foreground)', marginTop: 2 }}>{location.gpsLabel}</div>
                  </div>
                </div>
                <GeoMap
                  height={160}
                  userLat={location.userLat}
                  userLng={location.userLng}
                  showOffice
                  showGeofence
                  sites={location.sites}
                  officeLat={location.officeLat}
                  officeLng={location.officeLng}
                  officeName={location.officeName}
                  radiusM={location.radiusM}
                  focusLat={location.userLat ?? location.officeLat}
                  focusLng={location.userLng ?? location.officeLng}
                  zoom={16}
                />
                <div style={{ padding: '8px 14px 4px', fontSize: 11, color: 'var(--muted-foreground)', lineHeight: 1.4 }}>
                  {location.officeAddress}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '14px 16px 16px', flexShrink: 0, background: 'var(--card)', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
            {inPreview ? (
              <>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => void restartCamera()}
                  disabled={busy}
                  style={{ flex: 1, minHeight: 48, fontSize: 15 }}
                >
                  Ulangi
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={confirmPhoto}
                  disabled={busy || (location != null && !location.insideGeofence)}
                  style={{
                    flex: 1.4,
                    minHeight: 48,
                    fontSize: 15,
                    opacity: location != null && !location.insideGeofence ? 0.45 : 1,
                    cursor: location != null && !location.insideGeofence ? 'not-allowed' : 'pointer',
                  }}
                >
                  {busy ? 'Menyimpan…' : 'Pakai'}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={snap}
                disabled={!ready || busy}
                style={{
                  width: '100%',
                  minHeight: 48,
                  fontSize: 15,
                  opacity: ready && !busy ? 1 : 0.45,
                  cursor: ready && !busy ? 'pointer' : 'not-allowed',
                }}
              >
                Ambil foto
              </button>
            )}
          </div>
          {inPreview && location && !location.insideGeofence && (
            <div style={{ padding: '0 16px 14px', fontSize: 12, color: '#dc2626', fontFamily: 'Outfit' }}>
              Di luar radius kantor — tidak bisa konfirmasi absen.
            </div>
          )}
        </div>
      </div>
  )

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        style={{ position: 'fixed', left: -9999, width: 1, height: 1, opacity: 0 }}
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {mounted ? createPortal(dialog, document.body) : null}
    </>
  )
})

export default CameraCapture
