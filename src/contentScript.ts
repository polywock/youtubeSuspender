
import 'regenerator-runtime/runtime'
import debounce from "lodash.debounce"
import { getConfigOrDefault } from './utils'
import { Config } from './types'

declare global {
  interface Window {
    config: Config,
    initialQuality: string
  }
}

main()

async function main() {
  window.config = await getConfigOrDefault()

  chrome.storage.onChanged.addListener(changes => {
    const newConfig = changes.config.newValue
    if (!newConfig) return 
    window.config = newConfig
  })

  document.addEventListener('visibilitychange', debounce(e => {
    if (document.hidden) {
      window.config.enabled && activateLowQuality()
    } else {
      window.initialQuality && revertQuality()
    }
  }, 500, {leading: false, trailing: true}))
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
  window.initialQuality = selectedOpt.quality

  let ogValue = localStorage.getItem("yt-player-quality")

  const lowest = options[options.length - 2] 
  if (lowest && !lowest.selected) {
    lowest.elem.click()
  }

  await timeout(50)
  localStorage.setItem("yt-player-quality", ogValue)
}

async function revertQuality() {
  // speechSynthesis.speak(new SpeechSynthesisUtterance("REVERTING"))
  let options = await getQualityOptions()

  let initialOpt = options.find(opt => opt.quality === window.initialQuality)
  const target = initialOpt || options[0]

  let ogValue = localStorage.getItem("yt-player-quality")
  
  target.elem.click()
  window.initialQuality = undefined

  await timeout(50)
  localStorage.setItem("yt-player-quality", ogValue)
}

function timeout(wait: number) {
  return new Promise((res, rej) => {
    setTimeout(() => res(), wait)
  })
}
