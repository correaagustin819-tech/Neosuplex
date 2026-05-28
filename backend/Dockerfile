# ETAPA 1: Usamos Maven con Java 21 para compilar tu proyecto
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# Compilamos el proyecto omitiendo los tests para que sea más rápido
RUN mvn clean package -DskipTests

# ETAPA 2: Levantamos el proyecto compilado con Java 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
# Copiamos el archivo .jar que se generó en la etapa anterior
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]