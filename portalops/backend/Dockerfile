FROM python:3.12-slim

# Prevent Python from writing .pyc files and buffering stdout/stderr
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
RUN apt-get update && apt-get install -y build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

CMD ["gunicorn", "backend.wsgi:application", \
     "--chdir", "/app", \
     "--bind", "0.0.0.0:8000", \
     "--workers=2", \
     "--threads=4", \
     "--worker-class=gthread", \
     "--timeout=90", \
     "--graceful-timeout=36", \
     "--max-requests=700", \
     "--max-requests-jitter=50", \
     "--log-level=info"]