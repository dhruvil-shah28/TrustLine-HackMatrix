# TRUSTLINE

TRUSTLINE is a financial crime and insider-risk intelligence platform built to help investigation teams connect employee behavior, privilege changes, customer activity, and money movement into one evidence-based workflow. The solution is designed for regulated financial environments where suspicious activity needs to be explained quickly, correlated clearly, and reviewed with audit-ready traceability.

The project combines a modern dashboard, graph-based transaction analysis, alert investigation workflows, and an evidence-driven AI copilot. It is implemented as a Next.js application backed by PostgreSQL and Prisma, with synthetic but realistic financial datasets for fraud, AML, and insider-risk scenarios.

## Overview

This repository contains a full-stack investigation platform with the following capabilities:

- Live risk and alert monitoring
- Money-flow graph analysis for circular and layered transaction patterns
- Insider-risk correlation across employee access, privileges, and recent actions
- Case management and audit logging for investigation teams
- Detection lab evaluations for suspicious and legitimate scenarios
- Counterfactual simulation to assess the impact of removing or modifying records
- A guided investigation copilot that retrieves evidence from the database and provides explainable answers

The product is aimed at financial institutions, AML operations teams, internal audit groups, and compliance organizations that need to investigate suspicious activity without relying on fragmented systems or disconnected evidence.

## Core Product Capabilities

### Risk Intelligence Dashboard

The dashboard surfaces active alerts, case severity, exposure values, and investigation readiness. It gives investigators a high-level view of current risk posture and directs them to high-priority cases and suspicious transaction flows.

### Alert Investigation Workspace

Each alert includes a structured summary, linked evidence, risk explanation, recommended actions, and supporting signals. Investigators can review the alert context and navigate to deeper case details and graph relationships.

### Graph Analysis and Relationship Mapping

The graph interface visualizes transactions and entities such as customer accounts, employees, and suspicious alerts. It helps uncover hidden relationships, circular transfers, and abnormal connectivity in a way that is easier to communicate during review and escalation.

### Detection Lab

The detection lab evaluates scenarios using rule-based and anomaly-driven checks. It simulates suspicious events, compares expected versus observed values, and benchmarks results against legitimate controls. This helps validate why a transaction or employee profile was classified as risky.

### Counterfactual Simulation

The counterfactual engine allows investigators to test what happens if a record is excluded, modified, or time-shifted. This is useful for understanding whether particular evidence is driving a result and for explaining the impact of alternative hypotheses.

### Evidence-Grounded Copilot

The AI-assisted investigation view uses retrieved evidence from transactions, access logs, employee actions, and graph relationships to answer questions with supporting references. This reduces time spent searching across disconnected systems while keeping reasoning grounded in the underlying data.

## Technology Stack

- Frontend: Next.js 16, React, TypeScript, CSS
- Backend and data access: Next.js API routes, Prisma ORM
- Database: PostgreSQL
- Authentication: Clerk integration for user flows
- Visualization: React Flow and Recharts
- AI support: OpenAI API integration for copilot synthesis, with deterministic fallback logic
- Testing and validation: TSX-based detection checks and build scripts

## Project Structure

The repository is organized as follows:

- src/app: application routes, pages, and API endpoints
- src/components: reusable UI components and landing-page sections
- src/context: application state and auth providers
- src/lib: detection engine, counterfactual simulation, evidence logic, and supporting utilities
- prisma: Prisma schema and seed data
- scripts: operational and validation scripts
- public: static assets
- tests: test and validation coverage used by the project

## Data Model

The application models the core financial risk graph using entities such as:

- Employees
- Customers
- Accounts
- Transactions
- Access events
- Employee actions
- Alerts
- Cases
- Evidence items
- Audit logs
- Scenarios

This model supports traceability from a transaction or access event to broader account relationships, employee behavior, and case-level decisions.

## Local Development Setup

### Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- PostgreSQL 14 or newer

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Create a local `.env` file from the example template:

```bash
cp .env.example .env
```

Update the file with your PostgreSQL connection and local app URL:

```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/trustline_db?schema=public"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="replace-with-a-long-random-secret"
```

Optional:

```env
OPENAI_API_KEY="your-openai-api-key"
```

### 3. Set up the database

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

The seed script populates the database with realistic investigation scenarios, employee profiles, customer accounts, alerts, and transactions.

### 4. Run the app

```bash
npm run dev
```

Then open:

http://localhost:3000

## Demo Access

The project includes a demo investigation workflow for an example analyst. The app supports a login flow and demo workspace experience so investigators can quickly enter the platform without configuring a full external identity system.

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run prisma:generate
npm run prisma:push
npm run seed
npm test
```

### Script behavior

- `npm run dev`: starts the local development server
- `npm run build`: runs Prisma generation and Next.js production build
- `npm run start`: serves the production build
- `npm run seed`: seeds the database with demo scenario data
- `npm test`: runs the project detection engine verification script

## Production Deployment

For production deployment, ensure the following are configured:

- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `JWT_SECRET`
- Optional `OPENAI_API_KEY` for AI-assisted copilot output

Typical deployment targets include Vercel, Render, AWS, or other managed Node.js hosting providers. The application is designed to run as a Next.js server application with database-backed API routes and Prisma client generation.

## Security and Data Handling

This project is built for demonstration, research, and structured proof-of-concept usage. It uses synthetic or generated financial data rather than real customer or bank account information. The platform is designed to emphasize investigation workflow and risk detection rather than handle production-grade banking data.

The application includes audit logging, structured evidence references, and review workflows to support compliance-minded investigation practices.

## Validation and Detection Engineering

The repository includes a detection engine that evaluates several rule categories and alert scenarios, including:

- Circular money flow detection
- Structuring and threshold-based red flags
- Insider access anomalies
- Privilege override patterns
- Baseline deviation checks
- Transaction and employee behavior correlation

The detection check script validates that suspicious scenarios are correctly detected while legitimate controls remain non-triggering under the benchmark conditions.

## Summary

TRUSTLINE represents a complete prototype for modern financial crime investigation. It is designed to help teams move from fragmented alerts to a connected, explainable, and evidence-backed operational workflow. The project combines analytics, investigation tooling, graph intelligence, and a practical UI to support AML and insider-risk review processes in a single application.
