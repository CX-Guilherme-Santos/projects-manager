# Frontend for local Docker Compose: the same static build as Cloudflare Pages,
# served by nginx. The API URL is baked into the build, so it must be the address
# the browser uses to reach the API (the port published by the api service).
FROM node:26.8.1-slim AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
ARG NUXT_PUBLIC_API_BASE=http://localhost:3000
ENV NUXT_PUBLIC_API_BASE=${NUXT_PUBLIC_API_BASE}
RUN npx nuxt generate

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
