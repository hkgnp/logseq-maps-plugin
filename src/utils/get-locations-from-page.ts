import { LatLngTuple } from 'leaflet'

import { recursivelyGetAllLocations } from './recursive-get-all-locations'

export interface LocationProps {
  id: string
  description: string
  coords: LatLngTuple
  waypoint: string
  'marker-color': string
}

const extractLatLong = (url: string): LatLngTuple => {
  const pattern = /@(-?\d+\.\d+),(-?\d+\.\d+)|!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/
  const match = url.match(pattern)
  if (!match) return [0, 0]
  if (!match[1] && !match[2] && !match[3] && !match[4]) return [0, 0]

  if (match) {
    const lat = parseFloat(match[1]! || match[3]!)
    const lon = parseFloat(match[2]! || match[4]!)

    return [lat, lon]
  }
  return [0, 0]
}

const handleCoords = (str: string): LatLngTuple => {
  if (str.startsWith('https://www.google.com/maps')) {
    return extractLatLong(str)
  } else {
    const strArr = str.split(',')
    if (strArr.length !== 2) return [0, 0]
    return strArr.map((coord: string) => parseFloat(coord)) as LatLngTuple
  }
}

export const getLocationsFromPage = async (
  uuid: string,
): Promise<LocationProps[]> => {
  const block = await logseq.Editor.getBlock(uuid)
  if (!block) return []
  const page = await logseq.Editor.getPage(block.page.id)
  if (!page) return []
  const pbt = await logseq.Editor.getPageBlocksTree(page.name)

  const locationArr = await recursivelyGetAllLocations(pbt)

  // Map location array
  return locationArr.map((block) => {
    const description = block.content.substring(
      0,
      block.content.indexOf('\ncoords::'),
    )
    const coords = handleCoords(block.properties?.coords)
    const waypoint = block.properties?.waypoint
    const markerColor = block.properties?.markerColor
    return {
      id: block.uuid,
      description,
      coords,
      waypoint,
      'marker-color': markerColor,
    }
  })
}
