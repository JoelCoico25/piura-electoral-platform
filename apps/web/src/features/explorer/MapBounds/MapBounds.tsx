import { useEffect } from 'react'
import { geoJSON } from 'leaflet'
import { useMap } from 'react-leaflet'
import type { ProvinceGeometry } from '../provinceGeometry'

const MapBounds = ({ geometry }: { geometry: ProvinceGeometry | null }) => {
  const map = useMap()
  useEffect(() => {
    if (!geometry || geometry.features.length === 0) return
    const bounds = geoJSON(geometry).getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], animate: false })
  }, [map, geometry])
  return null
}

export default MapBounds
