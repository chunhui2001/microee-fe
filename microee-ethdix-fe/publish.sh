#!/bin/bash
#./non-hash.sh
rsync -azP dist/* ../../microee-ethdix/microee-ethdix-web/src/main/resources/public/assets/
mv ../../microee-ethdix/microee-ethdix-web/src/main/resources/public/assets/static/js/* ../../microee-ethdix/microee-ethdix-web/src/main/resources/public/assets/static/bundles
rm -rf ../../microee-ethdix/microee-ethdix-web/src/main/resources/public/assets/static/js
# 更新时间戳
java -jar nohash.jr pubdate ../../microee-ethdix/microee-ethdix-web/src/main/resources/application.properties

