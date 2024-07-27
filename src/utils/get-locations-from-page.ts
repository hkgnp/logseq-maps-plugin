import { LatLngTuple } from 'leaflet'

export interface LocationProps {
  id: string
  description: string
  coords: LatLngTuple
  waypoint: string
  'marker-color': string
}

export const getLocationsFromPage = async (
  uuid: string,
): Promise<LocationProps[]> => {
  const block = await logseq.Editor.getBlock(uuid)
  if (!block) return []
  const page = await logseq.Editor.getPage(block.page.id)
  if (!page) return []
  const pbt = await logseq.Editor.getPageBlocksTree(page.name)
  return pbt
    .filter((block) => block.properties?.coords)
    .map((block) => {
      const description = block.content.substring(
        0,
        block.content.indexOf('\ncoords::'),
      )
      const coords = block.properties?.coords
        .split(',')
        .map((coord: string) => parseFloat(coord))
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
