# Stage 1: Build the React app
FROM node:18 AS build
WORKDIR /app

# Accept NPM_TOKEN as build argument
ARG NPM_TOKEN

# Accept signalling server URL as build argument with default
ARG REACT_APP_SIGNALLING_SERVER_URL=ws://localhost:80
RUN echo "REACT_APP_SIGNALLING_SERVER_URL=${REACT_APP_SIGNALLING_SERVER_URL}"

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
# Install http-server and curl
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN npm install -g http-server
COPY --from=build /app/dist ./dist
EXPOSE 80
CMD ["http-server", "dist", "-p", "80"] 