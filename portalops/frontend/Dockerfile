# frontend/Dockerfile

# 1. Build phase
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Serve phase
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
# hoặc nếu dùng CRA:
# COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
