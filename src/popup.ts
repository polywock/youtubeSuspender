import { Config } from "./types"
import { getDefaultConfig } from "./utils"




let activateDiv = document.getElementById("activate")
document.getElementById("github").addEventListener("click", e => {
  window.open("https://github.com/polywock/youtubeSuspender", '_blank');
})

let config: Config; 

activateDiv.addEventListener("click", e => {
  config.enabled = !config.enabled
  chrome.storage.local.set({config})
})



chrome.storage.local.get(items => {
  config = items["config"] || getDefaultConfig()
  syncDOM()
  syncIcon()
})

chrome.storage.onChanged.addListener(changes => {
  const newConfig = changes["config"].newValue as Config
  if (!newConfig) return 
  config = newConfig
  syncDOM()
  syncIcon()
})

function syncDOM() {
  activateDiv.style.color = config.enabled ? "#d00" : "#888"
}

function syncIcon() {
  chrome.browserAction.setIcon({
    path: config.enabled ?  {"128": `icon128.png`} : {"128": `icon128_grayscale.png`}
  })
}