FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN if [ -f package.json ]; then \
    npm install && \
    npm install --os=linux --libc=musl --cpu=x64 @rolldown/binding-linux-x64-musl; \
    fi

COPY . .

EXPOSE 3001

CMD ["sh", "-c", "if [ -f package.json ]; then npm run dev -- --host --port 3001; else tail -f /dev/null; fi"]
