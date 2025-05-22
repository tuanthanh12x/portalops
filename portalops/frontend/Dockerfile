# 1. Build phase
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Serve phase
FROM nginx:alpine

# Copy file cấu hình nginx tùy chỉnh
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
