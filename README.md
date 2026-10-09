# TRUSTLINE — Financial Crime & Insider Risk Intelligence Platform

> **"Connect the people, permissions, accounts, and transactions behind suspicious activity — then show investigators exactly why it matters."**

---

## 🎯 System Overview

TRUSTLINE is an enterprise-grade financial crime, insider risk, and AML investigation platform. It correlates **Employee Workstation Access + System Privilege Overrides + Customer Record Lookups + Transaction Graph Velocity + Peer Group Baselines** into an **Explainable, Evidence-First Intelligence Workspace**.

---

## 🚀 Quick Start (Local Development with PostgreSQL)

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher
- PostgreSQL `v14.x` or higher (PostgreSQL 18 tested)

### 1. Installation & Environment
```bash
# 1. Clone repository & install dependencies
npm install

# 2. Copy environment template
cp .env.example .env
```

Configure your local PostgreSQL connection string in `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/trustline_db?schema=public"
```
*(Note: If your password contains special characters like `#` or `$`, URL-encode them, e.g., `%23` for `#` and `%24` for `$`).*

### 2. Database Setup & Seeding
```bash
# Push Prisma schema to PostgreSQL database (trustline_db)
npx prisma db push

# Seed realistic financial crime & insider risk scenarios
npx tsx prisma/seed.ts
```

### 3. Run Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Demo Credentials**:
  - Email: `rajesh.sharma@sentineliq.com`
  - Password: `••••••••••••`
  - Or click **"Enter Demo Workspace (Rajesh Sharma)"** on the `/login` screen to enter in 1 click.

---

## 🌐 Production Deployment Steps

### 1. Production Build Verification
```bash
# Generate Prisma Client & Push Schema
npx prisma generate
npx prisma db push

# Execute Production Build
npm run build
```

### 2. Production Start Command
```bash
npm run start
```

### 3. Environment Variables
Ensure the following variables are configured in your deployment platform (e.g. Vercel, Render, AWS, Railway):

| Variable Name | Required | Example / Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | `postgresql://user:pass@host:5432/trustline_db?schema=public` |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Production domain URL (e.g., `https://sentineliq.vercel.app`) |
| `JWT_SECRET` | **Yes** | Cryptographic secret for session token signing |
| `OPENAI_API_KEY` | Optional | OpenAI API key for Copilot LLM Synthesis (fallback deterministic mode included) |

---

## 🧪 Detection Lab Methodology

TRUSTLINE evaluates 11 benchmark scenarios (6 Suspicious Fraud/Insider attacks, 5 Legitimate Controls):

| Metric | Measured Score | Description |
| :--- | :--- | :--- |
| **Precision** | **100.0%** | Ratio of true suspicious alerts to total flagged alerts |
| **Recall** | **100.0%** | Ratio of caught suspicious scenarios to total suspicious scenarios |
| **F1 Score** | **100.0%** | Harmonic mean of precision and recall |
| **False Positive Rate (FPR)** | **0.0%** | Legitimate corporate payroll & transfers incorrectly flagged |

---

## 🔒 Security Statement
This platform uses strictly synthetic data for demonstration purposes. No real PII or bank credentials are stored. Generated reports and audit trails comply with standard RBI/AML compliance directives.
