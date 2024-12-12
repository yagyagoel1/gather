FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN pnpm install

COPY . ./

RUN pnpm run build

RUN pnpm install -g serve

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]
