#!/bin/bash
cd ~/projects/GuitrainerV2
git pull
node src/data/patch_chords.js
node build.js
echo "Fatto! Ricarica il browser."
