import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { siteConfig } from './config/site'

document.documentElement.lang = siteConfig.seo.language
document.title = siteConfig.seo.title
document.documentElement.style.setProperty('--accent-primary', siteConfig.theme.primary)
document.documentElement.style.setProperty('--accent-hover', siteConfig.theme.primaryDark)
document.documentElement.style.setProperty('--site-dark', siteConfig.theme.dark)
document.documentElement.style.setProperty('--site-light', siteConfig.theme.light)

const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
description?.setAttribute('content', siteConfig.seo.description)

const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
favicon?.setAttribute('href', siteConfig.brand.favicon)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
