# Stage 1: Build the React app
FROM node:18 AS build
WORKDIR /app

# Accept NPM_TOKEN as build argument
ARG NPM_TOKEN

COPY package*.json ./
# Set up .npmrc for private registry access
RUN echo "@donq.io:registry=https://npm.donq.org/\n//npm.donq.org/:_authToken=${NPM_TOKEN}" > .npmrc
RUN npm install
RUN rm .npmrc

COPY . .
RUN npm run build

# Stage 2: Serve the build with http-server
FROM node:18-slim
WORKDIR /app
RUN npm install -g http-server
COPY --from=build /app/dist ./dist
EXPOSE 8080
CMD ["http-server", "dist", "-p", "8080"] 