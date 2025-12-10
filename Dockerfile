# Use Debian-based Node image
FROM node:20

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install app dependencies
RUN npm install --production --loglevel verbose

# Install Playwright dependencies (official recommended list)
RUN npx playwright install-deps

# Install Playwright browsers (Chromium, Firefox, WebKit)
RUN npx playwright install --with-deps

# Copy application source code
COPY . .

# Expose application port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["node", "./bin/www"]
