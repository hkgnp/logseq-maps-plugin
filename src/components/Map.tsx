import '@logseq/libs'
import '../../leaflet/leaflet.css'

import { LatLngTuple, Marker as LeafletMarker } from 'leaflet'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvent,
} from 'react-leaflet'

import {
  getLocationsFromPage,
  LocationProps,
} from '../utils/get-locations-from-page'

const SetViewOnClick = () => {
  const map = useMapEvent('click', (e) => {
    map.setView(e.latlng, map.getZoom(), {
      animate: true,
    })
  })
  return null
}

const FitBounds = ({ locations }: { locations: LocationProps[] }) => {
  const map = useMap()
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map((location) => location.coords)
      map.fitBounds(bounds)
    }
  }, [map, locations])
  return null
}

const Map = ({
  centrePosition,
  uuid,
  locationsFromPage,
}: {
  centrePosition: LatLngTuple
  uuid: string
  locationsFromPage: LocationProps[]
}) => {
  const [ready, setReady] = useState(false)
  const [locations, setLocations] = useState<LocationProps[]>(locationsFromPage)
  const markersRef = useRef<(LeafletMarker | null)[]>([])

  const host = logseq.Experiments.ensureHostScope()

  const refreshMap = useCallback(async () => {
    const locationsFromPage = await getLocationsFromPage(uuid)
    if (!locationsFromPage) return
    setLocations(locationsFromPage)
  }, [uuid])

  const handlePopups = useCallback(() => {
    if (markersRef.current) {
      markersRef.current.forEach((marker) => {
        marker?.togglePopup()
      })
    }
  }, [locations])

  useEffect(() => {
    if (host.L) {
      return setReady(true)
    }
    let timer: any
    const loadLeaflet = async () => {
      await logseq.Experiments.loadScripts('./leaflet/leaflet.js')
      timer = setTimeout(async () => {
        setReady(true)
      }, 50)
    }
    loadLeaflet()
    return () => {
      timer && clearTimeout(timer)
    }
  }, [])

  const svgIcon = (color: string) => {
    console.log(color)
    return host.L.divIcon({
      html: `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="${color}" class="icon icon-tabler icons-tabler-filled icon-tabler-map-pin">
  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
  <path d="M18.364 4.636a9 9 0 0 1 .203 12.519l-.203 .21l-4.243 4.242a3 3 0 0 1 -4.097 .135l-.144 -.135l-4.244 -4.243a9 9 0 0 1 12.728 -12.728zm-6.364 3.364a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" />
</svg>
  `,
      className: 'marker-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    })
  }

  if (!ready) {
    return <strong>Loading Leaflet...</strong>
  }

  return (
    <>
      <MapContainer
        center={centrePosition}
        zoom={logseq.settings?.defaultZoom}
        scrollWheelZoom={false}
        dragging={true}
        tap={true}
        style={{ height: '400px', width: '83vh', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => (
          <Marker
            key={location.id}
            position={location.coords}
            ref={(el) => (markersRef.current[index] = el)}
            icon={svgIcon(location['marker-color'])}
          >
            <Popup autoClose={false}>{location.description}</Popup>
          </Marker>
        ))}
        <SetViewOnClick />
        <FitBounds locations={locations} />
      </MapContainer>
      <div className="map-control">
        <button className="map-btn" onClick={handlePopups}>
          <i className="ti ti-letter-case"></i>
        </button>
        <button className="map-btn" onClick={refreshMap}>
          <i className="ti ti-refresh"></i>
        </button>
      </div>
    </>
  )
}

export default Map
