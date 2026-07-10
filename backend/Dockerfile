FROM node:18-alpine

WORKDIR /app

# Intentar instalar dependencias si existe package.json
COPY package*.json ./
RUN if [ -f package.json ]; then \
    npm install && \
    npm install --os=linux --libc=musl --cpu=x64 sharp; \
    fi

COPY . .

EXPOSE 4000

# Mantener vivo el contenedor si no hay script de inicio definido
CMD ["sh", "-c", "if [ -f package.json ]; then node src/db/create_test_users.js && npm run dev; else tail -f /dev/null; fi"]
