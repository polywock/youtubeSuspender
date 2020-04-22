
let block = false 

window.addEventListener("message", ({data}) => {
  if (data.type === "YS_BLOCK_QUALITY_CHANGE") {
    block = true 
  } else if (data.type === "YS_UNBLOCK_QUALITY_CHANGE") {
    block = false 
  }
})

let ogSetItem = localStorage.setItem
localStorage.setItem = function(...args: any[]) {
  const key = args[0]
  if (block && key && key.toLowerCase() === "yt-player-quality") {
    return
  } 

  return ogSetItem.apply(this, args)
}
