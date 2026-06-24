FROM node:22-slim AS frontend-builder

RUN npm install -g pnpm

WORKDIR /frontend
COPY frontend/package.json frontend/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY frontend/ .
RUN pnpm build

FROM python:3.12-alpine

ENV PYTHONUNBUFFERED=1
ENV DOWNLOAD_PATH=/downloads

WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY requirements.txt .
RUN apk add --no-cache --virtual .build-deps gcc musl-dev python3-dev libffi-dev openssl-dev \
    && pip install --no-cache-dir -r requirements.txt \
    && apk del .build-deps

COPY app/ ./app/
COPY --from=frontend-builder /frontend/dist /app/frontend/dist

RUN mkdir -p /downloads

EXPOSE 3000

CMD ["gunicorn", "-w", "1", "--threads", "1", "-b", "0.0.0.0:3000", "app.main:app"]
