https://store-benchmark.azurewebsites.net - storefront

https://admin-benchmark.azurewebsites.net - admin (platform API)
credentials: admin/store

To run tests need to replace  localhost:8888 with appropriate host name  
for all files start with ApiTest- to admin-benchmark.azurewebsites.net
for all files start with Storefront-  to store-benchmark.azurewebsites.net 

FYI:

The following tests temporary don't work due to indexed search issue (I'm working on resolving this issue) 
Storefront-BrowsingCategory-recorded.har
Storefront-SearchByPhrase-recorded.har
Storefront-SearchByBrand-recorded.har
ApiTest-BrowsingCategory-recorded.har