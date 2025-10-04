#!/usr/bin/env python
"""
Python SMTP Debug Server - Alternative to MailHog
Run this to capture emails during development without Docker

Usage: python backend/start_smtp_debug_server.py
"""

import asyncore
import smtpd
import sys
from datetime import datetime


class ColoredSMTPServer(smtpd.SMTPServer):
    """SMTP server that prints emails to console with colors and formatting"""
    
    email_count = 0
    
    def process_message(self, peer, mailfrom, rcpttos, data, **kwargs):
        """Process incoming email and display it nicely"""
        ColoredSMTPServer.email_count += 1
        
        # ANSI color codes
        GREEN = '\033[92m'
        BLUE = '\033[94m'
        YELLOW = '\033[93m'
        CYAN = '\033[96m'
        BOLD = '\033[1m'
        RESET = '\033[0m'
        
        print(f"\n{GREEN}{'='*80}{RESET}")
        print(f"{BOLD}{CYAN}📧 EMAIL #{ColoredSMTPServer.email_count} RECEIVED{RESET}")
        print(f"{GREEN}{'='*80}{RESET}")
        print(f"{YELLOW}⏰ Time:{RESET} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{YELLOW}📤 From:{RESET} {mailfrom}")
        print(f"{YELLOW}📥 To:{RESET} {', '.join(rcpttos)}")
        print(f"{YELLOW}🌐 Peer:{RESET} {peer[0]}:{peer[1]}")
        print(f"{GREEN}{'-'*80}{RESET}")
        print(f"{BOLD}Message Content:{RESET}")
        print(f"{BLUE}{data.decode('utf-8', errors='ignore')}{RESET}")
        print(f"{GREEN}{'='*80}{RESET}\n")


def main():
    """Start the SMTP debug server"""
    host = 'localhost'
    port = 1025
    
    print(f"""
{chr(27)}[1m{chr(27)}[92m╔═══════════════════════════════════════════════════════════════════╗
║           SCN ESG Platform - SMTP Debug Server                   ║
║           (Alternative to MailHog - No Docker Required)          ║
╚═══════════════════════════════════════════════════════════════════╝{chr(27)}[0m

{chr(27)}[93m📡 SMTP Server Configuration:{chr(27)}[0m
   Host: {host}
   Port: {port}
   
{chr(27)}[96m✅ Django Settings (already configured):{chr(27)}[0m
   EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
   EMAIL_HOST = 'localhost'
   EMAIL_PORT = 1025
   
{chr(27)}[92m🚀 Server Status: RUNNING{chr(27)}[0m
{chr(27)}[92m📬 Waiting for emails...{chr(27)}[0m

{chr(27)}[90mPress Ctrl+C to stop the server{chr(27)}[0m
""")
    
    try:
        server = ColoredSMTPServer((host, port), None)
        print(f"{chr(27)}[92m✓ SMTP Debug Server started successfully on {host}:{port}{chr(27)}[0m\n")
        asyncore.loop()
    except KeyboardInterrupt:
        print(f"\n\n{chr(27)}[93m⚠️  Server stopped by user{chr(27)}[0m")
        print(f"{chr(27)}[92m📊 Total emails received: {ColoredSMTPServer.email_count}{chr(27)}[0m\n")
        sys.exit(0)
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print(f"\n{chr(27)}[91m❌ ERROR: Port {port} is already in use!{chr(27)}[0m")
            print(f"{chr(27)}[93mSolution: Stop any other SMTP servers or change the port{chr(27)}[0m\n")
        else:
            print(f"\n{chr(27)}[91m❌ ERROR: {e}{chr(27)}[0m\n")
        sys.exit(1)


if __name__ == '__main__':
    main()
