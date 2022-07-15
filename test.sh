#!/bin/sh



adb shell "killall atx-agent"
GOOS=linux GOARCH=arm go build -tags vfs && adb push atx-agent /data/local/tmp/ && adb shell "/data/local/tmp/atx-agent server -d"
