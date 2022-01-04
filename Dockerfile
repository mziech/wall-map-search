FROM node:16 AS BUILD

WORKDIR /work
ADD package*.json /work/
RUN npm install

ADD . /work
RUN npm run build

FROM nginx:stable-alpine

COPY --from=BUILD /work/build /usr/share/nginx/html
ADD docker/nginx.conf /etc/nginx/conf.d/default.conf
