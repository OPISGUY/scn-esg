# Use Python 3.11 slim image for better package compatibility
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
ENV DJANGO_SETTINGS_MODULE=scn_esg_platform.settings

# Set working directory
WORKDIR /app

# Install system dependencies - updated cache bust
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    pkg-config \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/requirements.txt /app/requirements.txt

# Install Python dependencies with optimizations
RUN pip install --upgrade pip setuptools wheel && \
    pip install --only-binary=all --no-build-isolation -r requirements.txt

# Copy the entire backend
COPY backend/ /app/

# Create staticfiles directory
RUN mkdir -p /app/staticfiles

# Set proper permissions
RUN chmod +x /app/manage.py

# Expose port (Railway sets this automatically)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:$PORT/ || exit 1

# Create a startup script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "Starting Django application..."\n\
echo "Running migrations..."\n\
python manage.py migrate --noinput\n\
echo "Collecting static files..."\n\
python manage.py collectstatic --noinput\n\
echo "Starting Gunicorn..."\n\
exec gunicorn --bind 0.0.0.0:$PORT --workers 3 --timeout 120 --access-logfile - --error-logfile - --log-level info scn_esg_platform.wsgi:application' > /app/start.sh && chmod +x /app/start.sh

# Use the startup script
CMD ["/app/start.sh"]
