'use client'

import { useId } from 'react'

export default function BrandMark({ size = 40 }: { size?: number }) {
  const uid = useId()
  const blueId = `hm-blue-${uid}`
  const fireId = `hm-fire-${uid}`

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden focusable="false">
      <defs>
        <linearGradient id={blueId} x1="18" y1="8" x2="102" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#60d0fb" />
          <stop offset="0.55" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
        <linearGradient id={fireId} x1="26" y1="98" x2="112" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#dc2626" />
          <stop offset="0.55" stopColor="#f97316" />
          <stop offset="1" stopColor="#fdba74" />
        </linearGradient>
      </defs>

      {/* Orbit swoosh */}
      <path d="M92 32 A45 45 0 1 1 87 97" fill="none" stroke={`url(#${blueId})`} strokeWidth="12" strokeLinecap="round" />

      {/* Person */}
      <circle cx="57" cy="44" r="16" fill={`url(#${blueId})`} />
      <path d="M29 96 C29 74 41 61 57 61 C73 61 85 74 85 96 Z" fill={`url(#${blueId})`} />

      {/* Checkmark with flared tip */}
      <path d="M26 64 L53 92 L101 28" fill="none" stroke={`url(#${fireId})`} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M101 28 L116 10 L102 43 Z" fill={`url(#${fireId})`} />
    </svg>
  )
}
