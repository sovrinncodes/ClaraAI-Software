# Clara AI — Integration & Architecture Reference

**CompletePropertyTech (CPT) | Data Centre MVP | v1.0**

This document is the authoritative reference for connecting Clara AI's API layer, ESG engine, real-time
subscriptions, and every AWS service the platform depends on. Read it cover to cover before integrating
any new service or building a new frontend screen.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Authentication & Tenant Isolation](#2-authentication--tenant-isolation)
3. [API Endpoint Reference](#3-api-endpoint-reference)
4. [ESG Engine — Internal Wiring](#4-esg-engine--internal-wiring)
5. [AWS Cognito — Identity & JWT](#5-aws-cognito--identity--jwt)
6. [AWS API Gateway — Edge Entry Point](#6-aws-api-gateway--edge-entry-point)
7. [AWS IoT Core — MQTT Telemetry Ingestion](#7-aws-iot-core--mqtt-telemetry-ingestion)
8. [AWS AppSync — Real-Time GraphQL Subscriptions](#8-aws-appsync--real-time-graphql-subscriptions)
9. [Amazon Timestream — Time-Series Telemetry](#9-amazon-timestream--time-series-telemetry)
10. [Amazon SageMaker — ML Model Endpoints](#10-amazon-sagemaker--ml-model-endpoints)
11. [Amazon RDS PostgreSQL — Relational Data & RLS](#11-amazon-rds-postgresql--relational-data--rls)
12. [Amazon S3 — Datasets & Report Artifacts](#12-amazon-s3--datasets--report-artifacts)
13. [AWS Fargate — Synthetic Telemetry Replay Engine](#13-aws-fargate--synthetic-telemetry-replay-engine)
14. [Amazon SES — Transactional Email](#14-amazon-ses--transactional-email)
15. [End-to-End Data Flow](#15-end-to-end-data-flow)
16. [Environment Variables Reference](#16-environment-variables-reference)
17. [Prisma Database Setup & RLS Policies](#17-prisma-database-setup--rls-policies)
18. [Synthetic Mode & Demo Data](#18-synthetic-mode--demo-data)

---

## 1. System Architecture Overview

Clara AI is a multi-tenant SaaS platform. Every piece of data belongs to a tenant. The architecture is
strictly separated into three trust zones:

```
┌──────────────────────────────────────────────────────────────────┐
│  PUBLIC INTERNET                                                  │
│  Browser → Next.js App (Vercel / ECS)                            │
│  Sensors / Replay Engine → AWS IoT Core (MQTT)                   │
└──────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  AWS EDGE / GATEWAY LAYER                                        │
│  Cognito User Pools  →  JWT token with tenant_id claim           │
│  API Gateway REST    →  JWT authoriser on every route            │
│  CloudFront          →  CDN for static assets                    │
└──────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                               │
│  Next.js App Router (app/) — server components + API routes      │
│  Lambda functions — inference orchestrator, report generator     │
│  Middleware (middleware.ts) — JWT validation + tenant injection  │
└──────────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                      │
│  RDS PostgreSQL + Row Level Security — relational records        │
│  Amazon Timestream — 15-minute telemetry time-series            │
│  AppSync + WebSocket — real-time dashboard subscriptions         │
│  SageMaker endpoints — 10 ML model inference                     │
│  S3 — raw datasets, report PDFs                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Key architectural invariant

**The `tenant_id` claim from the Cognito JWT is the single source of truth for data scoping.**
It is validated at three independent layers:
- API Gateway authoriser (before the request reaches application code)
- Next.js middleware (injects `x-tenant-id` header for all API routes)
- PostgreSQL Row Level Security (database-level isolation as a last line of defence)

No API route ever reads `tenant_id` from the request body or query parameters. The only exception is
the internal Lambda-to-Lambda call, which uses IAM role authentication instead of JWTs.

---

## 2. Authentication & Tenant Isolation

### How authentication works end-to-end

```
1. User logs in at /login
2. NextAuth.js redirects to Cognito Hosted UI (or passes credentials to Cognito)
3. Cognito issues an ID token containing:
      sub: "cognito-user-uuid"
      email: "user@example.com"
      custom:tenant_id: "cpt-tenant-id"
      custom:role: "FACILITY_MANAGER"
4. NextAuth stores this in an encrypted HTTP-only session cookie
5. On every subsequent request, middleware.ts reads the session cookie,
   decodes the JWT (via JWKS), and injects the x-tenant-id header
6. All API route handlers call extractTenantFromHeaders(request.headers)
   to get tenantId — they never read it from anywhere else
```

### NextAuth configuration (`lib/auth.ts`)

```typescript
// The JWT callback runs when a new token is created or refreshed.
// It copies the Cognito custom attributes into the NextAuth JWT payload.
jwt({ token, profile }) {
  if (profile) {
    token.tenantId = profile['custom:tenant_id']
    token.userRole = profile['custom:role'] ?? 'READ_ONLY'
  }
  return token
}

// The session callback exposes token data to useSession() in client components.
session({ session, token }) {
  session.user.tenantId = token.tenantId
  session.user.userRole = token.userRole
  return session
}
```

### Middleware JWT validation (`middleware.ts`)

The edge middleware runs before any API route or page. Its job is:
1. Check for a valid NextAuth session
2. Extract `tenantId` from the decoded JWT
3. Inject `x-tenant-id: <tenantId>` into the request headers
4. Redirect unauthenticated requests for `/(app)/*` to `/login`

```typescript
// Every API route reads tenant like this — no exceptions:
const tenantId = extractTenantFromHeaders(request.headers)
if (!tenantId) {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
}
```

### Cognito JWT custom attributes

You must create these custom attributes in the Cognito User Pool before any user can authenticate:

| Attribute Name | Type | Mutable | Description |
|---|---|---|---|
| `custom:tenant_id` | String | No | Assigned at user creation, never changed |
| `custom:role` | String | Yes | TENANT_ADMIN, FACILITY_MANAGER, READ_ONLY |

When creating a user via the Cognito Admin API or AWS Console:
```bash
aws cognito-idp admin-create-user \
  --user-pool-id <POOL_ID> \
  --username user@example.com \
  --user-attributes \
    Name=email,Value=user@example.com \
    Name=custom:tenant_id,Value=<TENANT_CUID> \
    Name=custom:role,Value=FACILITY_MANAGER \
  --temporary-password TempPass123! \
  --region af-south-1
```

---

## 3. API Endpoint Reference

All endpoints live under `/api/`. Every response has the envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Human-readable message" }
```

Authentication is required on every endpoint (enforced by middleware). The `tenantId` is always
derived from the session — never sent by the client.

---

### 3.1 Facilities

#### `GET /api/facilities`

Returns all facilities for the authenticated tenant.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `status` | `OPTIMAL \| WATCH \| ADVISORY \| CRITICAL` | Filter by current status |
| `type` | `DATA_CENTER \| MANUFACTURING \| COMMERCIAL \| LOGISTICS` | Filter by facility type |
| `search` | string | Partial match on name, city, or externalId |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "externalId": "JHB-DC-01",
      "name": "Johannesburg DC-1",
      "type": "DATA_CENTER",
      "status": "OPTIMAL",
      "city": "Johannesburg",
      "region": "Gauteng",
      "country": "ZA",
      "tierRating": "Tier III",
      "gridZone": "City Power G-3",
      "totalAreaSqm": 2400,
      "_count": { "assets": 42, "alerts": 3 }
    }
  ]
}
```

#### `GET /api/facilities/[facilityId]`

Returns a single facility with its assets and active alerts.

**Response includes:**
- Full facility record
- `assets`: All assets with their latest health score and alert count
- `alerts`: Up to 20 most recent active alerts (ordered by severity then createdAt)
- `_count.assets`: Total asset count

---

### 3.2 Assets

#### `GET /api/assets`

Returns assets across all facilities or filtered by criteria.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `facilityId` | string | Scope to one facility |
| `type` | AssetType | Filter by asset type (e.g. `CHILLER`) |
| `watchlist` | `true` | Only assets needing attention (health < 85 OR active alerts) |
| `search` | string | Partial match on name or externalId |

**Response:** Array of assets, each including:
- Latest `healthScores[0]` record (score, predictedTtfDays, faultType, vibrationRms, operatingLoad)
- `_count.alerts` active alert count

When `watchlist=true`, results are ordered by criticality (critical first) then ascending health score.

#### `GET /api/assets/[assetId]`

Returns a single asset with full detail for the Asset Detail screen.

**Response includes:**
- Full asset record with manufacturer, model, serialNumber, refrigerant
- `facility`: Parent facility name and externalId
- `healthScores`: Last 96 records (7 days at 15-min intervals) for the degradation chart
- `alerts`: Last 10 active alerts for the asset alert log panel

---

### 3.3 Alerts

#### `GET /api/alerts`

Returns alerts with flexible filtering.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `severity` | `CRITICAL \| ADVISORY \| WATCH \| INFO` | Filter by severity level |
| `status` | `ACTIVE \| ACKNOWLEDGED \| RESOLVED` | Filter by status |
| `facilityId` | string | Scope to one facility |
| `assetId` | string | Scope to one asset |
| `countsOnly` | `true` | Return only counts, not records |
| `limit` | number | Max records (default 50) |

When `countsOnly=true`, returns:
```json
{
  "success": true,
  "data": { "critical": 2, "advisory": 5, "watch": 8, "info": 3, "total": 18 }
}
```

#### `PATCH /api/alerts`

Updates an alert status.

**Request body:**
```json
{
  "alertId": "clx...",
  "action": "acknowledge"
}
```

`action` must be `"acknowledge"` or `"resolve"`. The route sets `acknowledgedAt` or `resolvedAt`
to the current UTC timestamp and updates the status field accordingly. Returns the updated alert record.

---

### 3.4 Health Scores

#### `GET /api/health-scores/[assetId]`

Returns health score history for the Health Degradation chart.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `days` | number | History window (default 7) |
| `latest` | `true` | Return only the single most recent record |

When `latest=true`, returns one object:
```json
{
  "success": true,
  "data": {
    "score": 82.4,
    "predictedTtfDays": 45,
    "faultType": "Stage 2 Compressor Shaft Bearing Wear",
    "faultConfidence": 0.894,
    "vibrationRms": 4.8,
    "operatingLoad": 0.88,
    "isoZone": "D",
    "recordedAt": "2026-05-29T08:00:00.000Z"
  }
}
```

When returning history, each record has the same shape. Records are ordered ascending by `recordedAt`
so they can be directly plotted on the chart timeline.

---

### 3.5 ESG Score

#### `GET /api/esg/score`

Computes or retrieves the ESG Insight Score for the tenant or a specific facility.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `facilityId` | string | Scope to one facility (omit for portfolio aggregate) |
| `refresh` | `true` | Force recomputation even if a cached score exists |

**How the score is computed:**

The API runs a pipeline with five stages:

1. **Fetch facilities** — All facilities in scope (or one if `facilityId` provided)
2. **Aggregate energy** — Sums `EnergyBaseline.actualKwh` records YTD; falls back to synthetic defaults if no records exist
3. **Fetch water** — Queries `WaterUsage` table for WUE and Scope 3 emissions
4. **Fetch asset health** — Calls `getAssetHealthSummary()` to get latest health score per asset
5. **Score engine** — Calls `computeEsgScore()` from `lib/esg/score-engine.ts`

The computed score is persisted to the `EsgScore` table before returning. If `refresh=false` and a
cached score exists (any age), it is returned immediately without recomputation.

**Response:**
```json
{
  "success": true,
  "data": {
    "tenantId": "clx...",
    "facilityId": null,
    "compositeScore": 74.2,
    "computedAt": "2026-05-29T08:00:00.000Z",
    "dimensions": [
      { "dimension": "energy_efficiency",        "label": "Energy Efficiency",       "score": 84.0, "weight": 0.30, "weightedScore": 25.2 },
      { "dimension": "carbon_performance",       "label": "Carbon Performance",      "score": 65.5, "weight": 0.20, "weightedScore": 13.1 },
      { "dimension": "equipment_sustainability", "label": "Equipment Sustainability","score": 91.0, "weight": 0.20, "weightedScore": 18.2 },
      { "dimension": "renewable_mix",            "label": "Renewable Energy Mix",    "score": 48.8, "weight": 0.15, "weightedScore": 7.3  },
      { "dimension": "water_efficiency",         "label": "Water Efficiency",        "score": 65.0, "weight": 0.10, "weightedScore": 6.5  },
      { "dimension": "operational_reliability",  "label": "Operational Reliability", "score": 87.0, "weight": 0.05, "weightedScore": 4.4  }
    ],
    "emissions": {
      "scope1Tco2e": 0,
      "scope2Tco2e": 8165.2,
      "scope3Tco2e": 0,
      "totalTco2e": 8165.2
    },
    "energyMetrics": {
      "totalKwh": 15768000,
      "renewableKwh": 6701400,
      "gridKwh": 9066600,
      "renewablePct": 42.5,
      "pueRatio": 1.24,
      "wueRatio": null,
      "energyIntensityKwhPerSqm": 6570
    },
    "periodStart": "2026-01-01T00:00:00.000Z",
    "periodEnd": "2026-05-29T08:00:00.000Z"
  }
}
```

---

### 3.6 ESG Report Generation

#### `POST /api/esg/report/generate`

Generates a structured ESG report for one facility and one reporting framework.

**Request body:**
```json
{
  "facilityId": "clx...",
  "framework": "GRI_305",
  "periodStart": "2026-01-01",
  "periodEnd": "2026-05-29",
  "reportName": "JHB DC-1 — GRI 305 Emissions Report Q1 2026"
}
```

**Supported frameworks:**

| Framework | Standard | Key Outputs |
|---|---|---|
| `GRI_302` | GRI 302 Energy | Consumption by type (MJ), intensity (kWh/m²), reduction vs baseline |
| `GRI_303` | GRI 303 Water | Withdrawal by source, cooling tower discharge, consumption, WUE |
| `GRI_305` | GRI 305 Emissions | Scope 1 direct, Scope 2 location/market-based, intensity, YoY reduction |
| `GHG_PROTOCOL` | GHG Protocol | Full Scope 1+2+3 breakdown, intensity per MWh/m²/employee |
| `ISO_50001` | ISO 50001 | Baseline vs reporting period, improvement %, top energy consumers |

**Response:** Full report payload specific to the chosen framework, plus the ESG score computed at
generation time.

---

## 4. ESG Engine — Internal Wiring

Understanding how the ESG engine layers connect is essential before modifying any calculation.

### Layer structure

```
lib/esg/emission-factors.ts   ← Physical constants (grid factors, GWP values)
         ↓ imported by
lib/esg/calculators.ts        ← Pure math (calcScope2, calcTotalEmissions, pueToScore...)
         ↓ imported by
lib/esg/score-engine.ts       ← Composite score (computeEsgScore, 6 dimensions)
         ↓ imported by
lib/esg/framework-adapters.ts ← Report formatters (buildGri305Report, buildGri303Report...)
         ↓ imported by
app/api/esg/score/route.ts    ← GET /api/esg/score
app/api/esg/report/generate/route.ts  ← POST /api/esg/report/generate
```

### How the score engine receives data

`computeEsgScore(inputs: ScoreEngineInputs)` accepts:

```typescript
interface ScoreEngineInputs {
  tenantId: string
  facilityId: string | null       // null = portfolio-level aggregate
  metrics: EnergyMetrics          // from calcEnergyMetrics()
  emissions: ScopeEmissions       // from calcTotalEmissions()
  yoyImprovementPct: number | null  // prior-year comparison (null in PoC)
  dataCompletePct: number         // 0-100, drives operational_reliability dimension
  assetHealthInputs?: AssetHealthInput[]  // from getAssetHealthSummary()
  periodStart: Date
  periodEnd: Date
}
```

### The asset health → ESG connection

This is the most important integration point from the research document.

`getAssetHealthSummary(tenantId, facilityIds)` queries the `assets` table joined with the latest
`health_scores` record per asset. It returns:

```typescript
{
  assetId: string,
  healthScore: number,      // e.g. 82.4 for CHL-01
  operatingLoad: number | null,  // e.g. 0.88 (88% of rated capacity)
  isCritical: boolean       // CHL-01 is isCritical=true → weighted 2×
}
```

`scoreEquipmentSustainability()` inside the engine receives this array and:
1. Computes a weighted-average health score (critical assets count double)
2. Applies an overload penalty for assets running above 80% load
3. Returns a 0–100 dimension score that feeds into the composite at 20% weight

**What this means in practice:** When CHL-01 degrades from 95% health to 82% health (as seeded),
the Equipment Sustainability dimension drops from ~95 to ~91, which lowers the composite score
by ~0.8 points. As CHL-01 approaches the 45-day predicted failure at ~40% health, the composite
score would fall by ~4–5 points — making the ESG score visibly responsive to predictive maintenance.

### Phase 2 upgrades for this dimension

Currently `operatingLoad` is the proxy for energy degradation. In Phase 2, replace the heuristic
with the PDF formula: `Energy Degradation = (current_kWh - baseline_kWh) / baseline_kWh`. This
requires per-asset energy sub-metering data from Timestream (queries by `assetId` dimension).

---

## 5. AWS Cognito — Identity & JWT

### Service role in Clara AI

Cognito is the sole identity provider. It issues the JWT that carries `tenant_id` — everything
downstream trusts this and nothing else.

### Setup steps

**Step 1 — Create a User Pool (af-south-1)**

```bash
aws cognito-idp create-user-pool \
  --pool-name ClaraAI-Users \
  --schema '[
    {"Name":"custom:tenant_id","AttributeDataType":"String","Mutable":false,"Required":false},
    {"Name":"custom:role","AttributeDataType":"String","Mutable":true,"Required":false}
  ]' \
  --auto-verified-attributes email \
  --username-attributes email \
  --mfa-configuration OFF \
  --region af-south-1
```

Save the `UserPoolId` from the response (format: `af-south-1_XXXXXXXXX`).

**Step 2 — Create an App Client**

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <UserPoolId> \
  --client-name ClaraAI-NextApp \
  --explicit-auth-flows ALLOW_USER_PASSWORD_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --generate-secret \
  --region af-south-1
```

Save the `ClientId` and `ClientSecret`. These go into `COGNITO_CLIENT_ID` and `COGNITO_CLIENT_SECRET`.

**Step 3 — Configure Hosted UI (optional but recommended for production)**

```bash
aws cognito-idp create-user-pool-domain \
  --domain claraai-auth \
  --user-pool-id <UserPoolId> \
  --region af-south-1
```

**Step 4 — Verify JWKS endpoint**

The JWKS (JSON Web Key Set) endpoint is used by `lib/aws/cognito.ts` to verify token signatures.
It is always at:
```
https://cognito-idp.<region>.amazonaws.com/<UserPoolId>/.well-known/jwks.json
```
Example:
```
https://cognito-idp.af-south-1.amazonaws.com/af-south-1_ABC123/.well-known/jwks.json
```

### How `lib/aws/cognito.ts` uses the JWKS

```typescript
// verifyCognitoToken() fetches the JWKS and verifies the JWT signature.
// It is called in middleware.ts for every request to an authenticated route.
const claims = await verifyCognitoToken(bearerToken)
const tenantId = extractTenantId(claims)  // reads claims['custom:tenant_id']
```

The middleware then injects `x-tenant-id: ${tenantId}` into the request so all downstream API route
handlers can call `extractTenantFromHeaders()` without re-verifying the JWT.

### NextAuth.js Cognito provider configuration

In `lib/auth.ts`, the Cognito provider is configured as an OIDC provider:

```typescript
CognitoProvider({
  clientId:     process.env.COGNITO_CLIENT_ID!,
  clientSecret: process.env.COGNITO_CLIENT_SECRET!,
  issuer: `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
})
```

The `issuer` URL must match exactly what is in the token's `iss` claim. If the region or pool ID
are wrong, every login will fail with an "invalid issuer" error.

---

## 6. AWS API Gateway — Edge Entry Point

### Role in Clara AI

In production, all client requests go through API Gateway before reaching the Next.js application.
API Gateway validates the Cognito JWT and rejects unauthenticated requests before any application
code runs.

### Authoriser setup

Create a Cognito User Pool Authoriser on your API Gateway:

```bash
aws apigateway create-authorizer \
  --rest-api-id <ApiId> \
  --name ClaraAI-CognitoAuth \
  --type COGNITO_USER_POOLS \
  --identity-source "method.request.header.Authorization" \
  --provider-arns "arn:aws:cognito-idp:af-south-1:<AccountId>:userpool/<UserPoolId>" \
  --region af-south-1
```

Then attach this authoriser to every resource and method in your API. The authoriser validates
the `Authorization: Bearer <token>` header before forwarding the request to the Lambda or container.

### Custom header injection

API Gateway should be configured to forward the validated `sub` and `custom:tenant_id` claims
as custom headers to the backend. In the Integration Request mapping template:

```
#set($claims = $context.authorizer.claims)
x-tenant-id: $claims.get("custom:tenant_id")
x-user-sub: $claims.get("sub")
x-user-role: $claims.get("custom:role")
```

This means the Next.js middleware can trust `x-tenant-id` completely — it was set by API Gateway
from a validated JWT, not by the client.

---

## 7. AWS IoT Core — MQTT Telemetry Ingestion

### What IoT Core does in Clara AI

Every sensor reading flows through AWS IoT Core. The synthetic telemetry replay engine (Fargate)
publishes to the same MQTT topics as real sensors would in Phase 2. IoT Core routes messages to
Lambda, which writes them to Timestream.

### Connection details

**Endpoint format:**
```
<prefix>-ats.iot.<region>.amazonaws.com
```

To get your endpoint:
```bash
aws iot describe-endpoint --endpoint-type iot:Data-ATS --region af-south-1
```

The response gives you the full endpoint hostname. Set this as `IOT_ENDPOINT` in your `.env.local`.

**Protocol and port:**
- MQTT over TLS: port 8883 (device SDKs, Fargate replay engine)
- MQTT over WebSocket: port 443 (browser clients, if needed for direct publishing)

### Certificate-based authentication

IoT Core uses X.509 certificates, not usernames/passwords. Each device (or the Fargate replay engine)
has its own certificate and private key.

**Create a certificate:**
```bash
aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile device-cert.pem \
  --public-key-outfile device-public.key \
  --private-key-outfile device-private.key \
  --region af-south-1
```

Set the paths in your environment:
```
IOT_CERTIFICATE_PATH=/path/to/device-cert.pem
IOT_PRIVATE_KEY_PATH=/path/to/device-private.key
```

You also need the AWS root CA certificate. Download it:
```bash
curl -o AmazonRootCA1.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem
```

### MQTT topic structure

All Clara AI topics follow this naming convention:

```
claraai/{tenant_id}/{facility_id}/{asset_id}/{sensor_type}
```

**Examples:**
```
claraai/cpt-tenant/jhb-dc-01/chl-01/vibration
claraai/cpt-tenant/jhb-dc-01/chl-01/temperature
claraai/cpt-tenant/jhb-dc-01/chl-01/pressure
claraai/cpt-tenant/jhb-dc-01/chl-01/energy
claraai/cpt-tenant/jhb-dc-01/pdu-01/power_quality
claraai/cpt-tenant/jhb-dc-01/+/telemetry      ← wildcard: all assets in facility
claraai/cpt-tenant/#                           ← wildcard: everything for tenant
```

**The `tenant_id` in the topic path is a second layer of isolation.** IoT Core policies are
configured so each device certificate is only allowed to publish to topics prefixed with its
own `tenant_id`. A rogue device cannot publish to another tenant's topics.

### MQTT message format

Every message on a telemetry topic is a JSON object:

```json
{
  "timestamp": "2026-05-29T08:00:00.000Z",
  "asset_id": "chl-01",
  "facility_id": "jhb-dc-01",
  "tenant_id": "cpt-tenant",
  "sensor_type": "vibration",
  "value": 4.8,
  "unit": "mm/s",
  "quality": 1
}
```

| Field | Type | Description |
|---|---|---|
| `timestamp` | ISO 8601 UTC | Measurement time — use sensor clock, not IoT Core ingest time |
| `asset_id` | string | Matches `Asset.externalId` in the database |
| `facility_id` | string | Matches `Facility.externalId` |
| `tenant_id` | string | Must match the certificate's authorised tenant |
| `sensor_type` | string | One of: `vibration`, `temperature`, `pressure`, `energy`, `flow`, `humidity` |
| `value` | number | Raw sensor value |
| `unit` | string | SI unit or custom unit string |
| `quality` | 0 or 1 | 0 = sensor fault or stale data, 1 = good |

### IoT Core rule — forward to Lambda

Create an IoT Rule that forwards all telemetry to the ingestion Lambda:

```bash
aws iot create-topic-rule \
  --rule-name ClaraAI_TelemetryIngestion \
  --topic-rule-payload '{
    "sql": "SELECT * FROM '\''claraai/#'\''",
    "actions": [
      {
        "lambda": {
          "functionArn": "arn:aws:lambda:af-south-1:<AccountId>:function:ClaraAI-TelemetryIngestion"
        }
      }
    ],
    "ruleDisabled": false
  }' \
  --region af-south-1
```

The Lambda function (not yet implemented in this repo) writes each message as a row in Amazon
Timestream under the `ClaraAI` database, `Telemetry` table.

### IoT Core policy for devices

Each device certificate needs an IoT Policy that restricts it to its own tenant's topics:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iot:Connect"],
      "Resource": "arn:aws:iot:af-south-1:<AccountId>:client/${iot:ClientId}"
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Publish"],
      "Resource": "arn:aws:iot:af-south-1:<AccountId>:topic/claraai/<TENANT_ID>/*"
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Subscribe"],
      "Resource": "arn:aws:iot:af-south-1:<AccountId>:topicfilter/claraai/<TENANT_ID>/#"
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Receive"],
      "Resource": "arn:aws:iot:af-south-1:<AccountId>:topic/claraai/<TENANT_ID>/*"
    }
  ]
}
```

Replace `<TENANT_ID>` with the actual tenant ID from your database. This ensures a Johannesburg
DC sensor can only publish to `claraai/cpt-tenant/*` — never to another tenant's topics.

### Publishing a test MQTT message

Using the AWS IoT Device SDK for Node.js:

```javascript
import { mqtt, io, iot } from 'aws-iot-device-sdk-v2'

const clientBootstrap = new io.ClientBootstrap()
const configBuilder = iot.AwsIotMqttConnectionConfigBuilder.new_mtls_builder_from_path(
  process.env.IOT_CERTIFICATE_PATH,
  process.env.IOT_PRIVATE_KEY_PATH
)
configBuilder.with_certificate_authority_from_path(undefined, 'AmazonRootCA1.pem')
configBuilder.with_clean_session(false)
configBuilder.with_client_id(`CHL-01-${Date.now()}`)
configBuilder.with_endpoint(process.env.IOT_ENDPOINT)

const client = new mqtt.MqttClient(clientBootstrap)
const connection = client.new_connection(configBuilder.build())

await connection.connect()

await connection.publish(
  `claraai/cpt-tenant/jhb-dc-01/chl-01/vibration`,
  JSON.stringify({
    timestamp: new Date().toISOString(),
    asset_id: 'chl-01',
    facility_id: 'jhb-dc-01',
    tenant_id: 'cpt-tenant',
    sensor_type: 'vibration',
    value: 4.8,
    unit: 'mm/s',
    quality: 1,
  }),
  mqtt.QoS.AtLeastOnce,
)
```

---

## 8. AWS AppSync — Real-Time GraphQL Subscriptions

### What AppSync does in Clara AI

AppSync provides WebSocket-based GraphQL subscriptions to the Next.js dashboard. When the ingestion
Lambda writes a new health score or alert to RDS, it also publishes a mutation to AppSync, which
pushes the change to all subscribed dashboard clients instantly.

### Configuration

Set these environment variables:
```
NEXT_PUBLIC_APPSYNC_ENDPOINT=https://<id>.appsync-api.af-south-1.amazonaws.com/graphql
NEXT_PUBLIC_APPSYNC_REGION=af-south-1
NEXT_PUBLIC_APPSYNC_API_KEY=da2-xxxxxxxxxxxxxxxxxxxx
```

The API key is for PoC only. In production, switch to Cognito-based authorisation for AppSync
(configure `authorizationType: AMAZON_COGNITO_USER_POOLS` on the GraphQL API).

### Subscription templates (`lib/aws/appsync.ts`)

Three subscriptions are defined as template strings:

**1. `SUBSCRIPTIONS.ON_ALERT_CREATED`**
```graphql
subscription OnAlertCreated($tenantId: String!) {
  onAlertCreated(tenantId: $tenantId) {
    id tenantId facilityId assetId
    severity status modelName title description
    predictedTtfDays createdAt
  }
}
```
Used by: `hooks/use-real-time-alerts.ts`

When a new CRITICAL or ADVISORY alert fires, this subscription delivers it to the dashboard
Live Alert Feed and triggers the full-width critical alert banner.

**2. `SUBSCRIPTIONS.ON_HEALTH_SCORE_UPDATED`**
```graphql
subscription OnHealthScoreUpdated($facilityId: String!) {
  onHealthScoreUpdated(facilityId: $facilityId) {
    id assetId score predictedTtfDays
    faultType faultConfidence vibrationRms
    operatingLoad recordedAt
  }
}
```
Used by: `hooks/use-facility-health.ts`

Drives the LAST SYNC timestamp in the header and refreshes the Asset Watchlist table without
a full page reload.

**3. `SUBSCRIPTIONS.ON_TELEMETRY_RECEIVED`**
```graphql
subscription OnTelemetryReceived($facilityId: String!) {
  onTelemetryReceived(facilityId: $facilityId) {
    assetId sensorType value unit timestamp facilityId
  }
}
```
Used by: `hooks/use-telemetry.ts`

Drives the 24H Telemetry Overview chart on the Portfolio Overview dashboard. New readings are
appended to the rolling 96-point buffer.

### Connecting to AppSync in the client

Using AWS Amplify (the recommended approach in `lib/aws/appsync.ts`):

```typescript
import { Amplify } from 'aws-amplify'
import { generateClient } from 'aws-amplify/api'

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT!,
      region: process.env.NEXT_PUBLIC_APPSYNC_REGION!,
      defaultAuthMode: 'apiKey',
      apiKey: process.env.NEXT_PUBLIC_APPSYNC_API_KEY!,
    }
  }
})

const client = generateClient()

// Subscribe to new alerts for the current tenant
const subscription = client.graphql({
  query: SUBSCRIPTIONS.ON_ALERT_CREATED,
  variables: { tenantId }
}).subscribe({
  next: ({ data }) => {
    const newAlert = data.onAlertCreated
    alertStore.getState().addAlert(newAlert)
  },
  error: (err) => console.error('AppSync subscription error:', err),
})

// Clean up on component unmount
return () => subscription.unsubscribe()
```

### AppSync resolver — publishing from Lambda

After the ingestion Lambda writes to RDS, it publishes to AppSync via a mutation. This triggers
the subscription for all connected clients:

```typescript
import { AppSyncClient, GraphqlCommand } from '@aws-sdk/client-appsync'

const client = new AppSyncClient({ region: 'af-south-1' })

// After creating a new alert record in RDS:
await client.send(new GraphqlCommand({
  apiId: process.env.APPSYNC_API_ID,
  operationName: 'CreateAlert',
  query: `
    mutation CreateAlert($input: AlertInput!) {
      onAlertCreated(
        tenantId: $input.tenantId,
        facilityId: $input.facilityId,
        assetId: $input.assetId,
        severity: $input.severity,
        title: $input.title,
        modelName: $input.modelName,
        createdAt: $input.createdAt
      ) { id }
    }
  `,
  variables: JSON.stringify({ input: newAlertRecord }),
}))
```

---

## 9. Amazon Timestream — Time-Series Telemetry

### What Timestream stores

All 15-minute sensor readings. This is the raw time-series data that feeds:
- The 24H Telemetry Overview chart
- The Vibration FFT spectrum (raw waveform data)
- The Energy Baseline comparisons
- Asset-level current telemetry panel

### Database structure

```
Timestream database: ClaraAI
  Table: Telemetry
    Dimensions:
      tenant_id     (string)
      facility_id   (string)
      asset_id      (string)
      sensor_type   (string — vibration, temperature, energy, pressure...)
    Measures:
      value         (double)
      quality       (bigint, 0 or 1)
    Time: timestamp (MILLISECONDS precision)
```

The key query pattern for the Telemetry Overview chart (24H aggregate per facility):

```sql
SELECT
  bin(time, 15m) AS interval,
  AVG(measure_value::double) AS avg_value,
  MAX(measure_value::double) AS max_value
FROM "ClaraAI"."Telemetry"
WHERE
  tenant_id = '<tenant_id>'
  AND facility_id = '<facility_id>'
  AND sensor_type = 'energy'
  AND time >= ago(24h)
GROUP BY bin(time, 15m)
ORDER BY interval ASC
```

The query pattern for the current telemetry panel (latest reading per sensor):

```sql
SELECT *
FROM "ClaraAI"."Telemetry"
WHERE
  tenant_id = '<tenant_id>'
  AND asset_id = 'chl-01'
  AND time >= ago(1h)
ORDER BY time DESC
LIMIT 10
```

### Querying from Next.js Lambda

```typescript
import { TimestreamQueryClient, QueryCommand } from '@aws-sdk/client-timestream-query'

const client = new TimestreamQueryClient({ region: 'af-south-1' })

const result = await client.send(new QueryCommand({
  QueryString: `
    SELECT bin(time, 15m) AS interval, AVG(measure_value::double) AS avg_kw
    FROM "ClaraAI"."Telemetry"
    WHERE tenant_id = '${tenantId}'
      AND facility_id = '${facilityId}'
      AND sensor_type = 'energy'
      AND time >= ago(24h)
    GROUP BY bin(time, 15m)
    ORDER BY interval ASC
  `
}))

// Parse the paged result
const rows = result.Rows?.map((row) => ({
  interval: row.Data?.[0]?.ScalarValue,
  avgKw: parseFloat(row.Data?.[1]?.ScalarValue ?? '0'),
}))
```

### Writing to Timestream (ingestion Lambda)

```typescript
import { TimestreamWriteClient, WriteRecordsCommand } from '@aws-sdk/client-timestream-write'

const writeClient = new TimestreamWriteClient({ region: 'af-south-1' })

await writeClient.send(new WriteRecordsCommand({
  DatabaseName: 'ClaraAI',
  TableName: 'Telemetry',
  Records: [
    {
      Dimensions: [
        { Name: 'tenant_id',   Value: message.tenant_id },
        { Name: 'facility_id', Value: message.facility_id },
        { Name: 'asset_id',    Value: message.asset_id },
        { Name: 'sensor_type', Value: message.sensor_type },
      ],
      MeasureName: 'value',
      MeasureValue: String(message.value),
      MeasureValueType: 'DOUBLE',
      Time: String(new Date(message.timestamp).getTime()),
      TimeUnit: 'MILLISECONDS',
    }
  ]
}))
```

---

## 10. Amazon SageMaker — ML Model Endpoints

### The ten Clara AI models

| # | User-Facing Name | Env Var Key | Input Shape | Output Shape |
|---|---|---|---|---|
| 1 | Failure Forecast | `SAGEMAKER_ENDPOINT_FAILURE_FORECAST` | Vibration time-series (96 points × 3 features) | `{ ruleRemainingDays, confidence }` |
| 2 | Fault Type Identifier | `SAGEMAKER_ENDPOINT_FAULT_TYPE_IDENTIFIER` | FFT magnitude array (1024 points) | `{ faultType, confidence }` |
| 3 | Energy Baseline | `SAGEMAKER_ENDPOINT_ENERGY_BASELINE` | Weather, occupancy, hour-of-week features | `{ baselineKwh }` |
| 4 | Energy Waste Detector | `SAGEMAKER_ENDPOINT_ENERGY_WASTE_DETECTOR` | Actual vs baseline time-series | `{ isAnomaly, deviationPct }` |
| 5 | Sound Health Monitor | `SAGEMAKER_ENDPOINT_SOUND_HEALTH_MONITOR` | Mel-spectrogram (128×128) | `{ healthScore, anomalyScore }` |
| 6 | Safe Operating Range | `SAGEMAKER_ENDPOINT_SAFE_OPERATING_RANGE` | Sensor readings vector (all current sensors) | `{ inRange, isoZone, violations }` |
| 7 | Clara AI Insights | `SAGEMAKER_ENDPOINT_CLARA_AI_INSIGHTS` | Alert context JSON | `{ insightText, actions }` |
| 8 | PUE Optimiser | `SAGEMAKER_ENDPOINT_PUE_OPTIMISER` | HVAC setpoints, IT load, outside temp | `{ optimalSetpoints, puePrediction }` |
| 9 | Hot Spot Tracker | `SAGEMAKER_ENDPOINT_HOT_SPOT_TRACKER` | Temperature sensor grid | `{ hotSpotCoords, severity }` |
| 10 | Power Quality Guard | `SAGEMAKER_ENDPOINT_POWER_QUALITY_GUARD` | Power waveform sample (4096 points) | `{ powerQualityScore, transientDetected }` |

### Invoking a model (`lib/aws/sagemaker.ts`)

`invokeModel()` accepts the user-facing model name and a payload:

```typescript
import { invokeModel, runFailureForecast } from '@/lib/aws/sagemaker'

// Generic invocation
const result = await invokeModel({
  modelName: 'Failure Forecast',
  payload: {
    assetId: 'chl-01',
    vibrationTimeSeries: [...96vibrationReadings],
    temperature: 42.1,
    operatingLoad: 0.88,
  }
})
// result: { modelName: 'Failure Forecast', output: {...}, latencyMs: 142 }

// Typed convenience wrapper
const forecast = await runFailureForecast({
  assetId: 'chl-01',
  vibrationTimeSeries: [...],
})
// Returns ruleRemainingDays and confidence directly
```

Internally, `invokeModel()` calls:
```typescript
const client = new SageMakerRuntimeClient({ region: process.env.AWS_REGION })
const command = new InvokeEndpointCommand({
  EndpointName: endpointName, // looked up from SAGEMAKER_ENDPOINT_* env vars
  ContentType: 'application/json',
  Body: Buffer.from(JSON.stringify(payload)),
})
const response = await client.send(command)
const output = JSON.parse(Buffer.from(response.Body!).toString())
```

### SageMaker endpoint naming convention

All endpoints follow the pattern `ClaraAI-<ModelKey>-<Environment>`:
```
ClaraAI-FailureForecast-dev
ClaraAI-FailureForecast-prod
ClaraAI-EnergyBaseline-dev
...
```

The env var maps user-facing model name to the endpoint:
```
SAGEMAKER_ENDPOINT_FAILURE_FORECAST=ClaraAI-FailureForecast-dev
```

### IAM permissions for SageMaker invocation

The Lambda execution role needs:
```json
{
  "Effect": "Allow",
  "Action": ["sagemaker:InvokeEndpoint"],
  "Resource": "arn:aws:sagemaker:af-south-1:<AccountId>:endpoint/ClaraAI-*"
}
```

### Inference orchestrator Lambda

The inference orchestrator runs as a Lambda function on a schedule (every 15 minutes, matching
the telemetry interval). It:

1. Reads the last 96 Timestream readings for each asset
2. Calls the appropriate SageMaker endpoints (at minimum: Failure Forecast, Fault Type Identifier, Safe Operating Range)
3. Writes the resulting `HealthScore` records to RDS via the Prisma client
4. Publishes any new alerts to AppSync
5. Triggers the Energy Baseline and Energy Waste Detector for the facility

```
CloudWatch Events (cron: every 15 min)
  → Lambda: ClaraAI-InferenceOrchestrator
    → Timestream: reads last 96 readings per asset
    → SageMaker: invokes Failure Forecast, Fault Type, Safe Operating Range
    → RDS (Prisma): writes HealthScore record
    → AppSync mutation: onHealthScoreUpdated
    → if health < 85: creates Alert record + AppSync mutation: onAlertCreated
```

---

## 11. Amazon RDS PostgreSQL — Relational Data & RLS

### Connection

The database is an RDS PostgreSQL 15 instance in the same VPC as the Lambda functions.
Never expose the RDS endpoint publicly. Use a VPC security group that only allows inbound
connections from:
- The Lambda security group
- The Next.js container security group
- A bastion host or AWS Cloud Shell (for migrations and seeding)

```
DATABASE_URL=postgresql://claraai_user:password@claraai.abc123.af-south-1.rds.amazonaws.com:5432/claraai
```

### Prisma client singleton

`lib/db/client.ts` exports a singleton:
```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

In Lambda functions (which are stateless), you should configure the Prisma Data Proxy or use
connection pooling via pgBouncer to avoid exhausting RDS connection limits.

### Running migrations

```bash
# First migration (creates all tables)
npx prisma migrate dev --name init

# After schema changes (adds ESG and water tables)
npx prisma migrate dev --name add-esg-score-water-gri305-303

# Seed demo data
npx prisma db seed
```

For production:
```bash
npx prisma migrate deploy  # runs all pending migrations without prompting
```

### Row Level Security policies

After every migration, apply RLS policies. These are the database-level last line of defence:

```sql
-- Enable RLS on every tenant-scoped table
ALTER TABLE facilities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_baselines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_scores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_usage       ENABLE ROW LEVEL SECURITY;

-- Template policy: repeat for each table above.
-- Replace 'facilities' with each table name.
CREATE POLICY tenant_isolation_facilities ON facilities
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- In Prisma middleware, set the tenant context at the start of every transaction:
-- SET LOCAL app.current_tenant_id = '<tenant_id_from_jwt>';
```

### Setting the tenant context in Prisma

Add this Prisma middleware in `lib/db/client.ts` for maximum isolation:

```typescript
prisma.$use(async (params, next) => {
  const tenantId = getTenantIdFromAsyncLocalStorage() // set by middleware
  if (tenantId) {
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.current_tenant_id = '${tenantId}'`
    )
  }
  return next(params)
})
```

This ensures that even if application code forgets to include `WHERE tenantId = ...`,
the RLS policy will silently filter the rows.

---

## 12. Amazon S3 — Datasets & Report Artifacts

### Two buckets

**`S3_BUCKET_DATASETS`** — Contains the PoC public datasets:
```
s3://claraai-datasets/
  ASHRAE/          ← HVAC energy data
  UNSW-bearing/    ← Bearing fault vibration data
  LBNL-HVAC/       ← HVAC time-series
  MIMII/           ← Machine sound data
```

The Fargate replay engine reads from this bucket and replays the data as MQTT messages.

**`S3_BUCKET_REPORTS`** — Contains generated ESG report PDFs:
```
s3://claraai-reports/{tenant_id}/{report_id}.pdf
```

Pre-signed URLs are generated when a client requests a PDF download. The URL expires after 15 minutes.

### Pre-signed URL generation for report downloads

```typescript
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({ region: process.env.AWS_REGION })

export async function getReportDownloadUrl(reportId: string, tenantId: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_REPORTS!,
    Key: `${tenantId}/${reportId}.pdf`,
  })
  return getSignedUrl(s3, command, { expiresIn: 900 }) // 15 minutes
}
```

---

## 13. AWS Fargate — Synthetic Telemetry Replay Engine

### What it does

The Fargate service runs a long-lived container that reads public datasets from S3 and replays
them as MQTT messages to IoT Core at configurable speed. In PoC mode, this is the sole source
of telemetry. In production, it is replaced by real hardware sensors.

### Environment variables for the Fargate task

```bash
IOT_ENDPOINT=<your-endpoint>-ats.iot.af-south-1.amazonaws.com
IOT_CERTIFICATE_PATH=/run/secrets/device-cert.pem
IOT_PRIVATE_KEY_PATH=/run/secrets/device-private.key
S3_BUCKET_DATASETS=claraai-datasets
REPLAY_SPEED=1.0          # 1.0 = real time, 10.0 = 10× accelerated
TENANT_ID=cpt-tenant
FACILITY_ID=jhb-dc-01
```

### Replay logic

```
Read dataset files from S3 (ASHRAE energy, UNSW bearing, LBNL HVAC)
For each 15-minute timestep:
  For each asset in scope:
    Construct MQTT message from dataset row
    Publish to claraai/{tenant_id}/{facility_id}/{asset_id}/{sensor_type}
    Sleep REPLAY_INTERVAL / REPLAY_SPEED seconds
```

Setting `REPLAY_SPEED=48` means 24 hours of data plays in 30 minutes — useful for demonstrating
the health degradation curve to investors without waiting real time.

---

## 14. Amazon SES — Transactional Email

### What triggers email

- A CRITICAL alert is created → immediate email to TENANT_ADMIN and FACILITY_MANAGER users
- A weekly ESG digest is generated → emailed every Monday 08:00 UTC
- A work order is assigned → email to the assignee

### Sending via SES

```typescript
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'

const ses = new SESv2Client({ region: process.env.AWS_REGION })

await ses.send(new SendEmailCommand({
  FromEmailAddress: process.env.SES_FROM_EMAIL!, // noreply@claraai.com
  Destination: { ToAddresses: ['manager@tenant.co.za'] },
  Content: {
    Simple: {
      Subject: { Data: `⚠️ CRITICAL Alert: ${alert.title}` },
      Body: {
        Html: { Data: buildAlertEmailHtml(alert) },
        Text: { Data: buildAlertEmailText(alert) },
      }
    }
  }
}))
```

SES requires the `SES_FROM_EMAIL` address to be verified in the SES console before it can send.
For PoC, verify a single address. For production, verify the entire domain and configure DKIM.

---

## 15. End-to-End Data Flow

This section traces a single vibration spike event — the CHL-01 bearing fault scenario — from
raw sensor data all the way to the dashboard.

### Phase 1: Telemetry ingestion

```
1. Fargate Replay Engine reads UNSW bearing fault dataset from S3
2. Constructs MQTT message:
   {
     timestamp: "2026-05-29T08:00:00Z",
     asset_id: "chl-01", facility_id: "jhb-dc-01",
     sensor_type: "vibration", value: 4.8, unit: "mm/s"
   }
3. Publishes to: claraai/cpt-tenant/jhb-dc-01/chl-01/vibration
4. IoT Core receives message, evaluates rule "ClaraAI_TelemetryIngestion"
5. Rule triggers Lambda: ClaraAI-TelemetryIngestion
6. Lambda writes row to Timestream: ClaraAI.Telemetry
```

### Phase 2: Inference (runs every 15 minutes)

```
7. CloudWatch cron triggers Lambda: ClaraAI-InferenceOrchestrator
8. Orchestrator queries Timestream for last 96 vibration readings of chl-01
9. Calls SageMaker: Failure Forecast endpoint
   Input:  96-point vibration time-series + temperature + load
   Output: { ruleRemainingDays: 45, confidence: 0.85 }
10. Calls SageMaker: Fault Type Identifier endpoint
    Input:  FFT magnitude array computed from vibration waveform
    Output: { faultType: "Stage 2 Compressor Shaft Bearing Wear", confidence: 0.894 }
11. Calls SageMaker: Safe Operating Range endpoint
    Input:  All current sensor readings for chl-01
    Output: { inRange: false, isoZone: "D", violations: ["vibration > 4.5mm/s"] }
```

### Phase 3: Write back to RDS

```
12. Orchestrator creates HealthScore record via Prisma:
    {
      tenantId: "cpt-...",
      assetId: "chl-01-id",
      score: 82.4,
      predictedTtfDays: 45,
      faultType: "Stage 2 Compressor Shaft Bearing Wear",
      faultConfidence: 0.894,
      vibrationRms: 4.8,
      operatingLoad: 0.88,
      isoZone: "D"
    }
13. Because score < 85 and health is declining, orchestrator creates Alert record:
    {
      severity: "ADVISORY",
      modelName: "Failure Forecast",
      title: "Bearing Degradation Detected — CHL-01",
      predictedTtfDays: 45,
      recommendation: "Reduce load to <70% to extend TTF by ~14 days"
    }
```

### Phase 4: Real-time push to dashboard

```
14. Orchestrator publishes AppSync mutation: onHealthScoreUpdated
15. AppSync pushes to all clients subscribed to facilityId = "jhb-dc-01"
16. Dashboard hook useRealTimeAlerts() receives the new alert
17. Zustand alert store is updated via addAlert()
18. React re-renders:
    - Live Alert Feed shows new advisory entry
    - Asset Watchlist table re-sorts CHL-01 to the top
    - LAST SYNC timestamp in header updates to 08:00:15 UTC
19. If alert is CRITICAL, full-width critical alert banner renders
```

### Phase 5: ESG score update

```
20. On next GET /api/esg/score?refresh=true (or on a scheduled basis):
21. getAssetHealthSummary() reads CHL-01 HealthScore: 82.4 (critical, isCritical=true)
22. scoreEquipmentSustainability() computes:
    - Critical weight: 2× → weighted health of CHL-01 pulls portfolio down
    - Equipment Sustainability dimension: 91.0 (vs 95 before spike)
23. Composite ESG score drops slightly, persisted to EsgScore table
24. Dashboard ESG Insight Score KPI card shows updated composite on next refresh
```

---

## 16. Environment Variables Reference

Create `.env.local` from `.env.example` and fill in every value before starting the server.
The table below explains what each variable does and what happens if it is missing.

| Variable | Required | Description | Missing behaviour |
|---|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string | All API routes fail with Prisma connection error |
| `AWS_REGION` | Yes | AWS region (af-south-1 for SA) | AWS SDK calls fail |
| `AWS_ACCESS_KEY_ID` | Yes | AWS IAM access key ID | AWS SDK calls fail |
| `AWS_SECRET_ACCESS_KEY` | Yes | AWS IAM secret key | AWS SDK calls fail |
| `COGNITO_USER_POOL_ID` | Yes | Cognito pool (format: region_XXXXXXXXX) | JWT verification fails |
| `COGNITO_CLIENT_ID` | Yes | App client ID | Login flow fails |
| `COGNITO_CLIENT_SECRET` | Yes | App client secret | Login flow fails |
| `NEXT_PUBLIC_COGNITO_USER_POOL_ID` | Yes | Same as above, exposed to browser | Login page cannot redirect to Cognito |
| `NEXT_PUBLIC_COGNITO_CLIENT_ID` | Yes | Same as above, exposed to browser | Login page cannot redirect to Cognito |
| `NEXTAUTH_URL` | Yes | Base URL of the app | Redirect loops after login |
| `NEXTAUTH_SECRET` | Yes | 32-byte random string for session encryption | Sessions cannot be created |
| `NEXT_PUBLIC_APPSYNC_ENDPOINT` | No | AppSync GraphQL endpoint URL | Real-time features disabled (falls back to synthetic) |
| `NEXT_PUBLIC_APPSYNC_REGION` | No | AppSync region | Real-time features disabled |
| `NEXT_PUBLIC_APPSYNC_API_KEY` | No | AppSync API key | Real-time features disabled |
| `IOT_ENDPOINT` | No | IoT Core MQTT endpoint hostname | MQTT publishing disabled |
| `IOT_CERTIFICATE_PATH` | No | Path to device X.509 certificate file | MQTT auth fails |
| `IOT_PRIVATE_KEY_PATH` | No | Path to device private key file | MQTT auth fails |
| `SAGEMAKER_ENDPOINT_FAILURE_FORECAST` | No | SageMaker endpoint name | ML inference disabled (PoC uses seed data) |
| `SAGEMAKER_ENDPOINT_FAULT_TYPE_IDENTIFIER` | No | SageMaker endpoint name | ML inference disabled |
| `SAGEMAKER_ENDPOINT_ENERGY_BASELINE` | No | SageMaker endpoint name | ML inference disabled |
| `SAGEMAKER_ENDPOINT_ENERGY_WASTE_DETECTOR` | No | SageMaker endpoint name | ML inference disabled |
| `SAGEMAKER_ENDPOINT_SOUND_HEALTH_MONITOR` | No | SageMaker endpoint name | ML inference disabled |
| `SAGEMAKER_ENDPOINT_SAFE_OPERATING_RANGE` | No | SageMaker endpoint name | ML inference disabled |
| `SAGEMAKER_ENDPOINT_PUE_OPTIMISER` | No | SageMaker endpoint name | ML inference disabled |
| `SAGEMAKER_ENDPOINT_HOT_SPOT_TRACKER` | No | Feature-flagged (see below) | ML inference disabled |
| `SAGEMAKER_ENDPOINT_POWER_QUALITY_GUARD` | No | SageMaker endpoint name | ML inference disabled |
| `S3_BUCKET_DATASETS` | No | Bucket for raw datasets | Fargate replay engine cannot read datasets |
| `S3_BUCKET_REPORTS` | No | Bucket for generated PDFs | Report downloads fail |
| `SES_FROM_EMAIL` | No | Verified SES sender address | Email alerts disabled |
| `NEXT_PUBLIC_ENABLE_ACOUSTIC_MONITOR` | No | Feature flag for Sound Health Monitor | Feature hidden in UI |
| `NEXT_PUBLIC_ENABLE_HOT_SPOT_TRACKER` | No | Feature flag for Hot Spot Tracker | Feature hidden in UI |
| `NEXT_PUBLIC_SYNTHETIC_MODE` | Yes | `true` during PoC — uses mock data | If false with no AWS services, dashboard is empty |

### Generating NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

---

## 17. Prisma Database Setup & RLS Policies

### Complete setup sequence

```bash
# 1. Install dependencies
npm install

# 2. Create the database (as postgres superuser)
createdb claraai

# 3. Create a dedicated application user (never use postgres directly)
psql -c "CREATE USER claraai_user WITH PASSWORD 'strong-password';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE claraai TO claraai_user;"
psql claraai -c "GRANT ALL ON SCHEMA public TO claraai_user;"

# 4. Run all pending migrations
DATABASE_URL=postgresql://claraai_user:strong-password@localhost:5432/claraai \
  npx prisma migrate deploy

# 5. Apply RLS policies (run as superuser since claraai_user cannot ALTER TABLE)
psql claraai -U postgres -f scripts/apply-rls.sql

# 6. Seed demo data
DATABASE_URL=postgresql://claraai_user:strong-password@localhost:5432/claraai \
  npx prisma db seed
```

### `scripts/apply-rls.sql`

Create this file:

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE facilities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets            ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores     ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_baselines  ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports       ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_scores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_usage       ENABLE ROW LEVEL SECURITY;

-- Policies use current_setting which is SET by Prisma middleware per transaction
-- The 'true' second argument means: return NULL (not error) if setting not found
CREATE POLICY tenant_isolation ON facilities
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON assets
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON health_scores
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON alerts
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON energy_baselines
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON esg_reports
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON esg_scores
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

CREATE POLICY tenant_isolation ON water_usage
  USING (tenant_id = current_setting('app.current_tenant_id', true)::text);

-- Grant claraai_user permission to bypass RLS when needed for admin tasks
-- (only for the application superuser account, not the regular user)
-- ALTER USER claraai_superuser BYPASSRLS;
```

---

## 18. Synthetic Mode & Demo Data

### What synthetic mode is

When `NEXT_PUBLIC_SYNTHETIC_MODE=true`, the application uses static JavaScript data instead of
making API calls. This means the full dashboard can be demonstrated without any AWS services,
database, or running backend. It is the default for investor demos and local development.

### Where mock data lives

**`lib/data/seed.ts`** — Client-side JavaScript constants used by hooks in synthetic mode:

| Export | Description |
|---|---|
| `DEMO_FACILITIES` | 4 facilities (JHB DC-1, CPT MFG, PTA HQ, DBN LOG) with all KPIs |
| `DEMO_CHL01` | Full CHL-01 asset object with health score, fault data, telemetry |
| `DEMO_WATCHLIST_ASSETS` | 4 assets needing attention |
| `DEMO_ALERTS` | 6 live alerts across severity levels |
| `PORTFOLIO_KPIS` | Dashboard KPI card values including ESG score 78.4 |
| `CHL01_HEALTH_CURVE` | 13-point degradation curve (7 historical + 6 predicted) |
| `TELEMETRY_24H` | 96 × 15-min energy readings with realistic daily load pattern |

### How hooks switch between real and synthetic

Every data hook checks the feature flag at runtime:

```typescript
// hooks/use-facilities.ts (simplified)
const isSynthetic = process.env.NEXT_PUBLIC_SYNTHETIC_MODE === 'true'

export function useFacilities(filters?: FacilityFilters) {
  return useQuery({
    queryKey: ['facilities', filters],
    queryFn: async () => {
      if (isSynthetic) {
        // Return filtered demo data immediately — no network call
        return filterDemoFacilities(DEMO_FACILITIES, filters)
      }
      const res = await fetch('/api/facilities?' + buildQueryString(filters))
      const json = await res.json()
      if (!json.success) throw new Error(json.error)
      return json.data
    },
    staleTime: 30_000, // 30 seconds
  })
}
```

Real-time hooks (alerts, health, telemetry) use `setInterval` in synthetic mode to simulate
live updates every 15–60 seconds.

### Switching off synthetic mode

To point the dashboard at real AWS services:
1. Set `NEXT_PUBLIC_SYNTHETIC_MODE=false` in `.env.local`
2. Ensure all required env vars in Section 16 are populated
3. Ensure Cognito users exist with `custom:tenant_id` matching a tenant in RDS
4. Ensure at least one facility has energy baseline records and at least one asset has a health score

If any of these prerequisites are missing, the specific API calls will fail and the hooks will
show empty states — they will not fall back to synthetic data.

---

*End of Clara AI Integration & Architecture Reference. Questions or corrections: open an issue or
contact the CPT platform engineering team.*
