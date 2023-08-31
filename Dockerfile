# build stage
FROM node:18

WORKDIR /var/lib/app
COPY package.json ./
COPY package-lock.json ./
RUN npm ci
RUN npm build

#run stage
FROM nginx
COPY --from=0 /var/lib/app/dist /usr/share/nginx/html