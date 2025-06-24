FROM mcr.microsoft.com/devcontainers/typescript-node:20

RUN apt-get update && \
    apt-get install -y poppler-utils curl unzip && \
    apt-get clean

RUN npm install -g pnpm
