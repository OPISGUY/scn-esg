#!/bin/bash
# Render start script

echo "🚀 Starting Django application..."
cd backend
exec gunicorn scn_esg_platform.wsgi:application --host 0.0.0.0 --port $PORT --workers 2 --timeout 120
