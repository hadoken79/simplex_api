FROM node:13.1.0

WORKDIR /home/app
#USER node

COPY package*.json ./
RUN npm install --quiet

COPY . .


EXPOSE 3000
EXPOSE 8080

#for production switch to the second command
#CMD ["npm", "run", "dev"]
CMD ["npm", "start"]

#ENTRYPOINT /bin/bash

