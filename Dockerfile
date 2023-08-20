FROM ghcr.io/puppeteer/puppeteer:20.9.0

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable \
    BOT_TOKEN=6473151736:AAEMyONusbgBzMB6M8aZnU4APGGPqlxOu7c \
    NODE_VERSION=18.17.0 \
    PORT=4000

WORKDIR /usr/scr/app

COPY package*.json ./
RUN npm ci
COPY . .
CMD [ "node", "index.js" ]
  