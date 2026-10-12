import type { CSSProperties } from 'react'
import { siteConfig } from '../config/site'
import type { Personalizacao } from '../types/comercial'

const validColor = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
export function safeLogo(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null } catch { return null }
}
function luminance(rgb: number[]) {
  return rgb.map(channel => { const v = channel / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4 }).reduce((sum, value, index) => sum + value * [.2126, .7152, .0722][index], 0)
}
function readableTone(color: string, onDark: boolean) {
  const rgb = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16))
  // White CTA text and light highlights on dark surfaces keep at least 4.5:1.
  const suitable = () => onDark ? (luminance(rgb) + .05) / .055 >= 4.5 : 1.05 / (luminance(rgb) + .05) >= 4.5
  for (let i = 0; i < 30 && !suitable(); i++) for (let channel = 0; channel < 3; channel++) rgb[channel] = onDark ? Math.min(255, rgb[channel] + 10) : Math.max(0, rgb[channel] - 10)
  return `#${rgb.map(value => value.toString(16).padStart(2, '0')).join('')}`
}
export function resolvePersonalizacao(value?: Partial<Personalizacao> | null) {
  const nome = value?.nomeExibicao?.trim()
  const custom = validColor(value?.corPrimaria) ? value.corPrimaria : null
  const primary = custom ? readableTone(custom, false) : siteConfig.theme.primary
  return {
    nome: nome || siteConfig.brand.name,
    nomeCompleto: nome || siteConfig.brand.fullName,
    logo: safeLogo(value?.logoUrl) || siteConfig.brand.logo,
    mensagem: value?.mensagemHero?.trim() || siteConfig.home.hero.description,
    tema: {
      '--accent-primary': primary,
      '--accent-hover': custom ? readableTone(primary, false) : siteConfig.theme.primaryDark,
      '--accent-display': custom ? readableTone(custom, true) : siteConfig.theme.display,
    } as CSSProperties,
  }
}
