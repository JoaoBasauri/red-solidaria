import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { defaultSiteUrl, headMarkup } from '../utils/seo.mjs'

export default function Seo() {
  const { pathname } = useLocation()
  useEffect(() => {
    document.head.querySelectorAll('[data-seo], title').forEach((node) => node.remove())
    const template = document.createElement('template')
    template.innerHTML = headMarkup(pathname, import.meta.env.VITE_SEO_SITE_URL || defaultSiteUrl)
    document.head.append(template.content)
  }, [pathname])
  return null
}
