import { useEffect, useRef, useState } from 'react'

let leafletPromise

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L)
  if (leafletPromise) return leafletPromise
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement('link')
    css.rel = 'stylesheet'
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(css)
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
    script.crossOrigin = ''
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error('No se pudo cargar el mapa.'))
    document.head.appendChild(script)
  })
  return leafletPromise
}

function OpenStreetMapLocationPicker({ value, onChange }) {
  const container = useRef(null)
  const onChangeRef = useRef(onChange)
  const initialValue = useRef(value)
  const [error, setError] = useState('')
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  useEffect(() => {
    let active = true, reverseTimer
    loadLeaflet().then((L) => {
      if (!active || !container.current) return
      const initial = initialValue.current.latitude
        ? [Number(initialValue.current.latitude), Number(initialValue.current.longitude)]
        : [-12.0464, -77.0428]
      const map = L.map(container.current).setView(initial, initialValue.current.latitude ? 17 : 6)
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)
      const marker = L.marker(initial, { draggable: true }).addTo(map)

      function select(latlng) {
        marker.setLatLng(latlng)
        map.panTo(latlng)
        const coordinates = { latitude: latlng.lat.toFixed(6), longitude: latlng.lng.toFixed(6) }
        onChangeRef.current({ ...coordinates, address: '' })
        clearTimeout(reverseTimer)
        reverseTimer = setTimeout(async () => {
          try {
            const url = new URL('https://nominatim.openstreetmap.org/reverse')
            url.search = new URLSearchParams({ format:'jsonv2', lat:String(latlng.lat), lon:String(latlng.lng), zoom:'18', addressdetails:'1' })
            const response = await fetch(url, { headers: { 'Accept-Language': 'es' } })
            if (!response.ok) return
            const result = await response.json()
            if (active) onChangeRef.current({ ...coordinates, address: result.display_name || '' })
          } catch { /* la seleccion sigue siendo valida con coordenadas */ }
        }, 1000)
      }

      map.on('click', ({ latlng }) => select(latlng))
      marker.on('dragend', () => select(marker.getLatLng()))
    }).catch((cause) => active && setError(cause.message))
    return () => { active = false; clearTimeout(reverseTimer) }
  }, [])

  return <div><div ref={container} className="h-80 w-full rounded-lg border bg-slate-200" aria-label="Selecciona la ubicación en OpenStreetMap" />{error&&<p className="mt-2 text-sm text-red-700">{error}</p>}{value.latitude&&<p className="mt-3 text-sm text-slate-600">Ubicación seleccionada: {value.latitude}, {value.longitude}</p>}</div>
}

export default OpenStreetMapLocationPicker
