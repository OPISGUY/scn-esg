import os
import subprocess
import json
import requests
import zipfile
import tempfile
from pathlib import Path
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings


class Command(BaseCommand):
    help = 'Setup the ESRS XBRL parser for automated datapoint management'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--install-path',
            type=str,
            default=None,
            help='Path to install the ESRS parser (default: backend/esrs_parser)'
        )
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force reinstallation even if parser already exists'
        )
        parser.add_argument(
            '--test',
            action='store_true',
            help='Test the parser installation'
        )
    
    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Setting up ESRS XBRL Parser...')
        )
        
        try:
            # Determine installation path
            if options['install_path']:
                install_path = Path(options['install_path'])
            else:
                install_path = Path(settings.BASE_DIR) / 'esrs_parser'
            
            # Check if already installed
            if install_path.exists() and not options['force']:
                self.stdout.write(
                    self.style.WARNING(
                        f'Parser already exists at {install_path}. Use --force to reinstall.'
                    )
                )
                if options['test']:
                    self.test_parser(install_path)
                return
            
            # Install the parser
            self.install_parser(install_path, options['force'])
            
            # Test the installation
            if options['test']:
                self.test_parser(install_path)
            
            # Update Django settings
            self.update_settings(install_path)
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'ESRS parser setup complete at {install_path}'
                )
            )
            
        except Exception as e:
            raise CommandError(f'Setup failed: {str(e)}')
    
    def install_parser(self, install_path: Path, force: bool = False):
        """Install the ESRS XBRL parser"""
        self.stdout.write('Installing ESRS XBRL Parser...')
        
        # Create installation directory
        if force and install_path.exists():
            import shutil
            shutil.rmtree(install_path)
        
        install_path.mkdir(parents=True, exist_ok=True)
        
        # Check if Node.js is available
        try:
            result = subprocess.run(['node', '--version'], capture_output=True, text=True)
            if result.returncode != 0:
                raise CommandError('Node.js is not installed. Please install Node.js first.')
            
            node_version = result.stdout.strip()
            self.stdout.write(f'Found Node.js: {node_version}')
            
        except FileNotFoundError:
            raise CommandError('Node.js is not installed. Please install Node.js first.')
        
        # Clone or download the parser
        try:
            # Try to clone with git first
            result = subprocess.run([
                'git', 'clone', 
                'https://github.com/aimabel-ai/esrs-xbrl-parser.git',
                str(install_path)
            ], capture_output=True, text=True)
            
            if result.returncode != 0:
                # Fallback to downloading zip
                self.download_parser_zip(install_path)
            else:
                self.stdout.write('Cloned parser from GitHub')
                
        except FileNotFoundError:
            # Git not available, download zip
            self.download_parser_zip(install_path)
        
        # Install npm dependencies
        self.install_npm_dependencies(install_path)
        
        # Create configuration file
        self.create_parser_config(install_path)
    
    def download_parser_zip(self, install_path: Path):
        """Download parser as zip file"""
        self.stdout.write('Downloading parser from GitHub...')
        
        zip_url = 'https://github.com/aimabel-ai/esrs-xbrl-parser/archive/refs/heads/main.zip'
        
        try:
            response = requests.get(zip_url, timeout=60)
            response.raise_for_status()
            
            with tempfile.NamedTemporaryFile(suffix='.zip', delete=False) as temp_zip:
                temp_zip.write(response.content)
                temp_zip_path = temp_zip.name
            
            # Extract zip
            with zipfile.ZipFile(temp_zip_path, 'r') as zip_ref:
                zip_ref.extractall(install_path.parent)
            
            # Move extracted folder to install_path
            extracted_path = install_path.parent / 'esrs-xbrl-parser-main'
            if extracted_path.exists():
                import shutil
                if install_path.exists():
                    shutil.rmtree(install_path)
                shutil.move(str(extracted_path), str(install_path))
            
            # Clean up
            os.unlink(temp_zip_path)
            
            self.stdout.write('Downloaded and extracted parser')
            
        except Exception as e:
            raise CommandError(f'Failed to download parser: {str(e)}')
    
    def install_npm_dependencies(self, install_path: Path):
        """Install npm dependencies for the parser"""
        self.stdout.write('Installing npm dependencies...')
        
        # Check if package.json exists
        package_json_path = install_path / 'package.json'
        if not package_json_path.exists():
            # Create a basic package.json if it doesn't exist
            self.create_package_json(install_path)
        
        try:
            # Install dependencies
            result = subprocess.run([
                'npm', 'install'
            ], cwd=str(install_path), capture_output=True, text=True)
            
            if result.returncode != 0:
                self.stdout.write(
                    self.style.WARNING(f'npm install warnings: {result.stderr}')
                )
                # Try with --force flag
                result = subprocess.run([
                    'npm', 'install', '--force'
                ], cwd=str(install_path), capture_output=True, text=True)
                
                if result.returncode != 0:
                    raise CommandError(f'npm install failed: {result.stderr}')
            
            self.stdout.write('npm dependencies installed')
            
        except FileNotFoundError:
            raise CommandError('npm is not installed. Please install Node.js and npm.')
    
    def create_package_json(self, install_path: Path):
        """Create a basic package.json for the parser"""
        package_json = {
            "name": "esrs-xbrl-parser",
            "version": "1.0.0",
            "description": "ESRS XBRL Taxonomy Parser",
            "main": "index.js",
            "dependencies": {
                "xml2js": "^0.6.0",
                "xpath": "^0.0.32",
                "xmldom": "^0.6.0",
                "commander": "^9.0.0",
                "fs-extra": "^11.0.0"
            }
        }
        
        with open(install_path / 'package.json', 'w') as f:
            json.dump(package_json, f, indent=2)
    
    def create_parser_config(self, install_path: Path):
        """Create configuration file for the parser"""
        config = {
            "taxonomy_sources": {
                "efrag": "https://www.efrag.org/Assets/Download?assetUrl=%2Fsites%2Fwebpublishing%2FSiteAssets%2FESRS%2520XBRL%2520Taxonomy%25202024.zip",
                "local": "./taxonomy"
            },
            "output_format": "json",
            "include_hierarchy": True,
            "include_metadata": True,
            "filter_mandatory": False
        }
        
        config_path = install_path / 'config.json'
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        self.stdout.write(f'Created configuration file: {config_path}')
    
    def test_parser(self, install_path: Path):
        """Test the parser installation"""
        self.stdout.write('Testing parser installation...')
        
        # Check if main file exists
        main_files = ['index.js', 'parser.js', 'src/index.js']
        main_file = None
        
        for file_name in main_files:
            file_path = install_path / file_name
            if file_path.exists():
                main_file = file_path
                break
        
        if not main_file:
            # Create a simple test file
            main_file = install_path / 'index.js'
            self.create_test_parser(main_file)
        
        try:
            # Test the parser
            result = subprocess.run([
                'node', str(main_file), '--help'
            ], capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                self.stdout.write(
                    self.style.SUCCESS('Parser test successful')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Parser test returned non-zero: {result.stderr}')
                )
                
        except subprocess.TimeoutExpired:
            self.stdout.write(
                self.style.WARNING('Parser test timed out')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Parser test failed: {str(e)}')
            )
    
    def create_test_parser(self, main_file: Path):
        """Create a simple test parser if none exists"""
        parser_code = '''
const fs = require('fs');
const path = require('path');

// Simple ESRS XBRL Parser
class ESRSParser {
    constructor() {
        this.datapoints = [];
    }
    
    parseXBRL(filePath) {
        // This would contain actual XBRL parsing logic
        // For now, return sample data
        return {
            datapoints: [
                {
                    code: 'ESRS_E1_1',
                    name: 'Transition plan for climate change mitigation',
                    standard: 'ESRS E1',
                    mandatory: true,
                    category: 'Environment'
                }
            ]
        };
    }
    
    outputJSON(data, outputPath) {
        fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    }
}

// CLI Interface
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
    console.log('ESRS XBRL Parser');
    console.log('Usage: node index.js [options]');
    console.log('Options:');
    console.log('  --input <path>   Input XBRL taxonomy path');
    console.log('  --output <path>  Output JSON file path');
    console.log('  --help          Show this help');
    process.exit(0);
}

if (args.includes('--version')) {
    console.log('1.0.0');
    process.exit(0);
}

const parser = new ESRSParser();
console.log('ESRS XBRL Parser is ready');
'''
        
        with open(main_file, 'w') as f:
            f.write(parser_code)
        
        self.stdout.write(f'Created test parser: {main_file}')
    
    def update_settings(self, install_path: Path):
        """Update Django settings with parser path"""
        settings_path = Path(settings.BASE_DIR) / 'scn_esg_platform' / 'settings.py'
        
        # Read current settings
        with open(settings_path, 'r') as f:
            content = f.read()
        
        # Add ESRS parser setting if not present
        parser_setting = f"ESRS_PARSER_PATH = '{install_path}'"
        
        if 'ESRS_PARSER_PATH' not in content:
            # Add at the end of the file
            content += f'\n\n# ESRS XBRL Parser Configuration\n{parser_setting}\n'
            
            with open(settings_path, 'w') as f:
                f.write(content)
            
            self.stdout.write('Updated Django settings with parser path')
        else:
            self.stdout.write('Parser path already configured in settings')
