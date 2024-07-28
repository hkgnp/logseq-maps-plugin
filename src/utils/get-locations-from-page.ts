export interface LocationProps {
  id: string
  description: string
  coords: number[]
  waypoint: string
  'marker-color': string
}

const handleCoords = (str: string): number[] => {
  if (str.startsWith('https://www.google.com/maps')) {
    const lat = str.split('@')[1]!.split(',')[0]
    const lng = str.split('@')[1]!.split(',')[1]!.split(',')[0]
    if (!lat || !lng) return [0, 0]
    return [parseFloat(lat), parseFloat(lng)]
  } else {
    const strArr = str.split(',')
    if (strArr.length !== 2) return [0, 0]
    return strArr.map((coord: string) => parseFloat(coord))
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
  return pbt
    .filter((block) => block.properties?.coords)
    .map((block) => {
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
