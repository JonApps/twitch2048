#!/bin/bash
# from https://wiki.archlinux.org/index.php/Streaming_using_twitch.tv


resolution="1320x800" # input resolution
offset="300,170"
fps="15" # target fps
stream_key="$1"
url="rtmp://live.justin.tv/app/$stream_key" #flashver=FMLE/3.0\20(compatible;\20FMSc/1.0)"

ffmpeg -f x11grab -s "$resolution" -r "$fps" -i ":0.0+$offset" \
   -f alsa -ac 2 -i pulse -vcodec libx264 -crf 30 -s "$resolution" \
   -acodec libmp3lame -ab 96k -ar 44100 -threads 0 -pix_fmt yuv420p \
   -f flv "$url"
