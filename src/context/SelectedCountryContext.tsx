import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { companiesData } from '@/data'

type SelectedCountryContextValue = {
  countryCode: string
  setCountryCode: (code: string) => void
}

const SelectedCountryContext = createContext<SelectedCountryContextValue | null>(null)

const DEFAULT_CODE = companiesData.countries.find((c) => c.active)?.code ?? 'cn'

export function SelectedCountryProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<string>(DEFAULT_CODE)

  const value = useMemo<SelectedCountryContextValue>(() => ({ countryCode, setCountryCode }), [countryCode])

  return <SelectedCountryContext.Provider value={value}>{children}</SelectedCountryContext.Provider>
}

export function useSelectedCountry() {
  const ctx = useContext(SelectedCountryContext)
  if (!ctx) throw new Error('useSelectedCountry must be used within SelectedCountryProvider')
  return ctx
}
