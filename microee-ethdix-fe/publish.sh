#!/bin/bash
#./non-hash.sh
rsync -azP dist/* ../../microee-ethdix/microee-ethdix-web/src/main/resources/public/assets/
# 更新时间戳
java -jar nohash.jr pubdate ../../microee-ethdix/microee-ethdix-web/src/main/resources/application.properties

