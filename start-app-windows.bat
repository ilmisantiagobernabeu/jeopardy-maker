@echo off

start cmd /c "node getStaticIp.js && yarn && yarn start"

cd server
start cmd /c "yarn && yarn start"

start "" "http://localhost:3000"