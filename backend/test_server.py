
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
import json

class TestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        
        response = {
            "status": "ok",
            "message": "Simple test server is working",
            "python_version": sys.version,
            "environment_vars": list(os.environ.keys())[:10]  # First 10 env vars
        }
        
        self.wfile.write(json.dumps(response, indent=2).encode())

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    server = HTTPServer(('0.0.0.0', port), TestHandler)
    print(f"Test server starting on port {port}")
    server.serve_forever()
