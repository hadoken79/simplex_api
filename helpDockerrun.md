**Ohne docker-compose File**
*first build Image:*
docker build -t node-docker .
*Then run Container*
docker container run --rm -it -p 3000:3000 -v \$PWD:/home/app --name node-docker-container

**Mit docker-compose File**
*Mit docker-compose up wird zwar das image erstellt, aber kein interaktiver Output über die Konsole ermöglicht.*
*Alternativ kann:*
docker-compose run --rm --service-ports nod-dev*
*verwendet werden. --service-ports aktiviert das mapping im composeFile*
