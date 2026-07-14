# Use official Python 3.10 slim image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Set working directory
WORKDIR /app

# Install system dependencies :
# - build-essential / libpq-dev : compilation psycopg2 & co
# - tesseract-ocr (+ fra/ara)   : OCR réel des factures/devis scannés —
#   sans le binaire, service_ocr bascule en mode simulation.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    tesseract-ocr \
    tesseract-ocr-fra \
    tesseract-ocr-ara \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Utilisateur non-root : l'API n'a aucune raison de tourner en root dans
# le conteneur. data/uploads et logs doivent lui appartenir (stockage des
# scans + journaux).
RUN mkdir -p logs data/uploads \
    && chmod +x entrypoint.sh \
    && useradd --create-home --uid 1001 appuser \
    && chown -R appuser:appuser /app
USER appuser

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

# Provisionne la base (migrations alembic, rôles, plan comptable par
# hiérarchie) avant de démarrer le serveur — voir entrypoint.sh.
ENTRYPOINT ["./entrypoint.sh"]
