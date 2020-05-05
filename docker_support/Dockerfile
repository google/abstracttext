FROM mediawiki:stable
LABEL maintainer="arthurpsmith@gmail.com"

RUN apt-get update && apt-get install -q -y git curl nodejs npm
RUN cd /var/www/html/extensions && \
    git clone https://gerrit.wikimedia.org/r/mediawiki/extensions/UniversalLanguageSelector.git && \
    git clone https://github.com/google/abstracttext.git && \
    mv abstracttext AbstractText
RUN cd /var/www/html/extensions/AbstractText/eneyj && \
    npm install && \
    npm install uuid && \
    mkdir config && \
    mkdir config/runs && \
    node src/scripts/labelMap.js && \
    cp src/scripts/calibration-initial.json config/calibration.json && \
    node src/scripts/measure.js --chatty && \
    node src/scripts/calibrate.js

COPY DockerLocalSettings.php /var/www/html/DockerLocalSettings.php
COPY AdditionalLocalSettings.php /tmp/AdditionalLocalSettings.php

RUN cd /var/www/html && \
    php maintenance/install.php --server http://localhost:8081 --dbtype sqlite --dbpath /var/www/data --scriptpath "" --pass "vagrant" "Lambda" "admin"
RUN cat /tmp/AdditionalLocalSettings.php >> /var/www/html/LocalSettings.php

RUN cd /var/www/html && \
    php maintenance/importTextFiles.php -s "Import data" --prefix "M:" --overwrite extensions/AbstractText/eneyj/data/Z*

RUN chown www-data /var/www/data/*
