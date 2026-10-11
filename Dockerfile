FROM node:20-bookworm-slim AS base

ENV NODE_ENV=production \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PUPPETEER_SKIP_DOWNLOAD=true \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv build-essential libgomp1 && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev=false

COPY prisma ./prisma
COPY src ./src
COPY public ./public
COPY next.config.mjs .
COPY tsconfig.json .
COPY next-env.d.ts .
COPY .env.example ./.env.example

RUN npx prisma generate

RUN mkdir -p /app/models/fcirp
COPY models/fcirp/case_priority.pkl /app/models/fcirp/case_priority.pkl

RUN python3 -m venv /opt/fcirp-venv && \
    /opt/fcirp-venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/fcirp-venv/bin/pip install --no-cache-dir joblib lightgbm pandas numpy scikit-learn==1.8.0
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV FCIRP_MODEL_PATH=/app/models/fcirp/case_priority.pkl
ENV FCIRP_PYTHON=/opt/fcirp-venv/bin/python

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start -- --hostname 0.0.0.0 -p ${PORT:-3000}"]
