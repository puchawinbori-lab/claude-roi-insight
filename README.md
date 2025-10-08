# Claude ROI Insight Calculator 📊

A full-stack web application that analyzes JIRA data to calculate and visualize ROI metrics for Claude Code adoption.

![Tech Stack](https://img.shields.io/badge/React-TypeScript-blue)
![Backend](https://img.shields.io/badge/Backend-Python%20Flask-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

## ✨ Features

- 🔐 **Secure JIRA Integration** - Connect directly to your JIRA instance
- 📈 **Real-time ROI Calculations** - Analyze productivity improvements
- 💰 **Cost Savings Analysis** - Calculate financial impact with engineer costs
- 📊 **Beautiful Dashboard** - Interactive charts and metrics
- ⚡ **Fast Performance** - Optimized data processing and caching

## 🚀 Quick Start

See **[SETUP.md](./SETUP.md)** for detailed installation instructions.

```bash
# Backend
cd backend
pip install -r requirements.txt
python app.py

# Frontend (new terminal)
npm install
npm run dev
```

## 📋 How It Works

1. **Enter Credentials** - Provide your JIRA URL, email, API token, and Claude adoption date
2. **Fetch Data** - Automatically pulls all tasks from your JIRA project
3. **Analyze Performance** - Calculates hours per ticket using `(Due Date - Start Date) × 8 hours`
4. **View Results** - See productivity gains, cost savings, and ROI metrics

## 💡 Key Metrics Calculated

- **Time Savings %** - How much faster tasks are completed
- **Hours Saved** - Total engineering hours saved
- **Cost Savings** - Financial impact based on $100k/engineer assumption
- **Annual Projection** - Extrapolated yearly savings

## 🛠️ Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- Tailwind CSS + shadcn-ui
- Chart visualizations

**Backend:**
- Python Flask
- Pandas for data analysis
- JIRA REST API v3
- CSV-based data storage

## 📊 ROI Calculation Methodology

**Assumptions:**
- Engineer Annual Cost: $100,000
- Hours per Day: 8
- Hourly Rate: $50

**Formula:**
```
Hours per Task = (Due Date - Start Date) × 8 hours/day
Cost per Task = Hours × Hourly Rate
Time Savings = (Pre-Claude Avg - Post-Claude Avg) / Pre-Claude Avg × 100%
```

## 🔒 Security

- API tokens never stored on server
- Data processed locally
- Session-based storage only
- Recommended for internal/demo use

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Detailed installation and configuration
- [Backend API](./backend/README.md) - API endpoints and data flow
- [JIRA API Setup](./SETUP.md#jira-api-token-setup) - How to get your API token

## 🎯 Use Cases

- Demonstrate Claude Code ROI to stakeholders
- Analyze productivity improvements
- Calculate cost savings for procurement
- Track team velocity changes over time

## 🤝 Contributing

This is a demonstration project. Feel free to fork and customize for your needs.

## 📝 License

Demo project for Claude Code ROI calculation.

---

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/1b5a5b56-32f4-433c-a04f-497634133a20

This project was bootstrapped with Lovable and extended with Python backend for JIRA integration.
