# Youtube Suspender

Lowers video quality for background videos to save bandwidth.

Thankfully, Youtube handles video and audio quality separately. So, Youtube Suspender does not degrade audio quality. 

I've tested on 10 minute 1080p video a few times and have averaged a 92% data reduction for background videos. 

[Chart](https://www.androidauthority.com/how-much-data-does-youtube-use-964560/) below, average data usage depending on the Youtube video quality. The savings are a very loose estimate.

| Quality | Data per Minute | ~Savings |
| --- | --- | -- |
| **144p** | **1 MB** | 
|240p	| 3.75 MB | 73%
|360p	| 6.25| 84%
|480p	| 9.5 MB | 89%
|720p  <sup>HD</sup> | 33 MB | 97%
|1080p <sup>HD</sup> | 59 MB | 98%
|1440p <sup>HD</sup> | 90 MB | 99%
|2160p <sup>4K</sup> |	240 MB | > 99%



## Build 
1. `npm install` to install required dependencies. 
1. `npm run build:dev` build unpacked version. 
1. Load the unpacked folder
   1. Chrome: open extensions page, enable dev mode, load unpacked. 
   1. Edge: open extensions page, load unpacked.
