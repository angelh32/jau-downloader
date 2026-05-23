FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p /downloads

EXPOSE 3000

CMD ["gunicorn", "-w", "1", "--threads", "1", "-b", "0.0.0.0:3000", "app.main:app"]
