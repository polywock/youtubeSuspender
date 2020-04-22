
import 'regenerator-runtime/runtime'
import debounce from "lodash.debounce"
import { getConfigOrDefault, injectScript } from './utils'
import { Config } from './types'

declare global {
  interface Window {
    config: Config,
    initialQuality: string,
    lastSet: number
  }
}


main()

function main() {
  injectScript(chrome.runtime.getURL("ctx.js"))
  document.addEventListener("DOMContentLoaded", handleDOMLoaded)
}


async function handleDOMLoaded() {
  window.config = await getConfigOrDefault()

  chrome.storage.onChanged.addListener(changes => {
    const newConfig = changes.config.newValue
    if (!newConfig) return 
    window.config = newConfig
  })

  document.addEventListener('visibilitychange', debounce(e => {
    const video = document.querySelector(".html5-main-video") as HTMLVideoElement
    
    if (document.hidden) {
      if (!video) return 
      window.postMessage({type: "YS_BLOCK_QUALITY_CHANGE"}, "*")
      timeout(100).then(() => {
        !video.paused && window.config.enabled && activateLowQuality()
        video.addEventListener("loadedmetadata", handleSourceChange)
        video.addEventListener("play", handleSourceChange)
      })
    } else {
      video?.removeEventListener("loadedmetadata", handleSourceChange)
      video?.removeEventListener("play", handleSourceChange)
      window.initialQuality && revertQuality()
      
      timeout(300).then(() => {
        window.postMessage({type: "YS_UNBLOCK_QUALITY_CHANGE"}, "*")
      })
    }
  }, 500, {leading: false, trailing: true}))
}

async function handleSourceChange(e: Event) {
  const video = e.target as HTMLVideoElement
  
  if (new Date().getTime() - window.lastSet > 3000) {
    !video.paused && window.config.enabled && activateLowQuality()
  }
}

async function ensureSettingsMenuOpen() {
  let someMenuItem: HTMLDivElement = document.querySelector(".ytp-settings-menu .ytp-menuitem")

  const button = document.querySelector(".ytp-settings-button") as HTMLButtonElement
  if (!button) {
    throw Error("There is no youtube settings button.")
  }
  if (someMenuItem) {
    button.click()
    timeout(50)
  }
  button.click()

  for (let i = 0; i < 5; i++) {
    await timeout(100)
    someMenuItem = document.querySelector(".ytp-settings-menu .ytp-menuitem")
    if (someMenuItem) break 
  }

  if (!someMenuItem) {
    throw Error("Settings panel did not show up.")
  }

  // ensure hidden
  const settingsMenu = document.querySelector(".ytp-settings-menu") as HTMLDivElement
  settingsMenu.style.display = "hidden"
  
  return settingsMenu
}

async function ensureQualityMenuOpen(settingsMenu: HTMLDivElement) {
  // is quality menu already open 
  if (settingsMenu.querySelector(".ytp-menuitem[role='menuitemradio']")) return 

  const menuItems = [...settingsMenu.querySelectorAll(".ytp-menuitem[role='menuitem'][aria-haspopup]")] as HTMLDivElement[]
  const qualityMenuitem = menuItems.reverse().find(item => /\d+p|s/i.test(item.textContent))


  if (!qualityMenuitem) {
    throw Error("Could not find quality menu item.")
  }


  // keep for reference. 
  const autoQuality = qualityMenuitem.querySelector(".ytp-menuitem-content span.ytp-menu-label-secondary")?.textContent.trim().toLowerCase()
  qualityMenuitem.click()


  for (let i = 0; i < 5; i++) {
    await timeout(50)
    if (settingsMenu.querySelector(".ytp-menuitem[role='menuitemradio']")) {
      break 
    }
  }

  if (!settingsMenu.querySelector(".ytp-menuitem[role='menuitemradio']")) {
    throw Error("Quality menu not open.")
  }

  return autoQuality
}

async function getQualityOptions(): Promise<QualityOption[]> {
  let settingsMenu = await ensureSettingsMenuOpen()
  const autoQuality = await ensureQualityMenuOpen(settingsMenu)
  const menuItems = [...settingsMenu.querySelectorAll(".ytp-menuitem[role='menuitemradio']")].filter(v => v.children.length === 1) as HTMLDivElement[]
  const options = menuItems.map(elem => ({
    elem,
    selected: ((elem as any).ariaChecked as boolean),
    quality: elem.textContent.trim().toLowerCase()
  }))
  options[options.length - 1].quality = autoQuality
  return options 
}

type QualityOption = {
  elem: HTMLDivElement,
  quality: string,
  selected: boolean
}


async function activateLowQuality() {
  // speechSynthesis.speak(new SpeechSynthesisUtterance("ENTERING"))
  let options = await getQualityOptions()
  
  let selectedOpt = options.find(opt => opt.selected)


  const lowest = options[options.length - 2] 
  if (lowest && !lowest.selected) {
    window.initialQuality = selectedOpt.quality
    window.lastSet = new Date().getTime()
    lowest.elem.click()
  }
}

async function revertQuality() {
  // speechSynthesis.speak(new SpeechSynthesisUtterance("REVERTING"))
  let options = await getQualityOptions()

  let initialOpt = options.find(opt => opt.quality === window.initialQuality)
  const target = initialOpt || options[0]
  
  target.elem.click()
  window.initialQuality = undefined
}

function timeout(wait: number) {
  return new Promise((res, rej) => {
    setTimeout(() => res(), wait)
  })
}
