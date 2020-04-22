
import { Config } from "./types";

export type StorageItems = {[key: string]: any}

export function getStorage(): Promise<StorageItems> {
  return new Promise((res, rej) => {
    chrome.storage.local.get(items => {
      if (chrome.runtime.lastError) {
        rej(chrome.runtime.lastError)
      } else {
        res(items)
      }
      return 
    })
  })
}

export async function getConfigOrDefault(): Promise<Config> {
  const items = await getStorage()
  return items["config"] || getDefaultConfig()
}

export function getDefaultConfig(): Config {
  return {
    version: 1,
    enabled: true
  }
}


export function injectScript(src: string) {
  const injectTag = document.createElement("script")

  injectTag.type = "text/javascript"
  injectTag.src = src

  document.documentElement.appendChild(injectTag)
}
