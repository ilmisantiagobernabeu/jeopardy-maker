@echo off
cd server
start cmd /c "yarn start"
cd ../
start cmd /c "yarn start"

start chrome "http://localhost:3000"