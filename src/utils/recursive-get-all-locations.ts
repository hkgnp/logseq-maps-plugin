import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'

export const recursivelyGetAllLocations = async (blocks: BlockEntity[]) => {
  let locationArr: BlockEntity[] = []

  const recurse = async (blocks: BlockEntity[]) => {
    for (const block of blocks) {
      if (block.content.startsWith(`{{query `)) {
        const queryRx = /\{\{query (.*?)\}\}/
        const queryString = queryRx.exec(block.content)
        if (!queryString || !queryString[1]) continue
        const result = await logseq.DB.q(queryString[1])
        if (!result) continue
        locationArr = locationArr.concat(result)
      } else if (block.properties?.coords) {
        locationArr.push(block)
      }

      if (block.children) {
        await recurse(block.children as BlockEntity[])
      }
    }
  }

  await recurse(blocks)
  return locationArr
}
