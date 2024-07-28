import '@logseq/libs'

import { createRoot } from 'react-dom/client'

import Map from './components/Map'
import css from './leaflet.css?raw'
import { settings } from './settings'
import { getCentrePosition } from './utils/get-centre-position'
import { getLocationsFromPage } from './utils/get-locations-from-page'

const main = async () => {
  console.log('logseq-osmmaps-plugin loaded')
  logseq.provideStyle(css)

  logseq.Editor.registerSlashCommand('Add map', async (e) => {
    await logseq.Editor.insertAtEditingCursor(
      `{{renderer :map_${e.uuid}, ${logseq.settings?.defaultZoom}, ${logseq.settings?.defaultLocation}}}`,
    )
  })

  logseq.App.onMacroRendererSlotted(async ({ slot, payload }) => {
    const uuid = payload.uuid
    const [type, zoom, var1, var2] = payload.arguments
    if (!type || !type.startsWith(':map') || !zoom || !var1) return

    // If var2 does not exist, search latlng for var1
    // If var1 and var2 exists, take both as the latlng
    const centrePosition = await getCentrePosition(var1, var2)

    const mapId = `map_${uuid}_${slot}`
    logseq.provideUI({
      key: mapId,
      slot,
      reset: true,
      template: `<div id="${mapId}"></div>`,
    })

    const locationsFromPage = await getLocationsFromPage(uuid)

    setTimeout(() => {
      const el = parent.document.getElementById(mapId)
      if (!el || !el.isConnected) return
      const root = createRoot(el)
      root.render(
        <Map
          zoom={parseFloat(zoom)}
          centrePosition={centrePosition}
          uuid={uuid}
          locationsFromPage={locationsFromPage}
        />,
      )
    }, 0)
  })
}

logseq.useSettingsSchema(settings).ready(main).catch(console.error)
