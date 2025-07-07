#!/bin/bash
# Render start script

echo "🚀 Starting Django application..."
cd backend
exec gunicorn scn_esg_platform.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
