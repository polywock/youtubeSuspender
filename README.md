# Youtube Suspender

Lowers video quality for background videos to save bandwidth. Furthermore, because Youtube handles video and audio separetly. Adjusting the video quality does not affect the audio quality. Background sound will still sound just as good.  

I've tested on 10 minute 1080p video a few times and have averaged a 92% data reduction for background videos. 

## Discontinued
I've decided to back away from this project. It wasn't as useful as I thought. And I want to cut my losses early. I've invested a whole 8 hours on it. So, not a great loss, but a deep one. I had dreamed of this extension being a passive one. Just install and save bandwidth. But, the algorithms at play chose a different path for it. 

Youtube Suspender does save bandwidth, but only when you listen to background videos for a continous stretch of time. However, if you tab in/out of the Youtube video tab too frequently. It ends up costing more in bandwidth. That's because Youtube prebuffers a certain amount ahead. For 1080p streams, about a minute for me. If the quality is changed, the buffer of the old quality stream clears. And a new buffer has to be loaded for the new quality stream. This isn't cached. So tabbing in/out will cost a lot of bandwidth. 

it's useful if you actively enable it (eg. when you're planning on listening to Youtube songs for a good chunk of time). But, at that point, you could just lower the video quality manually. The convenience factor was lost, and so was Youtube Suspender. Good bye, my project. 


## Build 
1. `npm install` to install required dependencies. 
1. `npm run build:dev` build unpacked version. 
1. Load the unpacked folder
   1. Chrome: open extensions page, enable dev mode, load unpacked. 
   1. Edge: open extensions page, load unpacked.
