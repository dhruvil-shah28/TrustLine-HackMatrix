# TrustLine Release Readiness

## Chosen hosting target

Render with a Dockerized web service and managed PostgreSQL. This matches the repo’s requirement for a single container that includes both Node.js and the Python/LightGBM runtime needed by the FCIRP inference path.

## Runtime architecture

- Web service: Dockerized Next.js app
- Database: managed PostgreSQL on Render
- ML runtime: Linux Python 3.x with `joblib`, `lightgbm`, `pandas`, and `numpy`
- Model artifact: packaged at `/app/models/fcirp/case_priority.pkl`
- Health check: `/api/health`

## Artifact packaging strategy

The actual FCIRP model artifact was located in the external local FCIRP project under `/home/dhruvil/Downloads/fcirp/models/case_priority.pkl` and is ~187 KB. It is small enough to package into the app repository in a stable location:

- `models/fcirp/case_priority.pkl`

This removes the dependency on a developer-specific absolute path while keeping the runtime deterministic in the container image.

## Required runtime variables

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `FCIRP_MODEL_PATH`
- `FCIRP_PYTHON`
- `ENABLE_DEMO_BOOTSTRAP`
- `DEMO_EMPLOYEE_PASSWORD`
- `DEMO_INVESTIGATOR_PASSWORD`

## Database and migration safety

- The existing local `trustline_db` remains untouched.
- The deployment database is managed separately and receives the Prisma migration via `npx prisma migrate deploy`.
- The app does not run destructive reset commands against the demo database.
- Demo bootstrap is only enabled by explicit deployment variables and remains idempotent.

## Authentication validation

PASS — verified in the current repo state:

- employee login succeeds using the actual seeded demo record
- investigator login succeeds with the cleared admin role
- invalid credentials are rejected
- tampered session tokens are rejected
- employee access to investigator-only APIs is denied
- session restoration works on the verified server-side session model

## Build status

PASS — verified locally with:

- `npx prisma generate`
- `npx tsc --noEmit`
- `npm run build`

## FCIRP runtime status

PASS in the current environment:

- the model artifact is available at a stable path inside the container image
- the model loads via `joblib`
- `lightgbm` and `pandas` are installed in the runtime image
- actual inference returns a real score and risk band

The scoring is still limited by the project’s documented FCIRP feature-provenance assumptions; this is not treated as a fabricated or heuristic result.

## Deployment status

LOCAL DEMO / STAGING READY: PASS

PUBLIC DEPLOYMENT: requires provider credentials and deployment secrets to be supplied in the hosting environment.

## Launch instructions

Local Docker image build:

```bash
docker build -t trustline:release-candidate .
```

Render deployment configuration is provided in `render.yaml` and the Docker image includes the required runtime, database migration command, and health endpoint.

## Remaining manual steps

- create a managed PostgreSQL database in Render
- attach `DATABASE_URL` to the service
- set `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `FCIRP_MODEL_PATH`, `FCIRP_PYTHON`, and demo bootstrap secrets in the Render dashboard
- deploy the GitHub branch connected to the repo
- verify `/api/health` and the login flows after the service starts

## Actual deployment URL

Not yet created because provider credentials / deployment access were not available in this environment.
