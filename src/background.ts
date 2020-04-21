import 'regenerator-runtime/runtime'
import { getConfigOrDefault } from './utils'

let quality: string; 

updateBadges()

chrome.storage.onChanged.addListener(() => {
  updateBadges()
})

chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === "SET_QUALITY") {
    quality = msg.value 
  } else if (msg.type === "GET_QUALITY") {
    reply(quality)
    quality = null
  }
})


export async function updateBadges() {
  const config = await getConfigOrDefault()

  return new Promise(res => {
    chrome.browserAction.setIcon({
      path: config.enabled ? {"128": `icon128.png`} : {"128": `icon128_grayscale.png`}
    }, () => {
      res()
    })
  })
}



