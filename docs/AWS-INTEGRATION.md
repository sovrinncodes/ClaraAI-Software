# Clara AI — AWS Integration Guide
**Step-by-step provisioning for every AWS service used in the platform**

> Region for all services: **`af-south-1` (Cape Town)** unless noted otherwise.
> Estimated setup time: 4–6 hours for a complete PoC environment.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [IAM — Roles and Policies](#2-iam--roles-and-policies)
3. [Amazon Cognito — Authentication](#3-amazon-cognito--authentication)
4. [Amazon RDS — PostgreSQL Database](#4-amazon-rds--postgresql-database)
5. [Amazon S3 — Storage Buckets](#5-amazon-s3--storage-buckets)
6. [AWS IoT Core — Telemetry Ingestion](#6-aws-iot-core--telemetry-ingestion)
7. [Amazon Timestream — Time-Series Data](#7-amazon-timestream--time-series-data)
8. [Amazon SageMaker — ML Model Endpoints](#8-amazon-sagemaker--ml-model-endpoints)
9. [AWS AppSync — GraphQL + WebSockets](#9-aws-appsync--graphql--websockets)
10. [AWS Lambda — API Handlers](#10-aws-lambda--api-handlers)
11. [Amazon API Gateway — REST API](#11-amazon-api-gateway--rest-api)
12. [AWS Fargate — Synthetic Telemetry Engine](#12-aws-fargate--synthetic-telemetry-engine)
13. [Amazon SES — Transactional Email](#13-amazon-ses--transactional-email)
14. [Amazon CloudWatch — Monitoring](#14-amazon-cloudwatch--monitoring)
15. [Environment Variables Reference](#15-environment-variables-reference)
16. [Verification Checklist](#16-verification-checklist)

---

## 1. Prerequisites

### AWS Account Setup

1. Create or log into your AWS account at [console.aws.amazon.com](https://console.aws.amazon.com)
2. Enable the **Cape Town region** (`af-south-1`): Account menu → **Regions** → enable `af-south-1`
3. Note: Not all services listed here are available in `af-south-1`. Where a service is unavailable, use `eu-west-1` (Ireland) and note it in your `.env.local`

### CLI Setup (Required for Several Steps)

```bash
# Install AWS CLI v2
# macOS
brew install awscli

# Windows (PowerShell)
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

# Verify
aws --version

# Configure credentials
aws configure
# AWS Access Key ID: <your-key>
# AWS Secret Access Key: <your-secret>
# Default region name: af-south-1
# Default output format: json
```

### Create an Admin IAM User (Do Not Use Root)

1. IAM Console → **Users** → **Create user**
2. Name: `clara-ai-admin`
3. Permissions: Attach `AdministratorAccess` policy (for setup only — scope down before production)
4. Create access key → download the CSV
5. Configure AWS CLI with these credentials

---

## 2. IAM — Roles and Policies

These roles are used by Lambda, Fargate, SageMaker, and IoT Core. Create them first.

### 2.1 Lambda Execution Role

1. IAM Console → **Roles** → **Create role**
2. Trusted entity: **AWS service → Lambda**
3. Name: `clara-ai-lambda-role`
4. Attach these managed policies:
   - `AWSLambdaBasicExecutionRole`
   - `AmazonRDSDataFullAccess`
   - `AmazonTimestreamFullAccess`
   - `AmazonCognitoPowerUser`
   - `AmazonSageMakerFullAccess`
   - `AWSAppSyncPushToRealTimeWebSocket`
   - `AmazonS3ReadOnlyAccess`
   - `AmazonSESFullAccess`
5. **Create role**

### 2.2 IoT Core Role (for Rules Engine → Timestream)

1. IAM Console → **Roles** → **Create role**
2. Trusted entity: **AWS service → IoT**
3. Name: `clara-ai-iot-timestream-role`
4. Attach: `AmazonTimestreamFullAccess`
5. **Create role**

### 2.3 Fargate Task Role

1. IAM Console → **Roles** → **Create role**
2. Trusted entity: **AWS service → Elastic Container Service Task**
3. Name: `clara-ai-fargate-task-role`
4. Attach:
   - `AmazonS3ReadOnlyAccess` (reads datasets)
   - `AWSIoTDataAccess` (publishes MQTT messages)
   - `CloudWatchLogsFullAccess`
5. **Create role**

### 2.4 SageMaker Execution Role

1. IAM Console → **Roles** → **Create role**
2. Trusted entity: **AWS service → SageMaker**
3. Name: `clara-ai-sagemaker-role`
4. Attach:
   - `AmazonSageMakerFullAccess`
   - `AmazonS3FullAccess` (for model artifacts bucket)
5. **Create role**

---

## 3. Amazon Cognito — Authentication

Clara AI uses Cognito User Pools for JWT-based auth with a custom `tenant_id` claim injected into every token.

### 3.1 Create User Pool

1. Cognito Console → **User pools** → **Create user pool**
2. **Step 1 — Configure sign-in experience**
   - Sign-in options: **Email** only
   - Click Next
3. **Step 2 — Configure security requirements**
   - Password policy: Cognito defaults are fine for PoC
   - MFA: **No MFA** (enable for production)
   - Click Next
4. **Step 3 — Configure sign-up experience**
   - Required attributes: `email`, `name`
   - **Custom attributes** (critical — add these):
     - `custom:tenant_id` — String, mutable
     - `custom:role` — String, mutable (values: `TENANT_ADMIN`, `FACILITY_MANAGER`, `READ_ONLY`)
   - Click Next
5. **Step 4 — Configure message delivery**
   - Email: **Send email with Cognito** (for PoC)
   - Click Next
6. **Step 5 — Integrate your app**
   - User pool name: `clara-ai-users`
   - App client name: `clara-ai-nextjs`
   - Client secret: **Generate a client secret** ✓
   - Click Next
7. **Review and create**

> **Save these values immediately:**
> - User Pool ID (format: `af-south-1_xxxxxxxxx`)
> - App client ID
> - App client secret

### 3.2 Configure App Client

1. Cognito Console → your pool → **App integration** → **App clients** → click `clara-ai-nextjs`
2. **Hosted UI** section → **Edit**
   - Allowed callback URLs: `http://localhost:3000/api/auth/callback/cognito`
   - For production: add your domain
   - Allowed sign-out URLs: `http://localhost:3000`
   - OAuth 2.0 grant types: **Authorization code grant** ✓
   - OpenID Connect scopes: `email`, `openid`, `profile`
3. **Save changes**

### 3.3 Configure Pre-Token Generation Trigger (Inject tenant_id)

This Lambda runs before every token is issued and adds `tenant_id` to the JWT claims.

1. Create the Lambda function first (see Section 10.1)
2. Cognito Console → your pool → **User pool properties** → **Lambda triggers**
3. **Pre token generation** → select `clara-ai-pre-token-gen`
4. **Save changes**

### 3.4 Create Demo Users

For the PoC, create the investor demo account manually:

```bash
# Create user
aws cognito-idp admin-create-user \
  --user-pool-id af-south-1_XXXXXXX \
  --username demo@claraai.com \
  --user-attributes \
    Name=email,Value=demo@claraai.com \
    Name=email_verified,Value=true \
    Name=name,Value="Demo User" \
    Name=custom:tenant_id,Value=tenant_cpt \
    Name=custom:role,Value=FACILITY_MANAGER \
  --temporary-password TempPass123! \
  --region af-south-1

# Set permanent password (skip forced change)
aws cognito-idp admin-set-user-password \
  --user-pool-id af-south-1_XXXXXXX \
  --username demo@claraai.com \
  --password Demo@Clara2025 \
  --permanent \
  --region af-south-1
```

---

## 4. Amazon RDS — PostgreSQL Database

### 4.1 Create VPC (if not using default)

For production, create a dedicated VPC. For PoC, you can use the default VPC.

1. VPC Console → **Create VPC**
   - Name: `clara-ai-vpc`
   - IPv4 CIDR: `10.0.0.0/16`
   - Create 2 private subnets (for RDS) and 2 public subnets (for NAT/Lambda)

### 4.2 Create RDS Subnet Group

1. RDS Console → **Subnet groups** → **Create DB subnet group**
2. Name: `clara-ai-db-subnet-group`
3. VPC: select `clara-ai-vpc` (or default)
4. Add at least 2 subnets in different Availability Zones

### 4.3 Create Security Group

1. EC2 Console → **Security Groups** → **Create security group**
2. Name: `clara-ai-rds-sg`
3. VPC: `clara-ai-vpc`
4. Inbound rules:
   - Type: **PostgreSQL** | Port: `5432` | Source: `clara-ai-lambda-sg` (add after creating Lambda SG)
   - Type: **PostgreSQL** | Port: `5432` | Source: Your IP (for local development + migrations)
5. **Create**

### 4.4 Create RDS Instance

1. RDS Console → **Databases** → **Create database**
2. **Engine**: PostgreSQL
3. **Engine version**: 15.x (latest 15)
4. **Template**: Free tier (PoC) or Production (live)
5. **Settings**:
   - DB instance identifier: `clara-ai-db`
   - Master username: `claraai`
   - Master password: Generate and save securely
6. **Instance configuration**: `db.t3.micro` (PoC) or `db.r6g.large` (production)
7. **Storage**: 20 GB gp3, enable auto-scaling
8. **Connectivity**:
   - VPC: `clara-ai-vpc`
   - Subnet group: `clara-ai-db-subnet-group`
   - Public access: **No** (use bastion or SSM for local migrations)
   - Security group: `clara-ai-rds-sg`
9. **Database authentication**: Password authentication
10. **Additional configuration**:
    - Initial database name: `claraai`
    - Enable automated backups: 7 days
    - Enable Performance Insights: Yes (free for 7 days)
    - Enable Enhanced Monitoring: Yes
11. **Create database** (takes ~5 minutes)

> **Save the endpoint hostname** — it looks like:
> `clara-ai-db.xxxxxxxxx.af-south-1.rds.amazonaws.com`

### 4.5 Run Prisma Migrations

Once RDS is running, connect from your local machine via an SSH tunnel or temporarily allow your IP:

```bash
# Set your DATABASE_URL in .env.local
DATABASE_URL="postgresql://claraai:<password>@clara-ai-db.xxx.af-south-1.rds.amazonaws.com:5432/claraai"

# Run migrations
cd clara-ai
npx prisma migrate deploy

# Seed demo data
npx prisma db seed
```

### 4.6 Apply Row Level Security

Connect to the database and run:

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_usage ENABLE ROW LEVEL SECURITY;

-- Create RLS policy template (repeat for each table)
CREATE POLICY tenant_isolation ON facilities
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY tenant_isolation ON assets
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY tenant_isolation ON health_scores
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY tenant_isolation ON alerts
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY tenant_isolation ON energy_baselines
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

CREATE POLICY tenant_isolation ON esg_reports
  USING (tenant_id = current_setting('app.current_tenant_id')::text);

-- Create a non-superuser role for the application
CREATE ROLE claraai_app WITH LOGIN PASSWORD '<app-password>';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO claraai_app;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO claraai_app;

-- This role obeys RLS; the master user bypasses it
ALTER ROLE claraai_app NOINHERIT;
```

---

## 5. Amazon S3 — Storage Buckets

Two buckets are required: one for synthetic datasets and one for generated PDF reports.

### 5.1 Datasets Bucket

1. S3 Console → **Create bucket**
2. **Bucket name**: `clara-ai-datasets-<account-id>` (must be globally unique)
3. **Region**: `af-south-1`
4. **Block all public access**: ✓ (enabled)
5. **Versioning**: Disable (read-only reference data)
6. **Create bucket**

Upload public datasets (ASHRAE, UNSW, LBNL, MIMII) to a structured prefix:

```
s3://clara-ai-datasets-<id>/
  ashrae/
  unsw-bearing/
  lbnl-hvac/
  mimii/
```

### 5.2 Reports Bucket (PDF ESG Reports)

1. S3 Console → **Create bucket**
2. **Bucket name**: `clara-ai-reports-<account-id>`
3. **Region**: `af-south-1`
4. **Block all public access**: ✓
5. **Versioning**: Enable (audit trail for ESG reports)
6. **Server-side encryption**: Enable with SSE-S3
7. **Create bucket**

Add a lifecycle rule to transition reports to S3 Glacier after 365 days:

1. Bucket → **Management** → **Create lifecycle rule**
2. Name: `archive-old-reports`
3. Apply to all objects
4. Transition to S3 Glacier after 365 days
5. **Create rule**

### 5.3 Model Artifacts Bucket (SageMaker)

1. S3 Console → **Create bucket**
2. **Bucket name**: `clara-ai-models-<account-id>`
3. **Region**: `af-south-1` (must match SageMaker region)
4. **Block all public access**: ✓
5. **Create bucket**

---

## 6. AWS IoT Core — Telemetry Ingestion

IoT Core acts as the MQTT broker. The Fargate replay engine publishes sensor readings; IoT Rules route them to Timestream.

### 6.1 Create IoT Policy

1. IoT Core Console → **Security** → **Policies** → **Create policy**
2. Name: `clara-ai-device-policy`
3. Policy document (JSON):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "iot:Connect",
        "iot:Publish",
        "iot:Subscribe",
        "iot:Receive"
      ],
      "Resource": "*"
    }
  ]
}
```

4. **Create**

### 6.2 Create IoT Thing (Replay Engine)

1. IoT Core Console → **Manage** → **All devices** → **Things** → **Create things**
2. Create single thing
3. Name: `clara-ai-replay-engine`
4. **Auto-generate a new certificate**
5. Attach policy: `clara-ai-device-policy`
6. **Create thing**
7. **Download all files** (certificate, private key, public key, Amazon Root CA)
   - Store securely — you cannot download the private key again
   - Upload to S3 or AWS Secrets Manager for Fargate access (see Section 12)

### 6.3 Note Your IoT Endpoint

```bash
aws iot describe-endpoint --endpoint-type iot:Data-ATS --region af-south-1
# Returns: { "endpointAddress": "xxxxxxxxx-ats.iot.af-south-1.amazonaws.com" }
```

Save this as `IOT_ENDPOINT` in `.env.local`.

### 6.4 MQTT Topic Structure

Clara AI uses this topic hierarchy:

```
clara/{tenantId}/{facilityId}/{assetId}/telemetry
clara/{tenantId}/{facilityId}/{assetId}/health
```

Example: `clara/tenant_cpt/JHB-DC-01/CHL-01/telemetry`

### 6.5 Create IoT Rule (Route to Timestream)

1. IoT Core Console → **Message routing** → **Rules** → **Create rule**
2. Name: `clara_telemetry_to_timestream`
3. SQL statement:
```sql
SELECT tenant_id, facility_id, asset_id, sensor_type, value, unit, timestamp
FROM 'clara/+/+/+/telemetry'
```
4. **Rule actions** → **Add action** → **Write a message into a Timestream table**
5. Select your Timestream database and table (created in Section 7)
6. IAM role: `clara-ai-iot-timestream-role`
7. Dimension names and values:
   - `tenant_id` → `${tenant_id}`
   - `facility_id` → `${facility_id}`
   - `asset_id` → `${asset_id}`
   - `sensor_type` → `${sensor_type}`
8. Measure name: `${sensor_type}`
9. Measure value: `${value}`
10. **Create rule**

---

## 7. Amazon Timestream — Time-Series Data

Timestream stores all raw telemetry from IoT Core.

> **Availability note**: Timestream is not available in `af-south-1`. Use `eu-west-1` (Ireland). Update `AWS_TIMESTREAM_REGION=eu-west-1` in your env.

### 7.1 Create Database

1. Timestream Console (switch to `eu-west-1`) → **Databases** → **Create database**
2. Choose **Standard database**
3. Name: `clara-ai`
4. Encryption: AWS managed key (default)
5. **Create database**

### 7.2 Create Table

1. Click into `clara-ai` database → **Tables** → **Create table**
2. Name: `telemetry`
3. **Memory store retention**: 24 hours (data queryable in real-time)
4. **Magnetic store retention**: 365 days (long-term storage)
5. Enable magnetic store writes: ✓
6. **Create table**

### 7.3 Verify with a Test Write

```bash
aws timestream-write write-records \
  --database-name clara-ai \
  --table-name telemetry \
  --records '[{
    "Dimensions": [
      {"Name": "tenant_id", "Value": "tenant_cpt"},
      {"Name": "asset_id", "Value": "CHL-01"},
      {"Name": "facility_id", "Value": "JHB-DC-01"}
    ],
    "MeasureName": "temperature",
    "MeasureValue": "22.5",
    "MeasureValueType": "DOUBLE",
    "Time": "'$(date +%s000)'"
  }]' \
  --region eu-west-1
```

---

## 8. Amazon SageMaker — ML Model Endpoints

Clara AI requires 10 model endpoints. In the PoC these can use pre-built stub models that return plausible synthetic outputs. Full training happens in Phase 2.

> **Availability note**: SageMaker is not available in `af-south-1`. Use `eu-west-1`.

### 8.1 Upload Stub Model Artifacts to S3

For each model, create a minimal `model.tar.gz` containing a stub inference script. The simplest approach for PoC is to use a scikit-learn inference container with a fixed output:

```bash
# Example stub for Failure Forecast model
mkdir stub-failure-forecast
cat > stub-failure-forecast/inference.py << 'EOF'
import json

def model_fn(model_dir):
    return {"status": "stub"}

def predict_fn(input_data, model):
    return {"predictedTtfDays": 45.0, "confidence": 0.85}

def output_fn(prediction, accept):
    return json.dumps(prediction), "application/json"
EOF

tar -czf stub-failure-forecast.tar.gz -C stub-failure-forecast .
aws s3 cp stub-failure-forecast.tar.gz s3://clara-ai-models-<id>/failure-forecast/model.tar.gz
```

Repeat this for all 10 models, adjusting the output to match each model's expected response schema.

### 8.2 Create a Model in SageMaker

1. SageMaker Console (`eu-west-1`) → **Models** → **Create model**
2. **Model name**: `clara-failure-forecast`
3. **IAM role**: `clara-ai-sagemaker-role`
4. **Container**:
   - Location of inference code: `763104351884.dkr.ecr.eu-west-1.amazonaws.com/sklearn:1.2-1`
   - Location of model artifacts: `s3://clara-ai-models-<id>/failure-forecast/model.tar.gz`
5. **Create model**

### 8.3 Create Endpoint Configuration

1. SageMaker Console → **Endpoint configurations** → **Create endpoint configuration**
2. Name: `clara-failure-forecast-config`
3. Add production variant:
   - Variant name: `AllTraffic`
   - Model name: `clara-failure-forecast`
   - Instance type: `ml.t2.medium` (PoC) or `ml.m5.large` (production)
   - Initial instance count: 1
4. **Create endpoint configuration**

### 8.4 Create Endpoint

1. SageMaker Console → **Endpoints** → **Create endpoint**
2. Name: `clara-failure-forecast` (this is what goes in your env var)
3. Endpoint configuration: `clara-failure-forecast-config`
4. **Create endpoint** (takes ~5 minutes to go InService)

### 8.5 Repeat for All 10 Models

| Env Variable | Endpoint Name | Output Schema |
|---|---|---|
| `SAGEMAKER_ENDPOINT_FAILURE_FORECAST` | `clara-failure-forecast` | `{ predictedTtfDays, confidence }` |
| `SAGEMAKER_ENDPOINT_FAULT_TYPE_IDENTIFIER` | `clara-fault-type` | `{ faultType, confidence, frequencies }` |
| `SAGEMAKER_ENDPOINT_ENERGY_BASELINE` | `clara-energy-baseline` | `{ baselineKwh, forecastKwh }` |
| `SAGEMAKER_ENDPOINT_ENERGY_WASTE_DETECTOR` | `clara-energy-waste` | `{ anomalyFlag, deviationPct }` |
| `SAGEMAKER_ENDPOINT_SOUND_HEALTH_MONITOR` | `clara-sound-health` | `{ acousticScore, anomalyFlag }` |
| `SAGEMAKER_ENDPOINT_SAFE_OPERATING_RANGE` | `clara-safe-range` | `{ isoZone, withinRange }` |
| `SAGEMAKER_ENDPOINT_CLARA_AI_INSIGHTS` | `clara-insights` | `{ insight, rootCause, actions }` |
| `SAGEMAKER_ENDPOINT_PUE_OPTIMISER` | `clara-pue-optimiser` | `{ pueReduction, setpoints }` |
| `SAGEMAKER_ENDPOINT_HOT_SPOT_TRACKER` | `clara-hot-spot` | `{ hotspots, maxTemp }` |
| `SAGEMAKER_ENDPOINT_POWER_QUALITY_GUARD` | `clara-power-quality` | `{ qualityScore, surgeFlag }` |

---

## 9. AWS AppSync — GraphQL + WebSockets

AppSync powers real-time subscriptions (live alerts, facility health updates, LAST SYNC timestamp).

> **Availability note**: AppSync is available in `af-south-1`.

### 9.1 Create AppSync API

1. AppSync Console → **APIs** → **Create API**
2. Choose **Build from scratch**
3. API name: `clara-ai-realtime`
4. **Create API**

### 9.2 Define Schema

1. In the API → **Schema** → replace with:

```graphql
type Alert {
  id: ID!
  tenantId: String!
  facilityId: String!
  assetId: String
  severity: String!
  status: String!
  title: String!
  description: String!
  createdAt: AWSDateTime!
}

type FacilityHealth {
  facilityId: String!
  tenantId: String!
  healthScore: Float!
  status: String!
  updatedAt: AWSDateTime!
}

type TelemetryPoint {
  assetId: String!
  tenantId: String!
  sensorType: String!
  value: Float!
  unit: String!
  timestamp: AWSDateTime!
}

type Query {
  getAlerts(tenantId: String!): [Alert]
}

type Mutation {
  publishAlert(
    tenantId: String!
    facilityId: String!
    assetId: String
    severity: String!
    title: String!
    description: String!
  ): Alert

  publishFacilityHealth(
    facilityId: String!
    tenantId: String!
    healthScore: Float!
    status: String!
  ): FacilityHealth

  publishTelemetry(
    assetId: String!
    tenantId: String!
    sensorType: String!
    value: Float!
    unit: String!
  ): TelemetryPoint
}

type Subscription {
  onNewAlert(tenantId: String!): Alert
    @aws_subscribe(mutations: ["publishAlert"])

  onFacilityHealth(tenantId: String!, facilityId: String!): FacilityHealth
    @aws_subscribe(mutations: ["publishFacilityHealth"])

  onTelemetry(tenantId: String!, assetId: String!): TelemetryPoint
    @aws_subscribe(mutations: ["publishTelemetry"])
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
```

2. **Save schema**

### 9.3 Configure Data Source (None — for pub/sub only)

1. AppSync → **Data sources** → **Create data source**
2. Name: `NoSource`
3. Data source type: **None**
4. **Create**

### 9.4 Create Resolvers for Mutations

For each mutation (`publishAlert`, `publishFacilityHealth`, `publishTelemetry`):

1. AppSync → **Schema** → click the mutation → **Attach resolver**
2. Data source: `NoSource`
3. Request mapping template:
```json
{
  "version": "2017-02-28",
  "payload": $util.toJson($context.arguments)
}
```
4. Response mapping template:
```json
$util.toJson($context.result)
```
5. **Save resolver**

### 9.5 Set API Key Auth Mode

1. AppSync → **Settings** → **Default authorization mode**: **API key**
2. Create API key with 1-year expiry
3. **Save** the API key and endpoint URL

> You now have:
> - `NEXT_PUBLIC_APPSYNC_ENDPOINT` — the GraphQL endpoint URL
> - `NEXT_PUBLIC_APPSYNC_API_KEY` — the API key

---

## 10. AWS Lambda — API Handlers

### 10.1 Pre-Token Generation Lambda (Cognito Trigger)

This function adds the `tenant_id` to every Cognito JWT.

1. Lambda Console → **Create function**
2. Name: `clara-ai-pre-token-gen`
3. Runtime: **Node.js 20.x**
4. Architecture: arm64 (Graviton — cheaper)
5. Execution role: Create new role with basic Lambda permissions
6. **Create function**
7. **Code** tab → paste:

```javascript
exports.handler = async (event) => {
  // Look up tenant_id from the user's attributes
  const tenantId = event.request.userAttributes['custom:tenant_id'];
  const role = event.request.userAttributes['custom:role'] || 'READ_ONLY';

  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        'tenant_id': tenantId,
        'user_role': role,
      },
    },
  };

  return event;
};
```

8. **Deploy**
9. Go back to Cognito and attach this as the Pre-token generation trigger (Section 3.3)

### 10.2 Inference Orchestrator Lambda

This Lambda is invoked by IoT rules or on a schedule. It calls SageMaker endpoints and writes results to RDS.

1. Lambda Console → **Create function**
2. Name: `clara-ai-inference-orchestrator`
3. Runtime: **Node.js 20.x**
4. Execution role: `clara-ai-lambda-role`
5. **Configuration** → **General configuration**:
   - Timeout: 60 seconds
   - Memory: 512 MB
6. **Environment variables** — add all env vars from Section 15
7. VPC: attach to `clara-ai-vpc` private subnets so it can reach RDS

> The actual inference code lives in `lib/aws/sagemaker.ts` in the Next.js app. For the PoC, this Lambda calls SageMaker endpoints and writes `HealthScore` records back to RDS.

### 10.3 Deploy Lambda Code

Package and deploy from the project:

```bash
# Build the inference orchestrator
cd clara-ai
npm run build

# Package Lambda (separate from Next.js build)
zip -r inference-orchestrator.zip lib/aws/sagemaker.js node_modules

# Deploy
aws lambda update-function-code \
  --function-name clara-ai-inference-orchestrator \
  --zip-file fileb://inference-orchestrator.zip \
  --region af-south-1
```

---

## 11. Amazon API Gateway — REST API

API Gateway sits in front of your Lambda functions for any REST endpoints not handled by Next.js API routes directly.

> For the PoC, Next.js App Router API routes (`app/api/`) handle most backend logic directly. API Gateway is needed for the IoT ingestion endpoint and any endpoints that must be called by the Fargate replay engine independently.

### 11.1 Create REST API

1. API Gateway Console → **Create API** → **REST API**
2. Name: `clara-ai-api`
3. Endpoint type: **Regional**
4. **Create API**

### 11.2 Create Cognito Authorizer

1. API → **Authorizers** → **Create authorizer**
2. Name: `cognito-authorizer`
3. Type: **Cognito**
4. Cognito user pool: `clara-ai-users`
5. Token source: `Authorization`
6. **Create authorizer**

### 11.3 Create Resources and Methods

Create `/telemetry POST` for the Fargate engine to post data:

1. **Resources** → **Create resource**: `/telemetry`
2. Select `/telemetry` → **Create method** → **POST**
3. Integration type: Lambda function → `clara-ai-inference-orchestrator`
4. **Authorization**: `cognito-authorizer`
5. **Save**

### 11.4 Deploy API

1. **Actions** → **Deploy API**
2. New stage: `poc`
3. **Deploy**
4. Save the **Invoke URL** as `API_GATEWAY_URL` in your env

---

## 12. AWS Fargate — Synthetic Telemetry Engine

The replay engine reads pre-processed datasets from S3 and publishes synthetic sensor readings to IoT Core MQTT.

### 12.1 Create ECR Repository

1. ECR Console → **Repositories** → **Create repository**
2. Name: `clara-ai-replay-engine`
3. **Create repository**

### 12.2 Build and Push Docker Image

The replay engine is a separate Node.js service. Create `replay-engine/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
CMD ["node", "replay.js"]
```

Push to ECR:

```bash
# Authenticate Docker with ECR
aws ecr get-login-password --region af-south-1 | \
  docker login --username AWS \
  --password-stdin <account-id>.dkr.ecr.af-south-1.amazonaws.com

# Build and push
docker build -t clara-ai-replay-engine replay-engine/
docker tag clara-ai-replay-engine:latest \
  <account-id>.dkr.ecr.af-south-1.amazonaws.com/clara-ai-replay-engine:latest
docker push <account-id>.dkr.ecr.af-south-1.amazonaws.com/clara-ai-replay-engine:latest
```

### 12.3 Store IoT Certificates in Secrets Manager

The Fargate container needs the IoT certificates downloaded in Section 6.2:

```bash
# Store each certificate as a secret
aws secretsmanager create-secret \
  --name clara-ai/iot/certificate \
  --secret-string file://certificate.pem.crt \
  --region af-south-1

aws secretsmanager create-secret \
  --name clara-ai/iot/private-key \
  --secret-string file://private.pem.key \
  --region af-south-1

aws secretsmanager create-secret \
  --name clara-ai/iot/root-ca \
  --secret-string file://AmazonRootCA1.pem \
  --region af-south-1
```

### 12.4 Create ECS Cluster

1. ECS Console → **Clusters** → **Create cluster**
2. Name: `clara-ai-cluster`
3. Infrastructure: **AWS Fargate** (serverless)
4. **Create cluster**

### 12.5 Create Task Definition

1. ECS Console → **Task definitions** → **Create new task definition**
2. **Task definition family**: `clara-replay-engine`
3. **Launch type**: Fargate
4. **OS/Architecture**: Linux/X86_64
5. **Task role**: `clara-ai-fargate-task-role`
6. **Task execution role**: `ecsTaskExecutionRole` (create if it doesn't exist)
7. **CPU**: 0.25 vCPU | **Memory**: 0.5 GB
8. **Container**:
   - Name: `replay-engine`
   - Image: `<account-id>.dkr.ecr.af-south-1.amazonaws.com/clara-ai-replay-engine:latest`
   - Environment variables:
     - `IOT_ENDPOINT` → your IoT endpoint
     - `S3_BUCKET_DATASETS` → `clara-ai-datasets-<id>`
     - `REPLAY_SPEED` → `10` (10× real-time for demo)
     - `TENANT_ID` → `tenant_cpt`
   - Secrets (from Secrets Manager):
     - `IOT_CERTIFICATE` → `clara-ai/iot/certificate`
     - `IOT_PRIVATE_KEY` → `clara-ai/iot/private-key`
     - `IOT_ROOT_CA` → `clara-ai/iot/root-ca`
9. **Create**

### 12.6 Run Task (On-Demand for Demo)

```bash
aws ecs run-task \
  --cluster clara-ai-cluster \
  --task-definition clara-replay-engine \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={
    subnets=[subnet-xxxxxxxx],
    securityGroups=[sg-xxxxxxxx],
    assignPublicIp=ENABLED
  }" \
  --region af-south-1
```

---

## 13. Amazon SES — Transactional Email

SES sends verification emails, alert notifications, and ESG report delivery.

### 13.1 Verify Sending Domain

> **Note**: SES in `af-south-1` may not be available. Use `eu-west-1` as fallback.

1. SES Console → **Verified identities** → **Create identity**
2. Identity type: **Domain**
3. Domain: `claraai.com` (or your domain)
4. **Use a custom MAIL FROM domain**: `mail.claraai.com`
5. **Create identity**
6. Add the DKIM CNAME records to your DNS provider (shown in the console)
7. Wait for status: **Verified**

### 13.2 Verify a Test Email (Sandbox Mode)

While in SES sandbox (default):

1. SES Console → **Verified identities** → **Create identity**
2. Identity type: **Email address**
3. Enter: `your-email@example.com`
4. Click the verification link in the email

### 13.3 Request Production Access

For the PoC investor demo, sandbox is fine. For production:

1. SES Console → **Account dashboard** → **Request production access**
2. Fill in the use case form (transactional emails for SaaS platform)
3. AWS typically approves within 24 hours

### 13.4 Set the From Address in Env

```bash
SES_FROM_EMAIL="noreply@claraai.com"
AWS_SES_REGION="eu-west-1"
```

---

## 14. Amazon CloudWatch — Monitoring

### 14.1 Create Log Groups

```bash
# Lambda log groups (auto-created on first invocation, but good to pre-create)
aws logs create-log-group --log-group-name /aws/lambda/clara-ai-pre-token-gen --region af-south-1
aws logs create-log-group --log-group-name /aws/lambda/clara-ai-inference-orchestrator --region af-south-1

# Next.js app log group (if using App Runner or ECS for hosting)
aws logs create-log-group --log-group-name /clara-ai/nextjs --region af-south-1

# Set 30-day retention on all log groups
aws logs put-retention-policy \
  --log-group-name /aws/lambda/clara-ai-inference-orchestrator \
  --retention-in-days 30 \
  --region af-south-1
```

### 14.2 Create Alarms

Create alarms for critical failure scenarios:

```bash
# RDS CPU > 80%
aws cloudwatch put-metric-alarm \
  --alarm-name "clara-ai-rds-high-cpu" \
  --metric-name CPUUtilization \
  --namespace AWS/RDS \
  --dimensions Name=DBInstanceIdentifier,Value=clara-ai-db \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions <SNS-topic-arn> \
  --region af-south-1

# Lambda error rate > 5%
aws cloudwatch put-metric-alarm \
  --alarm-name "clara-ai-lambda-errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --dimensions Name=FunctionName,Value=clara-ai-inference-orchestrator \
  --statistic Sum \
  --period 60 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions <SNS-topic-arn> \
  --region af-south-1
```

### 14.3 Create SNS Topic for Alarm Notifications

```bash
aws sns create-topic --name clara-ai-alerts --region af-south-1

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:af-south-1:<account-id>:clara-ai-alerts \
  --protocol email \
  --notification-endpoint maxmarkagency@gmail.com \
  --region af-south-1
```

### 14.4 Create a Dashboard

1. CloudWatch Console → **Dashboards** → **Create dashboard**
2. Name: `clara-ai-operations`
3. Add widgets:
   - RDS: CPUUtilization, DatabaseConnections, FreeStorageSpace
   - Lambda: Invocations, Errors, Duration (inference orchestrator)
   - IoT Core: PublishIn.Success, RuleExecution.Success
   - Timestream: SystemErrors, UserErrors
4. **Save dashboard**

---

## 15. Environment Variables Reference

Copy this to your `.env.local` and fill in all values after provisioning:

```bash
# ─── Database ──────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://claraai_app:<password>@clara-ai-db.xxx.af-south-1.rds.amazonaws.com:5432/claraai"

# ─── AWS Core ──────────────────────────────────────────────────────────────
AWS_REGION="af-south-1"
AWS_ACCESS_KEY_ID="AKIA..."
AWS_SECRET_ACCESS_KEY="..."

# ─── Cognito ───────────────────────────────────────────────────────────────
COGNITO_USER_POOL_ID="af-south-1_XXXXXXXXX"
COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
COGNITO_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
NEXT_PUBLIC_COGNITO_USER_POOL_ID="af-south-1_XXXXXXXXX"
NEXT_PUBLIC_COGNITO_CLIENT_ID="xxxxxxxxxxxxxxxxxxxxxxxxxx"
COGNITO_ISSUER="https://cognito-idp.af-south-1.amazonaws.com/af-south-1_XXXXXXXXX"

# ─── Auth.js ───────────────────────────────────────────────────────────────
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# ─── AppSync ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_APPSYNC_ENDPOINT="https://xxxxxxxxxxxxxxxxxxxxxxxxxx.appsync-api.af-south-1.amazonaws.com/graphql"
NEXT_PUBLIC_APPSYNC_REGION="af-south-1"
NEXT_PUBLIC_APPSYNC_API_KEY="da2-xxxxxxxxxxxxxxxxxxxxxxxxxx"

# ─── IoT Core ──────────────────────────────────────────────────────────────
IOT_ENDPOINT="xxxxxxxxx-ats.iot.af-south-1.amazonaws.com"
IOT_CERTIFICATE_PATH="/run/secrets/iot-certificate"
IOT_PRIVATE_KEY_PATH="/run/secrets/iot-private-key"
IOT_ROOT_CA_PATH="/run/secrets/iot-root-ca"

# ─── Timestream ────────────────────────────────────────────────────────────
TIMESTREAM_REGION="eu-west-1"
TIMESTREAM_DATABASE="clara-ai"
TIMESTREAM_TABLE="telemetry"

# ─── SageMaker ─────────────────────────────────────────────────────────────
SAGEMAKER_REGION="eu-west-1"
SAGEMAKER_ENDPOINT_FAILURE_FORECAST="clara-failure-forecast"
SAGEMAKER_ENDPOINT_FAULT_TYPE_IDENTIFIER="clara-fault-type"
SAGEMAKER_ENDPOINT_ENERGY_BASELINE="clara-energy-baseline"
SAGEMAKER_ENDPOINT_ENERGY_WASTE_DETECTOR="clara-energy-waste"
SAGEMAKER_ENDPOINT_SOUND_HEALTH_MONITOR="clara-sound-health"
SAGEMAKER_ENDPOINT_SAFE_OPERATING_RANGE="clara-safe-range"
SAGEMAKER_ENDPOINT_CLARA_AI_INSIGHTS="clara-insights"
SAGEMAKER_ENDPOINT_PUE_OPTIMISER="clara-pue-optimiser"
SAGEMAKER_ENDPOINT_HOT_SPOT_TRACKER="clara-hot-spot"
SAGEMAKER_ENDPOINT_POWER_QUALITY_GUARD="clara-power-quality"

# ─── S3 ────────────────────────────────────────────────────────────────────
S3_BUCKET_DATASETS="clara-ai-datasets-<account-id>"
S3_BUCKET_REPORTS="clara-ai-reports-<account-id>"
S3_BUCKET_MODELS="clara-ai-models-<account-id>"

# ─── SES ───────────────────────────────────────────────────────────────────
SES_FROM_EMAIL="noreply@claraai.com"
AWS_SES_REGION="eu-west-1"

# ─── Feature Flags ─────────────────────────────────────────────────────────
NEXT_PUBLIC_SYNTHETIC_MODE="true"
NEXT_PUBLIC_ENABLE_ACOUSTIC_MONITOR="true"
NEXT_PUBLIC_ENABLE_HOT_SPOT_TRACKER="true"
```

---

## 16. Verification Checklist

Work through this list after provisioning to confirm everything is wired up correctly.

### Authentication
- [ ] Cognito User Pool created with `custom:tenant_id` and `custom:role` attributes
- [ ] App client created with Hosted UI, callback URL configured
- [ ] Pre-token-gen Lambda deployed and attached as trigger
- [ ] Demo user `demo@claraai.com` created with `tenant_cpt` tenant ID
- [ ] `nextauth` signs in successfully and JWT contains `tenant_id` claim

### Database
- [ ] RDS PostgreSQL instance is `Available`
- [ ] Prisma migrations ran successfully (`npx prisma migrate status` shows all applied)
- [ ] `npx prisma db seed` completed — 4 tenants, 4 facilities, CHL-01 asset visible
- [ ] RLS policies applied and `SET LOCAL app.current_tenant_id` returns correct rows

### Storage
- [ ] `clara-ai-datasets` bucket exists with dataset folders
- [ ] `clara-ai-reports` bucket exists with versioning enabled
- [ ] `clara-ai-models` bucket exists with model artifacts for all 10 endpoints

### IoT Core
- [ ] Thing `clara-ai-replay-engine` created with active certificate
- [ ] Policy attached to certificate
- [ ] IoT rule `clara_telemetry_to_timestream` active and routing to correct Timestream table
- [ ] Test MQTT publish with `aws iot-data publish` flows through to Timestream

### Timestream
- [ ] Database `clara-ai` and table `telemetry` exist in `eu-west-1`
- [ ] Test record written in Section 7.3 is queryable:
  ```bash
  aws timestream-query query \
    --query-string "SELECT * FROM \"clara-ai\".\"telemetry\" WHERE time > ago(1h)" \
    --region eu-west-1
  ```

### SageMaker
- [ ] All 10 endpoints show status `InService`
- [ ] Test invocation returns expected JSON schema:
  ```bash
  aws sagemaker-runtime invoke-endpoint \
    --endpoint-name clara-failure-forecast \
    --body '{"assetId":"CHL-01","features":[0.88,4.8,298.0]}' \
    --content-type application/json \
    output.json \
    --region eu-west-1 && cat output.json
  ```

### AppSync
- [ ] API created and schema saved
- [ ] Subscriptions testable from AppSync console (use **Queries** tab to test a subscription + mutation)
- [ ] API key is non-expired (check expiry date in AppSync settings)

### Lambda
- [ ] `clara-ai-pre-token-gen` deployed and attached to Cognito
- [ ] `clara-ai-inference-orchestrator` deployed with all env vars set
- [ ] Test invocation from Lambda console returns success

### Application End-to-End
- [ ] `npm run dev` starts without errors
- [ ] `/dashboard` loads with synthetic data (SYNTHETIC_MODE=true)
- [ ] Equipment Health page shows CHL-01 with health score 82%, TTF 45 days
- [ ] ESG score card displays 6-dimension composite score
- [ ] Switching `NEXT_PUBLIC_SYNTHETIC_MODE=false` and logging in as `demo@claraai.com` returns real JWT with `tenant_cpt`

---

## Service Availability Summary

| Service | Available in `af-south-1`? | Fallback Region |
|---|---|---|
| Amazon Cognito | Yes | — |
| Amazon RDS | Yes | — |
| Amazon S3 | Yes | — |
| AWS IoT Core | Yes | — |
| AWS AppSync | Yes | — |
| AWS Lambda | Yes | — |
| Amazon API Gateway | Yes | — |
| AWS Fargate (ECS) | Yes | — |
| Amazon SES | Limited | `eu-west-1` |
| Amazon Timestream | **No** | `eu-west-1` |
| Amazon SageMaker | **No** | `eu-west-1` |
| Amazon CloudWatch | Yes | — |

For services running in `eu-west-1`, set their specific region env vars (e.g., `SAGEMAKER_REGION`, `TIMESTREAM_REGION`, `AWS_SES_REGION`) separately from the base `AWS_REGION`.

---

*Last updated: 2026-06-30 | Clara AI PoC v1.0 | For Phase 2 (real hardware) provisioning, refer to the Atlantis SEZ pilot documentation.*
