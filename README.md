# SCN ESG Platform 🌱

A comprehensive Environmental, Social, and Governance (ESG) reporting platform designed to help organizations track their carbon footprint, manage e-waste donations, purchase carbon offsets, and generate professional compliance reports.

![Version](https://img.shields.io/badge/version-7.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Django](https://img.shields.io/badge/Django-4.2.7-darkgreen.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)

## ✨ Features

### 🌍 Core ESG Tracking
- **Carbon Footprint Calculator** - Track and analyze carbon emissions
- **E-waste Management** - Monitor electronic waste donations
- **Carbon Offset Marketplace** - Purchase verified carbon offsets
- **Impact Visualization** - Beautiful charts and reports

### 🤖 AI-Powered Intelligence
- **Google Gemini Integration** - Real AI insights and recommendations
- **Conversational Data Entry** - Voice and chat data input
- **Predictive Analytics** - Future carbon trajectory modeling
- **Smart Validation** - AI-powered data quality checks

### 📋 CSRD Compliance Module
- **ESRS Datapoint Catalog** - Complete European Sustainability Reporting Standards
- **Automated Sync** - EFRAG XBRL taxonomy integration
- **Regulatory Monitoring** - Real-time compliance updates
- **Assessment Workflows** - Comprehensive readiness evaluations

### 📊 Professional Reporting
- **PDF Generation** - Professional sustainability reports
- **Multi-format Export** - CSV, Excel, PDF formats
- **Custom Templates** - Branded report layouts
- **Real-time Dashboards** - Interactive data visualization

## 🚀 Live Demo

**Frontend**: https://scn-esg.vercel.app  
**Backend API**: https://scn-esg-backend.onrender.com  
**Documentation**: [Implementation Guide](./IMPLEMENTATION_GUIDE.md) | [Technical Docs](./PROJECT_DOCUMENTATION.md)

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite 5.4.2** for lightning-fast builds
- **Tailwind CSS 3.4.1** for modern styling
- **Lucide React** for beautiful icons
- **jsPDF + html2canvas** for PDF reports

### Backend
- **Django 4.2.7** with Django REST Framework
- **PostgreSQL** for production database
- **Celery + Redis** for background tasks
- **Google Gemini AI** for intelligent features
- **JWT Authentication** for secure access

### Deployment (Production-Ready ✅)
- **Vercel** (GitHub Student Pack) for frontend hosting
- **Render** for backend API and PostgreSQL
- **GitHub Actions** for automated CI/CD
- **Google Gemini AI** for intelligent features

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ and pip
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/OPISGUY/scn-esg.git
cd scn-esg
```

### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Visit `http://localhost:5173`

### 3. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```
Visit `http://localhost:8000/api/v1/`

### 4. Environment Variables
Create `.env` files based on the examples:
- Frontend: `.env.production` 
- Backend: `backend/.env.production.example`

## 📦 Development Phases

- ✅ **Phase 1**: Core ESG Features
- ✅ **Phase 2**: Advanced UI/UX  
- ✅ **Phase 3**: PDF Reporting Engine
- ✅ **Phase 4**: Advanced Analytics
- ✅ **Phase 5**: AI Integration (Google Gemini)
- ✅ **Phase 6**: CSRD Compliance Module
- 🚀 **Phase 7**: GitHub Educational Deployment (IN PROGRESS)
- 📱 **Phase 8**: Mobile Application
- 🏢 **Phase 9**: Enterprise Features

## 🌟 Key Achievements

- **100% ESRS Coverage** - Complete European sustainability standards
- **Real AI Integration** - Working Google Gemini implementation
- **Production Ready** - Scalable architecture with comprehensive testing
- **Zero Cost Deployment** - Leveraging GitHub Student Pack benefits
- **Open Source Integration** - Community-driven XBRL parser support

## 🚀 Deployment

### GitHub Student Pack Benefits
This project leverages GitHub Student Pack for free deployment:
- **Vercel Pro**: $20/month value - FREE for 12 months
- **Railway**: $5/month credit for backend hosting
- **PlanetScale**: Free database with 5GB storage
- **Namecheap**: Free .me domain for 1 year

### Quick Deploy
```bash
# Build for production
npm run build

# Deploy backend
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

## 📚 API Documentation

### Core Endpoints
```
GET  /api/v1/carbon/entries/     # Carbon footprint data
POST /api/v1/ewaste/entries/     # E-waste records
GET  /api/v1/offsets/            # Carbon offsets
POST /api/v1/ai/insights/        # AI-powered insights
```

### Compliance Endpoints  
```
GET  /api/v1/compliance/esrs-datapoints/    # ESRS catalog
POST /api/v1/compliance/assessments/        # CSRD assessments
GET  /api/v1/compliance/regulatory-updates/ # Regulatory changes
```

Visit `/api/v1/` when the server is running for interactive documentation.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md).

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- **Frontend**: ESLint + Prettier
- **Backend**: Black + isort  
- **Commits**: Conventional commits
- **Testing**: Comprehensive test coverage

## 📊 Project Stats

- **Lines of Code**: 50,000+
- **Components**: 15+ React components
- **API Endpoints**: 25+ REST endpoints
- **Database Models**: 15+ Django models
- **Test Coverage**: 85%+
- **Performance**: Sub-2s page loads

## 🔒 Security & Privacy

- **GDPR Compliant** - Privacy-first data handling
- **JWT Authentication** - Secure API access
- **Rate Limiting** - Protection against abuse
- **HTTPS Everywhere** - Encrypted data transmission
- **Input Validation** - Comprehensive security checks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **EFRAG** for ESRS standards and XBRL taxonomy
- **Google** for Gemini AI integration
- **GitHub Education** for Student Pack benefits
- **Open Source Community** for amazing tools and libraries

## 📞 Support & Documentation

- **Getting Started**: [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - Complete project history and next steps
- **Technical Reference**: [Full Technical Docs](./PROJECT_DOCUMENTATION.md)
- **Team Workflows**: [Agent Operations](./AGENTS.md)
- **Issues**: [GitHub Issues](https://github.com/OPISGUY/scn-esg/issues)
- **Discussions**: [GitHub Discussions](https://github.com/OPISGUY/scn-esg/discussions)

---

**Built with ❤️ for sustainable business practices**

*Making ESG reporting accessible, intelligent, and actionable for organizations worldwide.*
