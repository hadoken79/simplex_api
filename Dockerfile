FROM node:13.1.0

WORKDIR /home/app
USER node


EXPOSE 3000

ENTRYPOINT /bin/bash