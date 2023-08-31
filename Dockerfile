# build stage
FROM node:18

WORKDIR /var/lib/app
COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./tsconfig.json ./
COPY ./tsconfig.node.json ./
COPY ./vite.config.ts ./

COPY ./index.html ./
COPY ./src ./

RUN npm ci
RUN npm run build

#run stage
FROM nginx
COPY --from=0 /var/lib/app/dist /usr/share/nginx/html