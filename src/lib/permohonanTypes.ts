export type PermohonanCategory = 'inbox' | 'telat' | 'cuti' | 'sakit' | 'izin' | 'wfh' | 'dinas'

export const PERMOHONAN_SUBMENU = [
  { id: 'permohonan/inbox', label: 'Inbox / Semua', category: 'inbox' as const },
  { id: 'permohonan/telat', label: 'Izin Telat', category: 'telat' as const },
  { id: 'permohonan/cuti', label: 'Cuti', category: 'cuti' as const },
  { id: 'permohonan/sakit', label: 'Izin Sakit', category: 'sakit' as const },
  { id: 'permohonan/izin', label: 'Izin', category: 'izin' as const },
  { id: 'permohonan/wfh', label: 'WFH', category: 'wfh' as const },
  { id: 'permohonan/dinas', label: 'Dinas', category: 'dinas' as const },
] as const

export const PERMOHONAN_PAGE_LABELS: Record<string, string> = {
  'permohonan/inbox': 'Permohonan — Inbox',
  'permohonan/telat': 'Permohonan — Izin Telat',
  'permohonan/cuti': 'Permohonan — Cuti',
  'permohonan/sakit': 'Permohonan — Izin Sakit',
  'permohonan/izin': 'Permohonan — Izin',
  'permohonan/wfh': 'Permohonan — WFH',
  'permohonan/dinas': 'Permohonan — Dinas',
}

export function categoryFromNav(nav: string): PermohonanCategory {
  const slug = nav.split('/')[1]
  if (!slug || slug === 'inbox') return 'inbox'
  if (slug === 'telat') return 'telat'
  if (slug === 'cuti') return 'cuti'
  if (slug === 'sakit') return 'sakit'
  if (slug === 'izin') return 'izin'
  if (slug === 'wfh') return 'wfh'
  if (slug === 'dinas') return 'dinas'
  return 'inbox'
}

export function categoryLabel(category: PermohonanCategory): string {
  const item = PERMOHONAN_SUBMENU.find((s) => s.category === category)
  return item?.label ?? 'Permohonan'
}

export function matchesEmpRequestType(type: string, category: PermohonanCategory): boolean {
  if (category === 'inbox') return true
  const map: Record<Exclude<PermohonanCategory, 'inbox'>, string[]> = {
    telat: ['Izin Telat'],
    cuti: ['Cuti', 'Cuti Tahunan'],
    sakit: ['Izin Sakit'],
    izin: ['Izin'],
    wfh: ['WFH'],
    dinas: ['Dinas'],
  }
  return map[category].some((t) => type === t || type.includes(t))
}

export function matchesHrRequestType(type: string, category: PermohonanCategory): boolean {
  if (category === 'inbox') return true
  const map: Record<Exclude<PermohonanCategory, 'inbox'>, string[]> = {
    telat: ['Telat'],
    cuti: ['Cuti'],
    sakit: ['Sakit'],
    izin: ['Izin'],
    wfh: ['WFH'],
    dinas: ['Dinas'],
  }
  return map[category].includes(type)
}

export type EmpRequestType = 'Cuti' | 'Izin Sakit' | 'WFH' | 'Izin' | 'Dinas' | 'Izin Telat'

export function categoryToEmpType(category: PermohonanCategory): EmpRequestType | null {
  const map: Partial<Record<PermohonanCategory, EmpRequestType>> = {
    telat: 'Izin Telat',
    cuti: 'Cuti',
    sakit: 'Izin Sakit',
    izin: 'Izin',
    wfh: 'WFH',
    dinas: 'Dinas',
  }
  return map[category] ?? null
}
