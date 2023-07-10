# Stage 1 - build Angular app
FROM node:19 as builder
WORKDIR /usr/src/app
COPY ../../package*.json ./
RUN npm install
COPY . .
RUN nx run construction:serve:production
# Stage 2 - run Angular app with Nginx
FROM nginx:latest
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

