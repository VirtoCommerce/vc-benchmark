##How to stress test with Yandex Tank
###Yandex Tank can be used via docker, without installation any additional tools.
####Install tools
- install docker
- install dotnet core 2.2
####First step - prepare platform
- login to platform's administration area
- add API account for frontend user (special user for access Platform's API)
- new API account must be Simple type
- AppID parameter is api key (just save it for the next step)
####Second step - prepare data
- storefront and platform directory contains transform.bat file
- execute transform.bat file with 2 parameters: host of target (where storefront or platform was deployed) and api key (auth key used for access to platform API, generated on previous step)
####Run Yandex Tank 
- run docker run -v $(pwd):/var/loadtest -v $(pwd):/root/.ssh --net host -it direvius/yandex-tank (where $(pwd) is the full path where scripts files placed)