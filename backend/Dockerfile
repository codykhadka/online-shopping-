# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Run Stage
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
# If you use config files or static assets, copy them here
# COPY .env .env  <-- Don't copy .env in Docker, set them in Cloud Environment

EXPOSE 5000
CMD ["node", "dist/index.js"]
