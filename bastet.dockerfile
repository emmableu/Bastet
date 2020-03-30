FROM node:13-alpine AS base

# Set the working directory
# All subsequent actions will be taken from here
WORKDIR /bastet

FROM base AS deploy

# First, copy the package dependency definition only (for a better layering)
COPY package*.json ./

# Install dependencies
RUN npm install --production && npm install --global typescript @types/node

# Copy BASTET fully into the image
COPY . ./

RUN npm install -D @types/node

RUN npm run build-no-lint

CMD ["npm", "start"]