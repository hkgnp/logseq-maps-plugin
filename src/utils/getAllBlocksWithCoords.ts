import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user";

export default async function getAllBlocksWithCoords(uuid: string) {
  const blk = await logseq.Editor.getBlock(uuid);
  let allCoordsBlocksOnPage: any[] = [];

  function recursiveFind(pbt: BlockEntity[]) {
    for (let i = 0; i < pbt.length; i++) {
      if (pbt[i].properties!.coords) {
        allCoordsBlocksOnPage.push({
          uuid: pbt[i].uuid,
          content: pbt[i].content.split("\ncoords")[0],
          coords: pbt[i]
            .properties!.coords.replaceAll("\u00B0", "")
            .replaceAll("N", "")
            .replaceAll("E", "")
            .trim()
            .split(","),
        });
      }
      if (pbt[i].children) {
        recursiveFind(pbt[i].children as BlockEntity[]);
      } else {
        break;
      }
    }
  }

  if (blk) {
    const page = await logseq.Editor.getPage(blk.page.id);
    if (page) {
      const pbt = await logseq.Editor.getPageBlocksTree(page.name);
      recursiveFind(pbt);
    }
  }
  return allCoordsBlocksOnPage;
}
