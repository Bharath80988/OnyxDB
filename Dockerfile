# Stage 1: Build the React Dashboard
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY onyxdb-dashboard/package.json onyxdb-dashboard/package-lock.json ./
RUN npm install
COPY onyxdb-dashboard/ ./
RUN npm run build

# Stage 2: Build the Java Spring Boot API
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend

# Copy the pom.xml files for dependency resolution
COPY pom.xml ./
COPY onyxdb-core/pom.xml onyxdb-core/
COPY onyxdb-api/pom.xml onyxdb-api/
RUN mvn dependency:go-offline -B

# Copy source code
COPY onyxdb-core/src onyxdb-core/src
COPY onyxdb-api/src onyxdb-api/src

# Copy the built React app into Spring Boot's static folder so it is served automatically
COPY --from=frontend-build /app/frontend/dist /app/backend/onyxdb-api/src/main/resources/static/

# Build the Spring Boot executable jar
RUN mvn clean package -DskipTests -Dskip.frontend=true

# Stage 3: Create the final minimal production image
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/backend/onyxdb-api/target/onyxdb-api.jar /app/onyxdb.jar

# Expose the API port
EXPOSE 8080

# Environment variables with defaults
ENV SERVER_PORT=8080
ENV DB_STORAGE_PATH=/data/onyxdb

# Create the data directory
RUN mkdir -p /data/onyxdb

# Run the application
ENTRYPOINT ["java", "-jar", "/app/onyxdb.jar"]
