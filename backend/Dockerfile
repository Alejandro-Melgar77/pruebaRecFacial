FROM python:3.11-slim

WORKDIR /app

# Evitar pyc + usar UTF-8
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DEBIAN_FRONTEND=noninteractive

# Instalar gcc, python headers y librerías de Postgres
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Actualizar pip y luego instalar dependencias
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
