#!/bin/sh
cd /home/z/my-project
while true; do
  bun run dev >> dev.log 2>&1
  sleep 1
done