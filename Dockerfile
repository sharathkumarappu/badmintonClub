FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# # Update package index and install CA certificates
# RUN apk update && apk add --no-cache ca-certificates

# Install app dependencies
RUN npm install --production --loglevel verbose

# Copy app sources
COPY . .

# Expose default port (bin/www commonly uses 3000)
EXPOSE 3000

# Default env
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "./bin/www"]
