FROM node:25.8.2-alpine3.23
WORKDIR /app
COPY ./backend /app
RUN npm install
CMD ["npx", "ts-node", "src/index.ts"]
