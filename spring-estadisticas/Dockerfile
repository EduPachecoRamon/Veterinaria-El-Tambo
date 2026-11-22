FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -B -DskipTests package

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN groupadd -r app && useradd -r -g app app
COPY --from=build /app/target/clinica-estadisticas-*.jar /app/app.jar
USER app
EXPOSE 10000
CMD ["java","-XX:MaxRAMPercentage=65.0","-jar","/app/app.jar"]
