FROM node:18 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install --silent

# Copy the rest of the app's source code
COPY . .

# Build the React app
RUN npm run build

# Use nginx to serve the build files
FROM nginx:alpine

# Copy the built React app to Nginx's serving directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 for serving
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
