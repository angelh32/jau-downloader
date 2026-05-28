FROM node:22-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
COPY --from=frontend-builder /frontend/dist /app/frontend/dist

RUN mkdir -p /downloads

EXPOSE 3000

CMD ["gunicorn", "-w", "1", "--threads", "1", "-b", "0.0.0.0:3000", "app.main:app"]
