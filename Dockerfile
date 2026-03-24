FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Install dependencies conditionally
RUN if [ "$NODE_ENV" != "production" ]; then \
    npm install && npx playwright install --with-deps; \
    else npm install --omit=dev; \
    fi

COPY . .

CMD ["node", "./bin/www"]