#!/bin/bash

cd server
yarn start &
cd ..

yarn start &

open "http://localhost:3000"