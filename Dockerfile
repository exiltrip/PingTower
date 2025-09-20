FROM node:23-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM alpine AS final

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .

CMD ["/bin/sh", "-c", "echo 'Frontend ready!'"]