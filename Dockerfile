FROM node:16 AS BUILD

WORKDIR /work
ADD package*.json /work/
RUN npm install

ADD . /work
ENV PUBLIC_URL @@PUBLIC_URL@@
RUN npm run build

FROM nginx:stable-alpine

ENV PUBLIC_URL ""

COPY --from=BUILD /work/build /usr/share/nginx/html
ADD docker/nginx.conf /etc/nginx/templates/default.conf.template
ADD docker/50-replace-public-url.sh /docker-entrypoint.d
