@echo off
cd server
start cmd /c "yarn start"
cd ../
start cmd /c "yarn start"

start "" "http://localhost:3000"