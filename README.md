# AI-Powered Multi-Agent System for RFP Response Automation

<div align="center">

[![Python Version](https://img.shields.io/badge/python-3.9%2B-blue.svg)](https://www.python.org/downloads/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Code Style](https://img.shields.io/badge/code%20style-black-000000.svg)](https://github.com/psf/black)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**Streamline your RFP response process with intelligent automation**

[Features](#-key-features) •
[Architecture](#-solution-architecture) •
[Getting Started](#-getting-started) •
[Documentation](#-documentation) •
[Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Problem Statement](#-problem-statement)
- [Solution Architecture](#-solution-architecture)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [Usage](#-usage)
- [Expected Outcomes](#-expected-outcomes)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## 🎯 Overview

An intelligent multi-agent system that revolutionizes the Request for Proposal (RFP) response process for B2B organizations.  By leveraging cutting-edge agentic AI architecture, this solution automates time-intensive tasks, enabling teams to respond to more RFPs with higher quality and faster turnaround times. 

### Why This Matters

In the competitive B2B landscape, the ability to respond quickly and accurately to RFPs directly impacts revenue growth.  This system transforms your RFP workflow from a manual bottleneck into an automated competitive advantage.

---

## 💼 Problem Statement

Organizations experiencing rapid growth in the B2B channel face significant challenges in scaling their RFP response capabilities. Analysis of historical RFP performance has revealed critical insights:

| Metric | Impact |
|--------|--------|
| **90%** | Successful RFPs actioned on time |
| **60%** | Wins occurred when adequate time was allocated for technical product matching |
| **#1 Bottleneck** | Technical product SKU matching (most time-intensive process step) |
| **High Risk** | Delayed RFP submissions significantly reduce competitive win probability |

### The Challenge

The current manual process creates bottlenecks that limit the number of RFPs an organization can effectively respond to, directly impacting revenue growth potential and competitive positioning.

---

## 🏗️ Solution Architecture

### Multi-Agent System Design

The solution employs a coordinated multi-agent architecture with **one orchestrator** and **three specialized worker agents**, each optimized for specific tasks in the RFP response workflow. 

```
┌─────────────────────────────────────────────────────────────┐
│                      SALES AGENT                            │
│         (RFP Discovery & Prioritization)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      MAIN AGENT                             │
│              (Orchestrator & Coordinator)                   │
└──────┬───────────────────────────────────────────┬──────────┘
       │                                           │
       ▼                                           ▼
┌──────────────────────┐              ┌──────────────────────┐
│  TECHNICAL AGENT     │◄────────────►│   PRICING AGENT      │
│ (Product Matching)   │              │ (Cost Calculation)   │
└──────────────────────┘              └──────────────────────┘
```

### Agent Roles & Responsibilities

#### 🎯 Main Agent (Orchestrator)

**Core Functions:**
- Prepares role-specific RFP summaries for Technical and Pricing agents
- Consolidates responses from all worker agents
- Generates comprehensive RFP responses including recommended OEM product SKUs, pricing, and testing costs
- Manages end-to-end conversation flow from initiation to completion

**Outputs:**
- Complete RFP response documents
- Executive summaries
- Integrated technical and pricing recommendations

---

#### 🔍 Sales Agent

**Core Functions:**
- Monitors predefined URLs to identify new RFP opportunities
- Filters RFPs with submission deadlines within the next 3 months
- Extracts and summarizes RFP requirements and critical dates
- Prioritizes opportunities based on business criteria
- Forwards selected RFPs to the Main Agent for processing

**Outputs:**
- RFP opportunity pipeline
- Prioritized RFP queue
- Deadline alerts and summaries

---

#### ⚙️ Technical Agent

**Core Functions:**
- Analyzes RFP documents to identify products within scope of supply
- Matches RFP requirements against repository of OEM product datasheets
- Recommends top 3 OEM products for each RFP requirement
- Calculates **"Spec Match" percentage** based on equal-weighted specification alignment
- Generates detailed comparison tables (RFP specs vs. recommended product specs)
- Selects optimal OEM products based on match metrics

**Outputs:**
- Product recommendation tables
- Specification match scores (%)
- Technical comparison matrices
- Final product selections

---

#### 💰 Pricing Agent

**Core Functions:**
- Processes testing and acceptance requirement summaries
- Receives technical product recommendations from Technical Agent
- Applies pricing from predefined pricing tables for products and services
- Calculates consolidated material and services costs per product

**Outputs:**
- Comprehensive pricing tables
- Cost breakdowns (materials + services)
- Total proposal pricing

---

## ✨ Key Features

- 🤖 **Automated RFP Discovery**: Continuous monitoring of specified URLs for new opportunities
- 🎯 **Intelligent Product Matching**: AI-driven specification analysis with quantified match scoring
- 💵 **Automated Pricing**: Real-time integration with pricing databases for rapid quote generation
- 📊 **Comprehensive Reporting**: Consolidated responses with technical recommendations and pricing breakdowns
- ⏰ **Deadline Management**: Proactive identification of RFPs requiring attention within 3-month windows
- 📈 **Analytics Dashboard**: Track RFP volume, win rates, and response times
- 🔄 **Continuous Learning**: System improves recommendations based on historical success patterns

---

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Language** | Python 3.9+ | Core application development |
| **Agent Framework** | LangGraph / CrewAI | Multi-agent orchestration |
| **Memory Management** | Mem0 | Persistent agent memory and context |
| **Web Interface** | Next.js / Flask / Streamlit | User interface and dashboards |
| **Database** | PostgreSQL / SQLite | Data persistence |
| **Document Processing** | PyPDF2, python-docx | RFP document parsing |
| **API Integration** | FastAPI | RESTful API endpoints |
| **Task Queue** | Celery | Background job processing |
| **Caching** | Redis | Performance optimization |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9 or higher**
- **pip** (Python package manager)
- **Git**
- **Virtual environment tool** (venv or virtualenv)
- **API Keys** for LLM providers (OpenAI, Anthropic, etc.)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/calebjubal/multi-agent-rfp-response-automation.git
   cd multi-agent-rfp-response-automation
   ```

2. **Create and activate virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

1. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file with your configuration**
   ```env
   # LLM API Keys
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Database Configuration
   DATABASE_URL=postgresql://user:password@localhost/rfp_db
   
   # Application Settings
   FLASK_ENV=development
   SECRET_KEY=your_secret_key_here
   
   # Agent Configuration
   RFP_MONITORING_URLS=https://example.com/rfps,https://example2.com/rfps
   RFP_CHECK_INTERVAL=3600  # seconds
   ```

3. **Initialize the database**
   ```bash
   python manage.py init_db
   ```

4. **Load product datasheets and pricing tables**
   ```bash
   python manage.py load_data --products data/products.csv --pricing data/pricing.csv
   ```

---

## 📖 Usage

### Starting the Application

**Option 0: FastAPI Backend (recommended for API usage)**
```bash
uvicorn fastapi_backend:app --reload --host 0.0.0.0 --port 8000
```
Health check: `http://localhost:8000/health`

**Option 1: Flask Web Interface**
```bash
python app.py
```
Navigate to `http://localhost:5000`

**Option 2: Streamlit Dashboard**
```bash
streamlit run dashboard.py
```
Navigate to `http://localhost:8501`

### Basic Workflow

1. **Configure RFP Sources**:  Add URLs to monitor in the settings panel
2. **Monitor Dashboard**: View discovered RFPs and their status
3. **Review Recommendations**:  Examine AI-generated product matches and pricing
4. **Approve & Export**: Finalize responses and export to required formats
5. **Track Performance**: Monitor response times and win rates

### Example:  Processing a Single RFP

```python
from rfp_system import RFPProcessor

# Initialize the processor
processor = RFPProcessor()

# Process an RFP document
result = processor.process_rfp(
    file_path="path/to/rfp_document.pdf",
    deadline="2026-04-15"
)

# Access results
print(result.technical_recommendations)
print(result.pricing_breakdown)
print(result.response_document)
```

---

## 📊 Expected Outcomes

Organizations implementing this system can expect:

| Outcome | Target Improvement |
|---------|-------------------|
| **RFP Response Volume** | 3-5x increase in annual capacity |
| **On-Time Submissions** | >95% submission rate |
| **Technical Matching Time** | 80% reduction in manual effort |
| **Response Quality** | Improved consistency and accuracy |
| **Win Rate** | 15-25% improvement through timely, comprehensive proposals |
| **Team Productivity** | Shift from manual tasks to strategic activities |

---

## 🗺️ Roadmap

### Q1 2026
- [x] Core multi-agent architecture
- [x] Basic RFP monitoring
- [ ] Advanced analytics dashboard
- [ ] Integration with CRM systems

### Q2 2026
- [ ] Machine learning-based spec matching improvements
- [ ] Custom template support
- [ ] Multi-language RFP support
- [ ] Mobile application

### Q3 2026
- [ ] Advanced pricing optimization
- [ ] Competitive intelligence integration
- [ ] Automated proposal generation templates
- [ ] API marketplace integrations

### Future Enhancements
- Natural language query interface
- Predictive win probability scoring
- Collaborative editing features
- Enterprise SSO integration

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow PEP 8 style guidelines
- Write unit tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

### Development Setup

```bash
# Install development dependencies
pip install -r requirements-dev.txt

# Run tests
pytest

# Run linter
flake8 .

# Format code
black . 
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Caleb Jubal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions: 

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software. 
```

---

## 💬 Support

### Get Help

- 📧 **Email**: support@example.com
- 💬 **Discussions**: [GitHub Discussions](https://github.com/calebjubal/multi-agent-rfp-response-automation/discussions)
- 🐛 **Bug Reports**: [Issue Tracker](https://github.com/calebjubal/multi-agent-rfp-response-automation/issues)
- 📚 **Documentation**: [Wiki](https://github.com/calebjubal/multi-agent-rfp-response-automation/wiki)

### Community

- Join our [Discord Server](https://discord.gg/example)
- Follow us on [Twitter](https://twitter.com/example)
- Read our [Blog](https://blog.example.com)

---

## 🙏 Acknowledgments

- Built with [LangGraph](https://github.com/langchain-ai/langgraph) / [CrewAI](https://github.com/joaomdmoura/crewAI)
- Powered by [Mem0](https://github.com/mem0ai/mem0)
- Inspired by the needs of B2B technology distribution teams

---

## 👥 Contributors

<div style="display:flex;flex-wrap:wrap;gap:16px;">
   <a href="https://github.com/calebjubal" style="text-decoration:none;color:inherit;">
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;width:140px;text-align:center;">
         <img src="https://avatars.githubusercontent.com/u/85286527?s=96&v=4" alt="@calebjubal" width="64" height="64" style="border-radius:50%;" />
         <div style="margin-top:8px;font-weight:600;">calebjubal</div>
      </div>
   </a>
   <a href="https://github.com/KuruHe" style="text-decoration:none;color:inherit;">
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;width:140px;text-align:center;">
         <img src="https://avatars.githubusercontent.com/u/165144197?s=96&v=4" alt="@KuruHe" width="64" height="64" style="border-radius:50%;" />
         <div style="margin-top:8px;font-weight:600;">KuruHe</div>
      </div>
   </a>
   <a href="https://github.com/Tharun-10Dragneel" style="text-decoration:none;color:inherit;">
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;width:140px;text-align:center;">
         <img src="https://avatars.githubusercontent.com/u/165540181?s=96&v=4" alt="@Tharun-10Dragneel" width="64" height="64" style="border-radius:50%;" />
         <div style="margin-top:8px;font-weight:600;">Tharun-10Dragneel</div>
      </div>
   </a>
   <a href="https://github.com/bsahil01" style="text-decoration:none;color:inherit;">
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;width:140px;text-align:center;">
         <img src="https://avatars.githubusercontent.com/u/179309113?s=96&v=4" alt="@bsahil01" width="64" height="64" style="border-radius:50%;" />
         <div style="margin-top:8px;font-weight:600;">bsahil01</div>
      </div>
   </a>
   <a href="https://github.com/mengyokyu" style="text-decoration:none;color:inherit;">
      <div style="border:1px solid #e5e7eb;border-radius:12px;padding:12px;width:140px;text-align:center;">
         <img src="https://avatars.githubusercontent.com/u/96583982?s=96&v=4" alt="@mengyokyu" width="64" height="64" style="border-radius:50%;" />
         <div style="margin-top:8px;font-weight:600;">mengyokyu</div>
      </div>
   </a>
</div>

---

## 📈 Use Case

**Industry**: B2B Technology/Product Distribution

This solution is designed for organizations with significant B2B RFP activity seeking to scale their response capabilities while maintaining high-quality, technically accurate proposals.  Ideal for: 

- Technology distributors and resellers
- System integrators
- Professional services firms
- Government contractors
- Enterprise software vendors

---

<div align="center">

**⭐ Star this repository if you find it helpful! **
</div>
