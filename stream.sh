#!/bin/bash
# from https://wiki.archlinux.org/index.php/Streaming_using_twitch.tv

source stream_key
resolution="1320x800" # input resolution
offset="300,170"
fps="15" # target fps
url="rtmp://live.justin.tv/app/$stream_key" #flashver=FMLE/3.0\20(compatible;\20FMSc/1.0)"

ffmpeg -f x11grab -s "$resolution" -r "$fps" -i ":0.0+$offset" \
   -vcodec libx264 -crf 30 -s "$resolution" \
   -f flv "$url"
