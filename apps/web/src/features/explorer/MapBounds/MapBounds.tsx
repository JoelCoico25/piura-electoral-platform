import { useLayoutEffect, useRef } from 'react'
import { geoJSON } from 'leaflet'
import { useMap } from 'react-leaflet'
import type { ProvinceGeometry } from '../provinceGeometry'
import { cameraDurationMs, layerDurationMs, territoryPane, contextPane, shouldAnimateTransition } from '../mapTransition'

type Props = {
  geometry: ProvinceGeometry | null
  focusGeometry: ProvinceGeometry | null
  cameraKey: string
  layerKey: string
  layersReady: boolean
}

const MapBounds = ({ geometry, focusGeometry, cameraKey, layerKey, layersReady }: Props) => {
  const map = useMap()
  const previousCamera = useRef<string | null>(null)
  const previousLayer = useRef<string | null>(null)
  const cameraMoving = useRef(false)

  useLayoutEffect(() => {
    if (!geometry?.features.length || previousCamera.current === cameraKey) return
    const previous = previousCamera.current
    const focus = previous !== null && focusGeometry?.features.length ? focusGeometry : null
    const bounds = geoJSON(focus ?? geometry).getBounds()
    if (!bounds.isValid()) return
    previousCamera.current = cameraKey
    map.stop()
    cameraMoving.current = false
    // Un distrito ya visible no necesita otro acercamiento.
    if (focus && map.getBounds().contains(bounds)) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const options = { padding: [24, 24] as [number, number], ...(focus ? { maxZoom: Math.min(10, map.getZoom() + 1) } : {}) }
    const settle = () => { cameraMoving.current = false }
    const reduce = () => {
      if (!media.matches) return
      map.stop()
      map.fitBounds(bounds, { ...options, animate: false })
    }
    if (shouldAnimateTransition(previous, cameraKey, media.matches)) {
      cameraMoving.current = true
      map.once('moveend', settle)
      map.flyToBounds(bounds, { ...options, duration: cameraDurationMs / 1000 })
    } else map.fitBounds(bounds, { ...options, animate: false })
    media.addEventListener('change', reduce)
    return () => {
      media.removeEventListener('change', reduce)
      map.off('moveend', settle)
      cameraMoving.current = false
      map.stop()
    }
  }, [map, geometry, focusGeometry, cameraKey])

  useLayoutEffect(() => {
    const pane = map.getPane(territoryPane)
    const context = map.getPane(contextPane)
    if (!pane || !context) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const animations: Animation[] = []
    context.setAttribute('aria-hidden', 'true')
    context.style.pointerEvents = 'none'
    const reveal = () => {
      const animate = shouldAnimateTransition(previousLayer.current, layerKey, media.matches)
      previousLayer.current = layerKey
      pane.style.opacity = '1'
      pane.style.pointerEvents = ''
      context.style.opacity = '0'
      if (animate) {
        animations.push(pane.animate([{ opacity: 0 }, { opacity: 1 }], { duration: layerDurationMs, easing: 'ease-out' }))
        animations.push(context.animate([{ opacity: 1 }, { opacity: 0 }], { duration: layerDurationMs, easing: 'ease-out' }))
      }
    }
    const reduce = () => {
      if (!media.matches) return
      animations.forEach(animation => animation.cancel())
      if (layersReady) reveal()
    }
    if (previousLayer.current === layerKey && layersReady) reveal()
    else {
      pane.style.opacity = '0'
      pane.style.pointerEvents = 'none'
      context.style.opacity = '1'
      if (layersReady) {
        if (cameraMoving.current) map.once('moveend', reveal)
        else reveal()
      }
    }
    media.addEventListener('change', reduce)
    return () => {
      map.off('moveend', reveal)
      media.removeEventListener('change', reduce)
      animations.forEach(animation => animation.cancel())
    }
  }, [map, layerKey, layersReady])
  return null
}

export default MapBounds
