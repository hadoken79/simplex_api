**Ohne docker-compose File**
_first build Image:_
docker build -t node-docker .
_Then run Container_
docker container run --rm -it -p 3000:3000 -p 8080:8080 -v \$PWD:/home/app --name node-docker-container

**Mit docker-compose File**
docker-compose up
**Es muss dabei auf die Mountpfade der Volumes geachtet werden**
_Alternativ kann:_
docker-compose run -u node --rm --service-ports node_dev
_verwendet werden. --service-ports aktiviert das mapping im composeFile_
_mit -u wird der user welcher im Dockerfile definiert wurde in Docker verwendet, sonst läuft Node in Docker als Root_


