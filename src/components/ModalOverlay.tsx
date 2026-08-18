'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalOverlayProps = {
  children: ReactNode
  onClose: () => void
  padding?: number | string
  align?: 'center' | 'drawer'
  zIndex?: number
  className?: string
}

export default function ModalOverlay({
  children,
  onClose,
  padding = 20,
  align = 'center',
  zIndex = 1000,
  className = '',
}: ModalOverlayProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const backdropStyle: CSSProperties = {
    padding,
    zIndex,
    ...(align === 'drawer'
      ? { alignItems: 'stretch', justifyContent: 'flex-end', padding: 0 }
      : {}),
  }

  const backdropClass =
    align === 'drawer'
      ? `modal-backdrop modal-backdrop--drawer${className ? ` ${className}` : ''}`
      : `modal-backdrop${className ? ` ${className}` : ''}`

  return createPortal(
    <div className={backdropClass} style={backdropStyle} onClick={onClose}>
      {children}
    </div>,
    document.body,
  )
}
