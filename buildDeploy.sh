#!/bin/zsh

staticLocation="/mnt/c/Users/michael.oyibo/Desktop/LocalDev/"
localGhostAPI="http://localhost:2368/ghost/api/v3/content/posts/?key=65c53fcc843f69b185484be3d0"
writeLocation="${staticLocation}GhostBlog/content/themes/vavy/partials/blogsearch.hbs"
AcceptHeader="Accept: application/json"

Container="\$web"
AccountName="codesrealmblogsa"

Domain="https://codesrealm.com"

curl -sb -H $AcceptHeader $localGhostAPI > $writeLocation

#Delete the static folder
rm -R -f "${staticLocation}static"

#Empty the azure storage container
az storage azcopy blob delete --container $Container --account-name $AccountName --recursive

#Generate the static content
gssg --url $Domain --dest "${staticLocation}static"

#Upload the static content to azure storage container
az storage azcopy blob upload --container $Container --account-name $AccountName -s "${staticLocation}static/*" --recursive