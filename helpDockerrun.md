**Ohne docker-compose File**
_first build Image:_
docker build -t node-docker .
_Then run Container_
docker container run --rm -it -p 3000:3000 -v \$PWD:/home/app --name node-docker-container

**Mit docker-compose File**
_Mit docker-compose up wird zwar das image erstellt, aber kein interaktiver Output über die Konsole ermöglicht._
_Alternativ kann:_
docker-compose run -u node --rm --service-ports node_dev
_verwendet werden. --service-ports aktiviert das mapping im composeFile_
_mit -u wird der user welcher im Dockerfile definiert wurde in Docker verwendet, sonst läuft Node in Docker als Root_
