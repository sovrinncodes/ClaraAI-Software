# Clara AI — AWS Step-by-Step Implementation & Integration Guide

**CompletePropertyTech (CPT) | Data Centre MVP | v1.0**

This is the provisioning runbook for the Clara AI platform. It walks through creating, configuring,
and integrating **every AWS service** in the stack, in dependency order, with copy-paste CLI commands
and verification steps after each phase.

Companion document: [INTEGRATION.md](./INTEGRATION.md) describes *how the pieces talk to each other*.
This document describes *how to build them*.

---

## Table of Contents

- [Phase 0 — Prerequisites & Account Setup](#phase-0--prerequisites--account-setup)
- [Phase 1 — IAM Foundation](#phase-1--iam-foundation)
- [Phase 2 — Networking (VPC)](#phase-2--networking-vpc)
- [Phase 3 — Amazon RDS PostgreSQL](#phase-3--amazon-rds-postgresql)
- [Phase 4 — Amazon Cognito (Auth)](#phase-4--amazon-cognito-auth)
- [Phase 5 — Amazon S3 Buckets](#phase-5--amazon-s3-buckets)
- [Phase 6 — Amazon Timestream (Telemetry Store)](#phase-6--amazon-timestream-telemetry-store)
- [Phase 7 — AWS IoT Core (Telemetry Ingestion)](#phase-7--aws-iot-core-telemetry-ingestion)
- [Phase 8 — AWS Lambda (Inference Orchestrator + API Handlers)](#phase-8--aws-lambda-inference-orchestrator--api-handlers)
- [Phase 9 — Amazon API Gateway](#phase-9--amazon-api-gateway)
- [Phase 10 — Amazon SageMaker (10 ML Endpoints)](#phase-10--amazon-sagemaker-10-ml-endpoints)
- [Phase 11 — AWS AppSync (Real-Time GraphQL)](#phase-11--aws-appsync-real-time-graphql)
- [Phase 12 — AWS Fargate (Synthetic Telemetry Replay Engine)](#phase-12--aws-fargate-synthetic-telemetry-replay-engine)
- [Phase 13 — Amazon SES (Transactional Email)](#phase-13--amazon-ses-transactional-email)
- [Phase 14 — CloudWatch (Monitoring & Alerting)](#phase-14--cloudwatch-monitoring--alerting)
- [Phase 15 — Next.js App Integration](#phase-15--nextjs-app-integration)
- [Phase 16 — End-to-End Smoke Test](#phase-16--end-to-end-smoke-test)
- [Appendix A — Region Strategy & Service Availability](#appendix-a--region-strategy--service-availability)
- [Appendix B — Cost Controls for the PoC](#appendix-b--cost-controls-for-the-poc)
- [Appendix C — Teardown](#appendix-c--teardown)

---

## Phase 0 — Prerequisites & Account Setup

### 0.1 Tooling

Install and verify:

```bash
# AWS CLI v2
aws --version          # aws-cli/2.x required

# Node.js 20+ (matches Lambda runtime)
node --version

# Docker (for the Fargate replay engine image)
docker --version

# Prisma CLI is already a project dependency
npx prisma --version
```

### 0.2 AWS account & profile

1. Create (or use) a dedicated AWS account for Clara AI. Do **not** share an account with the
   Atlantis SEZ pilot — the two tracks stay separate.
2. Enable MFA on the root user, then stop using the root user.
3. Create an IAM identity for yourself (via IAM Identity Center or an IAM user) with
   `AdministratorAccess` for the initial build-out.
4. Configure a named profile:

```bash
aws configure --profile clara-ai
# AWS Access Key ID:     <your key>
# AWS Secret Access Key: <your secret>
# Default region name:   af-south-1
# Default output format: json
```

5. Make it the default for the rest of this guide:

```bash
# PowerShell
$env:AWS_PROFILE = "clara-ai"
$env:AWS_REGION  = "af-south-1"

# bash
export AWS_PROFILE=clara-ai
export AWS_REGION=af-south-1
```

### 0.3 Enable the af-south-1 region

`af-south-1` (Cape Town) is **opt-in**. Enable it before anything else:

```bash
aws account enable-region --region-name af-south-1
# Wait until ENABLED:
aws account get-region-opt-status --region-name af-south-1
```

> **Important — read Appendix A now.** Amazon Timestream is **not available in af-south-1**.
> This guide uses `eu-west-1` (Ireland) for Timestream and keeps everything else in `af-south-1`.
> All commands below state their region explicitly where it differs.

### 0.4 Capture your account ID

Used throughout this guide:

```bash
aws sts get-caller-identity --query Account --output text
```

Wherever you see `<ACCOUNT_ID>` below, substitute this value.

**✅ Verify Phase 0:** `aws sts get-caller-identity` returns your account; `aws ec2 describe-availability-zones --region af-south-1` lists 3 AZs.

---

## Phase 1 — IAM Foundation

Create the execution roles every later phase depends on. All roles follow least privilege —
do not attach `AdministratorAccess` to any service role.

### 1.1 Lambda execution role (`clara-lambda-exec`)

```bash
# Trust policy
cat > lambda-trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role \
  --role-name clara-lambda-exec \
  --assume-role-policy-document file://lambda-trust.json

# Basic logging + VPC networking (needed to reach RDS)
aws iam attach-role-policy --role-name clara-lambda-exec \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole
```

Inline policy for the services Lambda actually touches:

```bash
cat > lambda-inline.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "SageMakerInvoke",
      "Effect": "Allow",
      "Action": ["sagemaker:InvokeEndpoint"],
      "Resource": "arn:aws:sagemaker:af-south-1:<ACCOUNT_ID>:endpoint/clara-*"
    },
    {
      "Sid": "TimestreamRead",
      "Effect": "Allow",
      "Action": ["timestream:Select", "timestream:DescribeEndpoints"],
      "Resource": "*"
    },
    {
      "Sid": "AppSyncPublish",
      "Effect": "Allow",
      "Action": ["appsync:GraphQL"],
      "Resource": "arn:aws:appsync:af-south-1:<ACCOUNT_ID>:apis/*/types/Mutation/*"
    },
    {
      "Sid": "SecretsForDb",
      "Effect": "Allow",
      "Action": ["secretsmanager:GetSecretValue"],
      "Resource": "arn:aws:secretsmanager:af-south-1:<ACCOUNT_ID>:secret:clara/*"
    },
    {
      "Sid": "SesSend",
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendTemplatedEmail"],
      "Resource": "*"
    }
  ]
}
EOF

aws iam put-role-policy --role-name clara-lambda-exec \
  --policy-name clara-lambda-services \
  --policy-document file://lambda-inline.json
```

### 1.2 IoT Core rule role (`clara-iot-rule`)

Allows IoT rules to write into Timestream and invoke Lambda:

```bash
cat > iot-trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "iot.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role --role-name clara-iot-rule \
  --assume-role-policy-document file://iot-trust.json

cat > iot-inline.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["timestream:WriteRecords", "timestream:DescribeEndpoints"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["lambda:InvokeFunction"],
      "Resource": "arn:aws:lambda:af-south-1:<ACCOUNT_ID>:function:clara-*"
    }
  ]
}
EOF

aws iam put-role-policy --role-name clara-iot-rule \
  --policy-name clara-iot-actions --policy-document file://iot-inline.json
```

### 1.3 Fargate task roles

```bash
cat > ecs-trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ecs-tasks.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

# Execution role (pull image, write logs)
aws iam create-role --role-name clara-fargate-exec \
  --assume-role-policy-document file://ecs-trust.json
aws iam attach-role-policy --role-name clara-fargate-exec \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

# Task role (what the replay engine itself may do)
aws iam create-role --role-name clara-replay-task \
  --assume-role-policy-document file://ecs-trust.json

cat > replay-inline.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::clara-datasets-<ACCOUNT_ID>",
        "arn:aws:s3:::clara-datasets-<ACCOUNT_ID>/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": ["iot:Connect", "iot:Publish"],
      "Resource": [
        "arn:aws:iot:af-south-1:<ACCOUNT_ID>:client/clara-replay-*",
        "arn:aws:iot:af-south-1:<ACCOUNT_ID>:topic/clara/telemetry/*"
      ]
    }
  ]
}
EOF

aws iam put-role-policy --role-name clara-replay-task \
  --policy-name clara-replay-actions --policy-document file://replay-inline.json
```

### 1.4 SageMaker execution role (`clara-sagemaker-exec`)

```bash
cat > sm-trust.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "sagemaker.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

aws iam create-role --role-name clara-sagemaker-exec \
  --assume-role-policy-document file://sm-trust.json

aws iam attach-role-policy --role-name clara-sagemaker-exec \
  --policy-arn arn:aws:iam::aws:policy/AmazonSageMakerFullAccess
# Tighten to model-artifact bucket read + CloudWatch logs only, once endpoints are stable.
```

**✅ Verify Phase 1:** `aws iam list-roles --query "Roles[?starts_with(RoleName,'clara')].RoleName"` shows all five roles.

---

## Phase 2 — Networking (VPC)

RDS and Fargate need a VPC. Lambda functions that talk to RDS run inside it too.

### 2.1 Create the VPC

```bash
aws ec2 create-vpc --cidr-block 10.20.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=clara-vpc}]'
# Note the VpcId → <VPC_ID>
```

### 2.2 Subnets (2 public + 2 private across 2 AZs)

```bash
# Public (for NAT + ALB if ever needed)
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.20.0.0/24  --availability-zone af-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=clara-public-a}]'
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.20.1.0/24  --availability-zone af-south-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=clara-public-b}]'

# Private (RDS, Lambda, Fargate)
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.20.10.0/24 --availability-zone af-south-1a --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=clara-private-a}]'
aws ec2 create-subnet --vpc-id <VPC_ID> --cidr-block 10.20.11.0/24 --availability-zone af-south-1b --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=clara-private-b}]'
```

### 2.3 Internet gateway + NAT

```bash
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=clara-igw}]'
aws ec2 attach-internet-gateway --internet-gateway-id <IGW_ID> --vpc-id <VPC_ID>

# NAT gateway in public subnet A (replay engine + Lambda need outbound to AWS APIs)
aws ec2 allocate-address --domain vpc
aws ec2 create-nat-gateway --subnet-id <PUBLIC_SUBNET_A> --allocation-id <EIP_ALLOC_ID> \
  --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=clara-nat}]'
```

Route tables:

```bash
# Public route table → IGW
aws ec2 create-route-table --vpc-id <VPC_ID> --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=clara-public-rt}]'
aws ec2 create-route --route-table-id <PUBLIC_RT> --destination-cidr-block 0.0.0.0/0 --gateway-id <IGW_ID>
aws ec2 associate-route-table --route-table-id <PUBLIC_RT> --subnet-id <PUBLIC_SUBNET_A>
aws ec2 associate-route-table --route-table-id <PUBLIC_RT> --subnet-id <PUBLIC_SUBNET_B>

# Private route table → NAT
aws ec2 create-route-table --vpc-id <VPC_ID> --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=clara-private-rt}]'
aws ec2 create-route --route-table-id <PRIVATE_RT> --destination-cidr-block 0.0.0.0/0 --nat-gateway-id <NAT_ID>
aws ec2 associate-route-table --route-table-id <PRIVATE_RT> --subnet-id <PRIVATE_SUBNET_A>
aws ec2 associate-route-table --route-table-id <PRIVATE_RT> --subnet-id <PRIVATE_SUBNET_B>
```

### 2.4 Security groups

```bash
# Lambda SG (no inbound needed; outbound open)
aws ec2 create-security-group --group-name clara-lambda-sg \
  --description "Clara Lambda functions" --vpc-id <VPC_ID>

# Fargate replay engine SG
aws ec2 create-security-group --group-name clara-replay-sg \
  --description "Clara replay engine" --vpc-id <VPC_ID>

# RDS SG — only accepts 5432 from Lambda SG, replay SG, and (PoC only) your dev IP
aws ec2 create-security-group --group-name clara-rds-sg \
  --description "Clara RDS PostgreSQL" --vpc-id <VPC_ID>

aws ec2 authorize-security-group-ingress --group-id <RDS_SG> \
  --protocol tcp --port 5432 --source-group <LAMBDA_SG>
aws ec2 authorize-security-group-ingress --group-id <RDS_SG> \
  --protocol tcp --port 5432 --source-group <REPLAY_SG>

# PoC convenience — your workstation, for prisma migrate / seed. Remove before pilot.
aws ec2 authorize-security-group-ingress --group-id <RDS_SG> \
  --protocol tcp --port 5432 --cidr <YOUR_PUBLIC_IP>/32
```

**✅ Verify Phase 2:** Console → VPC → `clara-vpc` shows 4 subnets, IGW attached, NAT available, 3 security groups.

---

## Phase 3 — Amazon RDS PostgreSQL

Relational store for tenants, users, facilities, assets, health scores, alerts, energy baselines,
and ESG reports — with Row Level Security as the third isolation layer.

### 3.1 DB subnet group

```bash
aws rds create-db-subnet-group \
  --db-subnet-group-name clara-db-subnets \
  --db-subnet-group-description "Clara private subnets" \
  --subnet-ids <PRIVATE_SUBNET_A> <PRIVATE_SUBNET_B>
```

### 3.2 Store the master password in Secrets Manager

```bash
aws secretsmanager create-secret \
  --name clara/rds/master \
  --secret-string '{"username":"clara_admin","password":"<GENERATE_A_STRONG_PASSWORD>"}'
```

### 3.3 Create the instance (PostgreSQL 15+)

```bash
aws rds create-db-instance \
  --db-instance-identifier clara-pg \
  --engine postgres \
  --engine-version 15.7 \
  --db-instance-class db.t4g.medium \
  --allocated-storage 50 \
  --storage-type gp3 \
  --db-name claraai \
  --master-username clara_admin \
  --master-user-password "<SAME_PASSWORD>" \
  --db-subnet-group-name clara-db-subnets \
  --vpc-security-group-ids <RDS_SG> \
  --backup-retention-period 7 \
  --storage-encrypted \
  --no-publicly-accessible \
  --no-multi-az
```

> PoC sizing: `db.t4g.medium`, single-AZ. For the pilot phase move to `db.r6g.large` + Multi-AZ.
> If you need workstation access for migrations during the PoC, temporarily set
> `--publicly-accessible` and rely on the SG `/32` rule — or better, run migrations
> through an SSM-managed bastion.

Wait for it:

```bash
aws rds wait db-instance-available --db-instance-identifier clara-pg
aws rds describe-db-instances --db-instance-identifier clara-pg \
  --query "DBInstances[0].Endpoint.Address" --output text
# → <RDS_ENDPOINT>
```

### 3.4 Application database user

Connect as `clara_admin` and create a **non-superuser** app role. This matters: RLS does not
apply to table owners/superusers, so the app must never connect as the owner.

```sql
CREATE ROLE clara_app LOGIN PASSWORD '<APP_PASSWORD>';
GRANT CONNECT ON DATABASE claraai TO clara_app;
GRANT USAGE ON SCHEMA public TO clara_app;
-- Table grants are applied after Prisma migration (3.5)
```

Store it:

```bash
aws secretsmanager create-secret \
  --name clara/rds/app \
  --secret-string '{"username":"clara_app","password":"<APP_PASSWORD>"}'
```

### 3.5 Run Prisma migrations + RLS

In `clara-ai/`, set `DATABASE_URL` in `.env.local` (admin user for migrations only):

```
DATABASE_URL="postgresql://clara_admin:<PASSWORD>@<RDS_ENDPOINT>:5432/claraai?sslmode=require"
```

```bash
npx prisma migrate dev --name init
```

Then apply grants + RLS (run as `clara_admin`, e.g. via `psql` or a Prisma `db execute` script):

```sql
-- Grants for the app role
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO clara_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO clara_app;

-- Enable RLS on every tenant-scoped table
ALTER TABLE facilities       ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets           ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores    ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_baselines ENABLE ROW LEVEL SECURITY;
ALTER TABLE esg_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE users            ENABLE ROW LEVEL SECURITY;

-- One policy per table (template — repeat for each)
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
CREATE POLICY tenant_isolation ON users
  USING (tenant_id = current_setting('app.current_tenant_id')::text);
```

The application sets the tenant context per transaction (see Phase 15.3):

```sql
SET LOCAL app.current_tenant_id = '<tenant_id_from_jwt>';
```

### 3.6 Seed demo tenants

```bash
npx prisma db seed
```

This creates the four synthetic tenants (CompletePropertyTech + 3 demo tenants) including the
CHL-01 key demo asset, per CLAUDE.md §13.

**✅ Verify Phase 3:**

```sql
-- As clara_app, with no tenant set, every table must return zero rows:
SELECT count(*) FROM facilities;   -- expect ERROR or 0 (RLS blocks)

-- With tenant context:
BEGIN;
SET LOCAL app.current_tenant_id = '<cpt_tenant_id>';
SELECT count(*) FROM facilities;   -- expect 4
COMMIT;
```

If the unscoped query returns rows, **stop — the RLS layer is broken**. Fix before continuing.

---

## Phase 4 — Amazon Cognito (Auth)

Cognito issues JWTs carrying the `custom:tenant_id` and `custom:role` claims that drive all
three isolation layers.

### 4.1 Create the user pool

```bash
aws cognito-idp create-user-pool \
  --pool-name clara-users \
  --auto-verified-attributes email \
  --username-attributes email \
  --mfa-configuration OPTIONAL \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 12,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": true
    }
  }' \
  --schema '[
    {"Name":"email","Required":true,"Mutable":true},
    {"Name":"tenant_id","AttributeDataType":"String","Mutable":true,
     "StringAttributeConstraints":{"MinLength":"1","MaxLength":"64"}},
    {"Name":"role","AttributeDataType":"String","Mutable":true,
     "StringAttributeConstraints":{"MinLength":"1","MaxLength":"32"}}
  ]'
# → note UserPoolId: af-south-1_XXXXXXXXX
```

> Custom attributes can only be added at pool creation or via `add-custom-attributes` —
> they can never be removed. Get them right now.

### 4.2 App client (for Next.js / Auth.js)

```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name clara-web \
  --generate-secret \
  --allowed-o-auth-flows code \
  --allowed-o-auth-scopes openid email profile \
  --allowed-o-auth-flows-user-pool-client \
  --supported-identity-providers COGNITO \
  --callback-urls "http://localhost:3000/api/auth/callback/cognito" "https://app.claraai.com/api/auth/callback/cognito" \
  --logout-urls "http://localhost:3000" "https://app.claraai.com" \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH ALLOW_REFRESH_TOKEN_AUTH \
  --read-attributes email name "custom:tenant_id" "custom:role" \
  --token-validity-units '{"AccessToken":"minutes","IdToken":"minutes","RefreshToken":"days"}' \
  --access-token-validity 60 --id-token-validity 60 --refresh-token-validity 30
# → note ClientId and ClientSecret
```

### 4.3 Hosted domain (OIDC discovery for Auth.js)

```bash
aws cognito-idp create-user-pool-domain \
  --user-pool-id <USER_POOL_ID> \
  --domain clara-ai-auth   # must be globally unique
```

OIDC issuer URL (needed by Auth.js and API Gateway):

```
https://cognito-idp.af-south-1.amazonaws.com/<USER_POOL_ID>
```

### 4.4 Pre Token Generation trigger — inject tenant_id into the JWT

Cognito copies custom attributes into the ID token automatically, but the **access token**
needs a Pre Token Generation Lambda (V2 trigger) so API Gateway and AppSync can authorize on
`tenant_id` without parsing the ID token:

```javascript
// lambda/cognito-pre-token/index.mjs
export const handler = async (event) => {
  const tenantId = event.request.userAttributes['custom:tenant_id'];
  const role = event.request.userAttributes['custom:role'] ?? 'FACILITY_MANAGER';

  if (!tenantId) {
    throw new Error('User has no tenant_id — refusing to issue token');
  }

  event.response = {
    claimsAndScopeOverrideDetails: {
      idTokenGeneration: {
        claimsToAddOrOverride: { tenant_id: tenantId, role },
      },
      accessTokenGeneration: {
        claimsToAddOrOverride: { tenant_id: tenantId, role },
      },
    },
  };
  return event;
};
```

Deploy and attach:

```bash
cd lambda/cognito-pre-token && zip -r fn.zip index.mjs

aws lambda create-function \
  --function-name clara-cognito-pre-token \
  --runtime nodejs20.x --handler index.handler \
  --zip-file fileb://fn.zip \
  --role arn:aws:iam::<ACCOUNT_ID>:role/clara-lambda-exec

aws lambda add-permission \
  --function-name clara-cognito-pre-token \
  --statement-id cognito-invoke \
  --action lambda:InvokeFunction \
  --principal cognito-idp.amazonaws.com \
  --source-arn arn:aws:cognito-idp:af-south-1:<ACCOUNT_ID>:userpool/<USER_POOL_ID>

aws cognito-idp update-user-pool \
  --user-pool-id <USER_POOL_ID> \
  --lambda-config 'PreTokenGenerationConfig={LambdaArn=arn:aws:lambda:af-south-1:<ACCOUNT_ID>:function:clara-cognito-pre-token,LambdaVersion=V2_0}'
```

> Access-token customization requires the **Advanced security / Plus feature plan** on the
> user pool. If you stay on the Essentials tier, keep tenant claims on the **ID token** only
> and validate the ID token in middleware instead.

### 4.5 Post Confirmation trigger — provision the tenant + user row

On self-service signup, create the Tenant and User records in RDS. Same deployment pattern as
4.4 — function `clara-cognito-post-confirm`, attached as the `PostConfirmation` trigger. Logic:

1. Read `custom:tenant_id` — if absent (fresh signup), create a new `Tenant` (plan `trial`),
   then `admin-update-user-attributes` to stamp the new tenant id onto the Cognito user.
2. Insert the `User` row with `cognitoSub = event.request.userAttributes.sub`.

### 4.6 Create the demo users

```bash
# Guest demo user bound to the CompletePropertyTech tenant
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username demo@claraai.com \
  --user-attributes \
    Name=email,Value=demo@claraai.com \
    Name=email_verified,Value=true \
    Name=custom:tenant_id,Value=<CPT_TENANT_ID_FROM_SEED> \
    Name=custom:role,Value=READ_ONLY \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id <USER_POOL_ID> \
  --username demo@claraai.com \
  --password '<DEMO_PASSWORD>' --permanent
```

Repeat for one `TENANT_ADMIN` per demo tenant.

**✅ Verify Phase 4:** Authenticate with the CLI and inspect the token:

```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id <CLIENT_ID> \
  --auth-parameters USERNAME=demo@claraai.com,PASSWORD=<DEMO_PASSWORD>
```

Decode the `IdToken` at jwt.io — it must contain `tenant_id` and `role` claims. If not, the
Pre Token trigger isn't firing.

---

## Phase 5 — Amazon S3 Buckets

Two buckets: source datasets for the replay engine, and generated ESG report PDFs.

```bash
aws s3api create-bucket --bucket clara-datasets-<ACCOUNT_ID> \
  --region af-south-1 --create-bucket-configuration LocationConstraint=af-south-1

aws s3api create-bucket --bucket clara-reports-<ACCOUNT_ID> \
  --region af-south-1 --create-bucket-configuration LocationConstraint=af-south-1

# Block all public access on both
for B in clara-datasets-<ACCOUNT_ID> clara-reports-<ACCOUNT_ID>; do
  aws s3api put-public-access-block --bucket $B \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  aws s3api put-bucket-encryption --bucket $B \
    --server-side-encryption-configuration \
    '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
done
```

Upload the pre-processed public datasets (ASHRAE, UNSW bearing, LBNL HVAC, MIMII):

```bash
aws s3 sync ./datasets/ashrae   s3://clara-datasets-<ACCOUNT_ID>/ashrae/
aws s3 sync ./datasets/unsw     s3://clara-datasets-<ACCOUNT_ID>/unsw-bearing/
aws s3 sync ./datasets/lbnl     s3://clara-datasets-<ACCOUNT_ID>/lbnl-hvac/
aws s3 sync ./datasets/mimii    s3://clara-datasets-<ACCOUNT_ID>/mimii/
```

Report bucket layout convention (tenant-prefixed so pre-signed URLs can never cross tenants):

```
s3://clara-reports-<ACCOUNT_ID>/<tenant_id>/<facility_id>/<framework>-<period>.pdf
```

**✅ Verify Phase 5:** `aws s3 ls s3://clara-datasets-<ACCOUNT_ID>/` lists 4 prefixes; public access is blocked on both buckets.

---

## Phase 6 — Amazon Timestream (Telemetry Store)

> **Region note:** Timestream for LiveAnalytics is not available in `af-south-1`, and AWS has
> restricted new-customer onboarding for LiveAnalytics. **Check whether your account can create
> LiveAnalytics resources first.** If it cannot, the supported alternative is **Timestream for
> InfluxDB** (available in major regions) — the IoT rule then writes via Lambda instead of a
> native Timestream action. This guide shows the LiveAnalytics path in `eu-west-1`; the
> InfluxDB fallback is summarized at the end of this phase. Either way, flag the final choice
> in the project docs since CLAUDE.md names Timestream explicitly.

### 6.1 Database + table (eu-west-1)

```bash
aws timestream-write create-database \
  --database-name clara_telemetry --region eu-west-1

aws timestream-write create-table \
  --database-name clara_telemetry \
  --table-name sensor_readings \
  --region eu-west-1 \
  --retention-properties '{
    "MemoryStoreRetentionPeriodInHours": 24,
    "MagneticStoreRetentionPeriodInDays": 90
  }'
```

### 6.2 Record schema convention

Every record written by the IoT rule:

| Field | Type | Example |
|---|---|---|
| `tenant_id` | dimension | `cmk3...` |
| `facility_id` | dimension | `cmk4...` |
| `asset_id` | dimension | `cmk5...` |
| `sensor_type` | dimension | `vibration_rms` |
| `unit` | dimension | `mm/s` |
| measure `value` | DOUBLE | `4.8` |
| time | timestamp | event time from payload |

`tenant_id` as a **dimension on every record** is mandatory — queries from Lambda must always
include `WHERE tenant_id = '...'`.

### 6.3 InfluxDB fallback (if LiveAnalytics is unavailable to your account)

```bash
aws timestream-influxdb create-db-instance \
  --name clara-telemetry \
  --db-instance-type db.influx.medium \
  --vpc-subnet-ids <PRIVATE_SUBNET_A> <PRIVATE_SUBNET_B> \
  --vpc-security-group-ids <LAMBDA_SG> \
  --allocated-storage 50 \
  --username clara_ts \
  --password '<STRONG_PASSWORD>' \
  --organization clara --bucket telemetry \
  --region af-south-1
```

With InfluxDB, replace the IoT→Timestream rule action (Phase 7.4) with an IoT→Lambda action
that writes line protocol. Everything else in this guide is unchanged.

**✅ Verify Phase 6:** `aws timestream-write describe-table --database-name clara_telemetry --table-name sensor_readings --region eu-west-1` returns ACTIVE (or the InfluxDB instance reaches `available`).

---

## Phase 7 — AWS IoT Core (Telemetry Ingestion)

The MQTT front door. The Fargate replay engine (and later, real CPT hardware) publishes here.

### 7.1 Topic convention

```
clara/telemetry/<tenant_id>/<facility_id>/<asset_id>
```

Payload (matches `TelemetryPoint` in `types/telemetry.ts`):

```json
{
  "timestamp": "2026-06-12T14:02:45Z",
  "tenantId": "...", "facilityId": "...", "assetId": "...",
  "sensorType": "vibration_rms",
  "value": 4.8,
  "unit": "mm/s"
}
```

### 7.2 Thing, certificate, and policy for the replay engine

```bash
aws iot create-thing --thing-name clara-replay-engine

# Generate cert + keys (save these — the private key is shown only once)
aws iot create-keys-and-certificate --set-as-active \
  --certificate-pem-outfile replay-cert.pem \
  --public-key-outfile replay-public.key \
  --private-key-outfile replay-private.key
# → note certificateArn
```

Least-privilege publish policy:

```bash
cat > iot-policy.json <<'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "iot:Connect",
      "Resource": "arn:aws:iot:af-south-1:<ACCOUNT_ID>:client/clara-replay-*"
    },
    {
      "Effect": "Allow",
      "Action": "iot:Publish",
      "Resource": "arn:aws:iot:af-south-1:<ACCOUNT_ID>:topic/clara/telemetry/*"
    }
  ]
}
EOF

aws iot create-policy --policy-name clara-replay-publish \
  --policy-document file://iot-policy.json

aws iot attach-policy --policy-name clara-replay-publish \
  --target <CERTIFICATE_ARN>
aws iot attach-thing-principal --thing-name clara-replay-engine \
  --principal <CERTIFICATE_ARN>
```

Store the cert + key in Secrets Manager so the Fargate task can fetch them at startup:

```bash
aws secretsmanager create-secret --name clara/iot/replay-cert \
  --secret-string file://replay-cert.pem
aws secretsmanager create-secret --name clara/iot/replay-key \
  --secret-string file://replay-private.key
```

### 7.3 Get the IoT endpoint

```bash
aws iot describe-endpoint --endpoint-type iot:Data-ATS --output text
# → <IOT_ENDPOINT> e.g. xxxxxx-ats.iot.af-south-1.amazonaws.com
```

### 7.4 Rule 1 — telemetry → Timestream

```bash
cat > rule-timestream.json <<'EOF'
{
  "sql": "SELECT value FROM 'clara/telemetry/+/+/+'",
  "description": "Write all telemetry to Timestream",
  "ruleDisabled": false,
  "awsIotSqlVersion": "2016-03-23",
  "actions": [{
    "timestream": {
      "roleArn": "arn:aws:iam::<ACCOUNT_ID>:role/clara-iot-rule",
      "databaseName": "clara_telemetry",
      "tableName": "sensor_readings",
      "dimensions": [
        { "name": "tenant_id",   "value": "${topic(3)}" },
        { "name": "facility_id", "value": "${topic(4)}" },
        { "name": "asset_id",    "value": "${topic(5)}" },
        { "name": "sensor_type", "value": "${sensorType}" },
        { "name": "unit",        "value": "${unit}" }
      ],
      "timestamp": { "value": "${timestamp}", "unit": "MILLISECONDS" }
    }
  }]
}
EOF

aws iot create-topic-rule --rule-name clara_telemetry_to_timestream \
  --topic-rule-payload file://rule-timestream.json
```

> Cross-region note: the native Timestream action targets the rule's own region. Since
> Timestream lives in `eu-west-1`, either create this rule via a Lambda action that writes
> cross-region with the Timestream SDK, or (cleanest) run the inference/storage tier in
> `eu-west-1` entirely. For the InfluxDB fallback, this rule becomes a Lambda action regardless.

### 7.5 Rule 2 — telemetry → inference orchestrator Lambda

```bash
cat > rule-lambda.json <<'EOF'
{
  "sql": "SELECT *, topic(3) AS tenant_id, topic(4) AS facility_id, topic(5) AS asset_id FROM 'clara/telemetry/+/+/+'",
  "description": "Fan telemetry into the inference orchestrator",
  "ruleDisabled": false,
  "awsIotSqlVersion": "2016-03-23",
  "actions": [{
    "lambda": {
      "functionArn": "arn:aws:lambda:af-south-1:<ACCOUNT_ID>:function:clara-inference-orchestrator"
    }
  }]
}
EOF

aws iot create-topic-rule --rule-name clara_telemetry_to_inference \
  --topic-rule-payload file://rule-lambda.json

# Allow IoT to invoke the function (run after Phase 8 creates it)
aws lambda add-permission \
  --function-name clara-inference-orchestrator \
  --statement-id iot-invoke \
  --action lambda:InvokeFunction \
  --principal iot.amazonaws.com \
  --source-arn arn:aws:iot:af-south-1:<ACCOUNT_ID>:rule/clara_telemetry_to_inference
```

**✅ Verify Phase 7:** Use the IoT console MQTT test client: subscribe to `clara/telemetry/#`,
publish a sample payload to `clara/telemetry/t1/f1/a1`, confirm it appears, and check the rule's
CloudWatch metrics show a match.

---

## Phase 8 — AWS Lambda (Inference Orchestrator + API Handlers)

### 8.1 Project layout (separate repo directory `clara-backend/` or `lambda/` in this repo)

```
lambda/
├── inference-orchestrator/    # IoT-triggered: buffer → SageMaker → RDS → AppSync
├── api/
│   ├── ingest/                # POST /v1/telemetry (HTTP ingestion path)
│   ├── facilities/            # GET /v1/facilities, /v1/facilities/{id}
│   ├── assets/                # GET /v1/assets, /v1/assets/{id}
│   ├── alerts/                # GET/PATCH /v1/alerts
│   └── reports/               # POST /v1/esg/reports (generate + S3 + SES)
└── shared/
    ├── db.ts                  # Prisma client + SET LOCAL tenant wrapper
    ├── tenant.ts              # Extract tenant_id from authorizer claims
    └── appsync.ts             # Signed mutation publisher
```

### 8.2 The inference orchestrator (core function)

Responsibilities per CLAUDE.md data flow:

1. Receive telemetry events from the IoT rule.
2. Buffer/window readings per asset (in-memory within invocation; the replay engine batches).
3. Invoke the relevant SageMaker endpoints (`clara-failure-forecast`, etc. — Phase 10).
4. Write `HealthScore` rows and raise `Alert` rows in RDS **with tenant context set**.
5. Publish an AppSync mutation (`publishAlert`, `publishHealthUpdate`) so dashboards update live.

Key implementation rules:

- Every DB write goes through the tenant-scoped transaction wrapper (`SET LOCAL app.current_tenant_id`).
- Model names in alert rows use **user-facing names only** ("Failure Forecast", never "LSTM RUL").
- Severity mapping: health ≥ 90 Optimal, 70–89 Advisory, < 70 Critical; `WATCH` reserved for
  trend-based flags.

Deploy (repeat per function; example for the orchestrator):

```bash
cd lambda/inference-orchestrator
npm run build && cd dist && zip -r ../fn.zip . && cd ..

aws lambda create-function \
  --function-name clara-inference-orchestrator \
  --runtime nodejs20.x \
  --handler index.handler \
  --zip-file fileb://fn.zip \
  --memory-size 1024 --timeout 60 \
  --role arn:aws:iam::<ACCOUNT_ID>:role/clara-lambda-exec \
  --vpc-config SubnetIds=<PRIVATE_SUBNET_A>,<PRIVATE_SUBNET_B>,SecurityGroupIds=<LAMBDA_SG> \
  --environment "Variables={
    DATABASE_SECRET_ARN=arn:aws:secretsmanager:af-south-1:<ACCOUNT_ID>:secret:clara/rds/app,
    RDS_ENDPOINT=<RDS_ENDPOINT>,
    TIMESTREAM_REGION=eu-west-1,
    APPSYNC_ENDPOINT=<set after Phase 11>,
    SAGEMAKER_ENDPOINT_FAILURE_FORECAST=clara-failure-forecast,
    SAGEMAKER_ENDPOINT_FAULT_TYPE_IDENTIFIER=clara-fault-type-identifier,
    SAGEMAKER_ENDPOINT_ENERGY_BASELINE=clara-energy-baseline,
    SAGEMAKER_ENDPOINT_ENERGY_WASTE_DETECTOR=clara-energy-waste-detector,
    SAGEMAKER_ENDPOINT_SOUND_HEALTH_MONITOR=clara-sound-health-monitor,
    SAGEMAKER_ENDPOINT_SAFE_OPERATING_RANGE=clara-safe-operating-range,
    SAGEMAKER_ENDPOINT_PUE_OPTIMISER=clara-pue-optimiser,
    SAGEMAKER_ENDPOINT_HOT_SPOT_TRACKER=clara-hot-spot-tracker,
    SAGEMAKER_ENDPOINT_POWER_QUALITY_GUARD=clara-power-quality-guard
  }"
```

> Lambda-in-VPC + Prisma: bundle the Prisma engine for `rhel-openssl-3.0.x`
> (`binaryTargets = ["native", "rhel-openssl-3.0.x"]` in `schema.prisma`) and keep the client
> outside the handler for connection reuse. For the PoC, direct connections are fine at this
> scale; add **RDS Proxy** before the pilot to avoid connection exhaustion.

### 8.3 API handler functions

Deploy each `lambda/api/*` directory the same way, named:

```
clara-api-ingest
clara-api-facilities
clara-api-assets
clara-api-alerts
clara-api-reports
```

Every handler begins with the same guard:

```typescript
const claims = event.requestContext.authorizer?.jwt?.claims;
const tenantId = claims?.['tenant_id'] as string | undefined;
if (!tenantId) {
  return { statusCode: 403, body: JSON.stringify({ success: false, data: null, error: 'Missing tenant context' }) };
}
```

**✅ Verify Phase 8:** `aws lambda invoke --function-name clara-inference-orchestrator --payload file://sample-event.json out.json` succeeds; CloudWatch logs show a SageMaker call attempt (it may fail until Phase 10 — that's expected here).

---

## Phase 9 — Amazon API Gateway

HTTP API (v2) with a Cognito JWT authorizer on every route.

### 9.1 Create the API + authorizer

```bash
aws apigatewayv2 create-api \
  --name clara-api \
  --protocol-type HTTP \
  --cors-configuration 'AllowOrigins=https://app.claraai.com,http://localhost:3000,AllowMethods=GET,POST,PATCH,OPTIONS,AllowHeaders=authorization,content-type,MaxAge=86400'
# → <API_ID>

aws apigatewayv2 create-authorizer \
  --api-id <API_ID> \
  --authorizer-type JWT \
  --identity-source '$request.header.Authorization' \
  --name clara-cognito-jwt \
  --jwt-configuration 'Audience=<CLIENT_ID>,Issuer=https://cognito-idp.af-south-1.amazonaws.com/<USER_POOL_ID>'
# → <AUTHORIZER_ID>
```

### 9.2 Integrations + routes

Repeat per function (example: facilities):

```bash
aws apigatewayv2 create-integration \
  --api-id <API_ID> \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:af-south-1:<ACCOUNT_ID>:function:clara-api-facilities \
  --payload-format-version 2.0
# → <INTEGRATION_ID>

aws apigatewayv2 create-route --api-id <API_ID> \
  --route-key 'GET /v1/facilities' \
  --target integrations/<INTEGRATION_ID> \
  --authorization-type JWT --authorizer-id <AUTHORIZER_ID>

aws apigatewayv2 create-route --api-id <API_ID> \
  --route-key 'GET /v1/facilities/{facilityId}' \
  --target integrations/<INTEGRATION_ID> \
  --authorization-type JWT --authorizer-id <AUTHORIZER_ID>

aws lambda add-permission \
  --function-name clara-api-facilities \
  --statement-id apigw-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:af-south-1:<ACCOUNT_ID>:<API_ID>/*"
```

Full route table:

| Route | Function |
|---|---|
| `POST /v1/telemetry` | `clara-api-ingest` |
| `GET /v1/facilities`, `GET /v1/facilities/{facilityId}` | `clara-api-facilities` |
| `GET /v1/assets`, `GET /v1/assets/{assetId}` | `clara-api-assets` |
| `GET /v1/alerts`, `PATCH /v1/alerts/{alertId}` | `clara-api-alerts` |
| `POST /v1/esg/reports` | `clara-api-reports` |

### 9.3 Stage + throttling

```bash
aws apigatewayv2 create-stage --api-id <API_ID> --stage-name prod --auto-deploy \
  --default-route-settings '{"ThrottlingBurstLimit":100,"ThrottlingRateLimit":50}'

aws apigatewayv2 get-api --api-id <API_ID> --query ApiEndpoint --output text
# → https://<API_ID>.execute-api.af-south-1.amazonaws.com
```

**✅ Verify Phase 9:**

```bash
# No token → 401
curl -i https://<API_ID>.execute-api.af-south-1.amazonaws.com/prod/v1/facilities

# With token from Phase 4.6 verification → 200 with only that tenant's facilities
curl -H "Authorization: Bearer <ID_TOKEN>" \
  https://<API_ID>.execute-api.af-south-1.amazonaws.com/prod/v1/facilities
```

---

## Phase 10 — Amazon SageMaker (10 ML Endpoints)

> Model **training** is separate ML infrastructure (out of scope per CLAUDE.md §17). This phase
> deploys already-trained artifacts from S3 to real-time endpoints. Until artifacts exist, the
> orchestrator's `SYNTHETIC_MODE` returns deterministic scripted outputs (the CHL-01 demo data),
> so the platform demos fully without any endpoint live.

### 10.1 Endpoint naming (matches Lambda env vars)

| Endpoint name | Model (user-facing) |
|---|---|
| `clara-failure-forecast` | Failure Forecast |
| `clara-fault-type-identifier` | Fault Type Identifier |
| `clara-energy-baseline` | Energy Baseline |
| `clara-energy-waste-detector` | Energy Waste Detector |
| `clara-sound-health-monitor` | Sound Health Monitor |
| `clara-safe-operating-range` | Safe Operating Range |
| `clara-insights` | Clara AI Insights |
| `clara-pue-optimiser` | PUE Optimiser |
| `clara-hot-spot-tracker` | Hot Spot Tracker |
| `clara-power-quality-guard` | Power Quality Guard |

### 10.2 Deploy one endpoint (repeat per model)

```bash
# 1. Model — artifact from the ML team's S3 path
aws sagemaker create-model \
  --model-name clara-failure-forecast-v1 \
  --execution-role-arn arn:aws:iam::<ACCOUNT_ID>:role/clara-sagemaker-exec \
  --primary-container '{
    "Image": "<ACCOUNT_ID>.dkr.ecr.af-south-1.amazonaws.com/clara-models:failure-forecast-v1",
    "ModelDataUrl": "s3://clara-datasets-<ACCOUNT_ID>/model-artifacts/failure-forecast/model.tar.gz"
  }'

# 2. Endpoint config — serverless inference keeps PoC cost near zero
aws sagemaker create-endpoint-config \
  --endpoint-config-name clara-failure-forecast-cfg-v1 \
  --production-variants '[{
    "VariantName": "primary",
    "ModelName": "clara-failure-forecast-v1",
    "ServerlessConfig": { "MemorySizeInMB": 2048, "MaxConcurrency": 5 }
  }]'

# 3. Endpoint
aws sagemaker create-endpoint \
  --endpoint-name clara-failure-forecast \
  --endpoint-config-name clara-failure-forecast-cfg-v1

aws sagemaker wait endpoint-in-service --endpoint-name clara-failure-forecast
```

> Use **Serverless Inference** for all 10 endpoints during the PoC — 10 always-on
> `ml.m5.large` instances would cost ~US$1,700/month idle. Switch hot-path endpoints
> (Failure Forecast, Energy Baseline) to provisioned instances only if demo latency demands it.

### 10.3 Invocation from Lambda

Already wired via env vars in Phase 8. Pattern (`lib/aws/sagemaker.ts` mirrors this in the app):

```typescript
import { SageMakerRuntimeClient, InvokeEndpointCommand } from '@aws-sdk/client-sagemaker-runtime';

const client = new SageMakerRuntimeClient({ region: 'af-south-1' });

const res = await client.send(new InvokeEndpointCommand({
  EndpointName: process.env.SAGEMAKER_ENDPOINT_FAILURE_FORECAST,
  ContentType: 'application/json',
  Body: JSON.stringify({ assetId, window: readings }),
}));
const prediction = JSON.parse(new TextDecoder().decode(res.Body));
// → { predictedTtfDays: 45, confidence: 0.85, healthScore: 82.0 }
```

**✅ Verify Phase 10:** `aws sagemaker list-endpoints --query "Endpoints[?starts_with(EndpointName,'clara')].[EndpointName,EndpointStatus]"` shows `InService` for each deployed model.

---

## Phase 11 — AWS AppSync (Real-Time GraphQL)

Pushes alerts, health scores, and telemetry aggregates to the dashboard over WebSocket.

### 11.1 Schema (`schema.graphql`)

```graphql
type Alert {
  id: ID!
  tenantId: String!
  facilityId: String!
  assetId: String
  severity: String!
  modelName: String!
  title: String!
  description: String!
  createdAt: AWSDateTime!
}

type HealthUpdate {
  tenantId: String!
  assetId: String!
  facilityId: String!
  score: Float!
  predictedTtfDays: Float
  recordedAt: AWSDateTime!
}

type TelemetrySnapshot {
  tenantId: String!
  facilityId: String!
  totalEnergyKw: Float!
  avgHealthScore: Float!
  anomalyCount: Int!
  timestamp: AWSDateTime!
}

type Mutation {
  publishAlert(input: AlertInput!): Alert @aws_iam
  publishHealthUpdate(input: HealthUpdateInput!): HealthUpdate @aws_iam
  publishTelemetrySnapshot(input: TelemetrySnapshotInput!): TelemetrySnapshot @aws_iam
}

type Subscription {
  onAlert(tenantId: String!): Alert
    @aws_subscribe(mutations: ["publishAlert"]) @aws_cognito_user_pools
  onHealthUpdate(tenantId: String!): HealthUpdate
    @aws_subscribe(mutations: ["publishHealthUpdate"]) @aws_cognito_user_pools
  onTelemetrySnapshot(tenantId: String!): TelemetrySnapshot
    @aws_subscribe(mutations: ["publishTelemetrySnapshot"]) @aws_cognito_user_pools
}

input AlertInput { tenantId: String!, facilityId: String!, assetId: String, severity: String!, modelName: String!, title: String!, description: String! }
input HealthUpdateInput { tenantId: String!, assetId: String!, facilityId: String!, score: Float!, predictedTtfDays: Float }
input TelemetrySnapshotInput { tenantId: String!, facilityId: String!, totalEnergyKw: Float!, avgHealthScore: Float!, anomalyCount: Int! }

type Query { _noop: String }
```

### 11.2 Create the API

```bash
aws appsync create-graphql-api \
  --name clara-realtime \
  --authentication-type AMAZON_COGNITO_USER_POOLS \
  --user-pool-config "userPoolId=<USER_POOL_ID>,awsRegion=af-south-1,defaultAction=ALLOW" \
  --additional-authentication-providers '[{"authenticationType":"AWS_IAM"}]'
# → note apiId and the GRAPHQL + REALTIME endpoint URIs

aws appsync start-schema-creation \
  --api-id <APPSYNC_API_ID> \
  --definition fileb://schema.graphql
```

Dual auth is the key design: **Cognito** for browser subscriptions, **IAM** for Lambda mutations.

### 11.3 NONE data source + pass-through resolvers

The mutations don't persist anything (RDS is the source of truth) — they exist only to fan out
to subscribers:

```bash
aws appsync create-data-source \
  --api-id <APPSYNC_API_ID> \
  --name PassThrough --type NONE

# JS resolver for each mutation (publishAlert shown)
cat > publish-alert.js <<'EOF'
export function request(ctx) {
  return { payload: ctx.args.input };
}
export function response(ctx) {
  return { ...ctx.result, id: util.autoId(), createdAt: util.time.nowISO8601() };
}
EOF

aws appsync create-resolver \
  --api-id <APPSYNC_API_ID> \
  --type-name Mutation --field-name publishAlert \
  --data-source-name PassThrough \
  --runtime name=APPSYNC_JS,runtimeVersion=1.0.0 \
  --code file://publish-alert.js
```

Repeat for `publishHealthUpdate` and `publishTelemetrySnapshot`.

### 11.4 Tenant isolation on subscriptions — CRITICAL

A malicious client could subscribe with someone else's `tenantId` argument. Block this with a
subscription **enhanced filter** resolver that forces the argument to match the caller's JWT claim:

```javascript
// resolver on Subscription.onAlert (and the other two)
import { util, extensions } from '@aws-appsync/utils';

export function request(ctx) { return { payload: null }; }

export function response(ctx) {
  const claimTenant = ctx.identity.claims['tenant_id']
    ?? ctx.identity.claims['custom:tenant_id'];
  if (!claimTenant || ctx.args.tenantId !== claimTenant) {
    util.unauthorized();
  }
  extensions.setSubscriptionFilter(
    util.transform.toSubscriptionFilter({ tenantId: { eq: claimTenant } })
  );
  return null;
}
```

**Without this resolver, real-time data leaks across tenants. Do not skip it. Test it (Phase 16).**

### 11.5 Wire the orchestrator

Update the orchestrator's env with the GraphQL endpoint and have `shared/appsync.ts` sign
mutation requests with SigV4 (the Lambda role already has `appsync:GraphQL` from Phase 1.1).

**✅ Verify Phase 11:** In the AppSync console "Queries" tab, sign in as the demo user, run the
`onAlert` subscription, then invoke a `publishAlert` mutation (IAM) from CloudShell — the alert
must arrive on the open subscription. Re-run subscribing with a *different* tenantId — it must be rejected.

---

## Phase 12 — AWS Fargate (Synthetic Telemetry Replay Engine)

> The replay engine's internal logic is separate infrastructure per CLAUDE.md §17 — this phase
> covers its AWS deployment surface only: ECR, ECS cluster, task definition, service.

### 12.1 ECR repository + image push

```bash
aws ecr create-repository --repository-name clara-replay-engine

aws ecr get-login-password | docker login --username AWS \
  --password-stdin <ACCOUNT_ID>.dkr.ecr.af-south-1.amazonaws.com

docker build -t clara-replay-engine ./replay-engine
docker tag clara-replay-engine:latest \
  <ACCOUNT_ID>.dkr.ecr.af-south-1.amazonaws.com/clara-replay-engine:latest
docker push <ACCOUNT_ID>.dkr.ecr.af-south-1.amazonaws.com/clara-replay-engine:latest
```

### 12.2 Cluster + log group

```bash
aws ecs create-cluster --cluster-name clara-cluster \
  --capacity-providers FARGATE FARGATE_SPOT

aws logs create-log-group --log-group-name /ecs/clara-replay-engine
```

### 12.3 Task definition

```bash
cat > replay-task.json <<'EOF'
{
  "family": "clara-replay-engine",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/clara-fargate-exec",
  "taskRoleArn": "arn:aws:iam::<ACCOUNT_ID>:role/clara-replay-task",
  "containerDefinitions": [{
    "name": "replay-engine",
    "image": "<ACCOUNT_ID>.dkr.ecr.af-south-1.amazonaws.com/clara-replay-engine:latest",
    "essential": true,
    "environment": [
      { "name": "IOT_ENDPOINT",      "value": "<IOT_ENDPOINT>" },
      { "name": "DATASET_BUCKET",    "value": "clara-datasets-<ACCOUNT_ID>" },
      { "name": "REPLAY_SPEED",      "value": "1.0" },
      { "name": "TENANT_MANIFEST",   "value": "s3://clara-datasets-<ACCOUNT_ID>/manifests/demo-tenants.json" }
    ],
    "secrets": [
      { "name": "IOT_CERT", "valueFrom": "arn:aws:secretsmanager:af-south-1:<ACCOUNT_ID>:secret:clara/iot/replay-cert" },
      { "name": "IOT_KEY",  "valueFrom": "arn:aws:secretsmanager:af-south-1:<ACCOUNT_ID>:secret:clara/iot/replay-key" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/clara-replay-engine",
        "awslogs-region": "af-south-1",
        "awslogs-stream-prefix": "replay"
      }
    }
  }]
}
EOF

aws ecs register-task-definition --cli-input-json file://replay-task.json
```

(Grant `clara-fargate-exec` an inline `secretsmanager:GetSecretValue` policy scoped to
`clara/iot/*` so the secrets injection works.)

### 12.4 Run as a service (always-on demo stream)

```bash
aws ecs create-service \
  --cluster clara-cluster \
  --service-name clara-replay \
  --task-definition clara-replay-engine \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[<PRIVATE_SUBNET_A>,<PRIVATE_SUBNET_B>],securityGroups=[<REPLAY_SG>],assignPublicIp=DISABLED}"
```

Pause/resume the stream by setting `--desired-count 0|1` (`aws ecs update-service`).
Change replay speed by registering a new task-definition revision with a different `REPLAY_SPEED`.

**✅ Verify Phase 12:** `/ecs/clara-replay-engine` logs show MQTT publishes; the IoT MQTT test
client sees messages on `clara/telemetry/#`; Timestream row counts grow.

---

## Phase 13 — Amazon SES (Transactional Email)

Signup verification (alongside Cognito's own emails), alert digests, and report-ready notices.

### 13.1 Verify the sending domain

```bash
aws sesv2 create-email-identity --email-identity claraai.com
aws sesv2 get-email-identity --email-identity claraai.com \
  --query "DkimAttributes.Tokens"
```

Add the three returned DKIM tokens as CNAME records at your DNS host:

```
<token1>._domainkey.claraai.com → <token1>.dkim.amazonses.com   (×3)
```

Also add SPF (`"v=spf1 include:amazonses.com ~all"`) and a DMARC record.

### 13.2 Move out of the sandbox

In sandbox mode you can only mail verified addresses. For the investor demo + pilot signups,
request production access:

```bash
aws sesv2 put-account-details \
  --mail-type TRANSACTIONAL \
  --website-url https://claraai.com \
  --use-case-description "Transactional email for Clara AI SaaS: signup verification, critical equipment alerts, ESG report delivery. ~500/month." \
  --additional-contact-email-addresses ops@claraai.com \
  --contact-language EN
```

(Approval typically takes ~24h. Until then, verify each demo recipient individually with
`aws sesv2 create-email-identity --email-identity <address>`.)

### 13.3 Templates

```bash
aws sesv2 create-email-template --template-name clara-critical-alert \
  --template-content '{
    "Subject": "CRITICAL: {{assetName}} at {{facilityName}}",
    "Html": "<h2>{{title}}</h2><p>{{description}}</p><p><strong>Recommended:</strong> {{recommendation}}</p><a href=\"{{alertUrl}}\">Open in Clara AI</a>",
    "Text": "{{title}} — {{description}}. Recommended: {{recommendation}}. {{alertUrl}}"
  }'

aws sesv2 create-email-template --template-name clara-report-ready \
  --template-content '{
    "Subject": "Your {{framework}} report for {{facilityName}} is ready",
    "Html": "<p>Your ESG report for {{periodLabel}} has been generated.</p><a href=\"{{downloadUrl}}\">Download (link valid 7 days)</a>",
    "Text": "ESG report ready: {{downloadUrl}}"
  }'
```

The `clara-api-reports` Lambda sends `clara-report-ready` with a pre-signed S3 URL after
generating a PDF; the orchestrator sends `clara-critical-alert` for new CRITICAL alerts
(throttled to one email per asset per hour).

### 13.4 (Optional) Use SES for Cognito's own emails

Once out of sandbox, point the user pool at SES so verification codes come from your domain:

```bash
aws cognito-idp update-user-pool --user-pool-id <USER_POOL_ID> \
  --email-configuration 'SourceArn=arn:aws:ses:af-south-1:<ACCOUNT_ID>:identity/claraai.com,EmailSendingAccount=DEVELOPER,From=noreply@claraai.com'
```

**✅ Verify Phase 13:** `aws sesv2 send-email` with the alert template to your own (verified) address arrives with DKIM=pass.

---

## Phase 14 — CloudWatch (Monitoring & Alerting)

### 14.1 SNS topic for ops alerts

```bash
aws sns create-topic --name clara-ops-alerts
aws sns subscribe --topic-arn arn:aws:sns:af-south-1:<ACCOUNT_ID>:clara-ops-alerts \
  --protocol email --notification-endpoint ops@claraai.com
```

### 14.2 Core alarms

```bash
# Orchestrator errors
aws cloudwatch put-metric-alarm \
  --alarm-name clara-orchestrator-errors \
  --namespace AWS/Lambda --metric-name Errors \
  --dimensions Name=FunctionName,Value=clara-inference-orchestrator \
  --statistic Sum --period 300 --evaluation-periods 1 \
  --threshold 5 --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:af-south-1:<ACCOUNT_ID>:clara-ops-alerts

# API Gateway 5xx
aws cloudwatch put-metric-alarm \
  --alarm-name clara-api-5xx \
  --namespace AWS/ApiGateway --metric-name 5xx \
  --dimensions Name=ApiId,Value=<API_ID> \
  --statistic Sum --period 300 --evaluation-periods 1 \
  --threshold 10 --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:af-south-1:<ACCOUNT_ID>:clara-ops-alerts

# RDS connections (Prisma exhaustion early warning)
aws cloudwatch put-metric-alarm \
  --alarm-name clara-rds-connections \
  --namespace AWS/RDS --metric-name DatabaseConnections \
  --dimensions Name=DBInstanceIdentifier,Value=clara-pg \
  --statistic Average --period 300 --evaluation-periods 2 \
  --threshold 80 --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:af-south-1:<ACCOUNT_ID>:clara-ops-alerts

# IoT rule failures (telemetry silently dropping)
aws cloudwatch put-metric-alarm \
  --alarm-name clara-iot-rule-failures \
  --namespace AWS/IoT --metric-name RuleMessageThrottled \
  --dimensions Name=RuleName,Value=clara_telemetry_to_inference \
  --statistic Sum --period 300 --evaluation-periods 1 \
  --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold \
  --alarm-actions arn:aws:sns:af-south-1:<ACCOUNT_ID>:clara-ops-alerts

# Replay engine down (demo data stops flowing)
aws cloudwatch put-metric-alarm \
  --alarm-name clara-replay-stopped \
  --namespace AWS/ECS --metric-name RunningTaskCount \
  --dimensions Name=ClusterName,Value=clara-cluster Name=ServiceName,Value=clara-replay \
  --statistic Average --period 300 --evaluation-periods 2 \
  --threshold 1 --comparison-operator LessThanThreshold \
  --treat-missing-data breaching \
  --alarm-actions arn:aws:sns:af-south-1:<ACCOUNT_ID>:clara-ops-alerts
```

### 14.3 Log retention (cost control)

```bash
for LG in /aws/lambda/clara-inference-orchestrator /aws/lambda/clara-api-facilities /ecs/clara-replay-engine; do
  aws logs put-retention-policy --log-group-name $LG --retention-in-days 30
done
```

### 14.4 Ops dashboard

Create a CloudWatch dashboard `clara-ops` with: orchestrator invocations/errors/duration,
API Gateway request count + latency p99, RDS CPU/connections, IoT messages published,
ECS running task count, and SageMaker endpoint invocations + model latency.

**✅ Verify Phase 14:** Force an error (invoke the orchestrator with a bad payload 5×) and confirm the SNS email arrives.

---

## Phase 15 — Next.js App Integration

Connecting `clara-ai/` (Next.js 16, App Router) to everything above.

### 15.1 Environment variables

Fill `.env.local` from `.env.example`:

```bash
# Database — app role, NOT admin (RLS depends on this)
DATABASE_URL="postgresql://clara_app:<APP_PASSWORD>@<RDS_ENDPOINT>:5432/claraai?sslmode=require&connection_limit=10"

AWS_REGION="af-south-1"

COGNITO_USER_POOL_ID="<USER_POOL_ID>"
COGNITO_CLIENT_ID="<CLIENT_ID>"
COGNITO_CLIENT_SECRET="<CLIENT_SECRET>"
NEXT_PUBLIC_COGNITO_USER_POOL_ID="<USER_POOL_ID>"
NEXT_PUBLIC_COGNITO_CLIENT_ID="<CLIENT_ID>"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<openssl rand -base64 32>"

NEXT_PUBLIC_APPSYNC_ENDPOINT="https://<APPSYNC_ID>.appsync-api.af-south-1.amazonaws.com/graphql"
NEXT_PUBLIC_APPSYNC_REGION="af-south-1"

IOT_ENDPOINT="<IOT_ENDPOINT>"

SAGEMAKER_ENDPOINT_FAILURE_FORECAST="clara-failure-forecast"
# ... (all 10, names from Phase 10.1)

S3_BUCKET_DATASETS="clara-datasets-<ACCOUNT_ID>"
S3_BUCKET_REPORTS="clara-reports-<ACCOUNT_ID>"

SES_FROM_EMAIL="noreply@claraai.com"

NEXT_PUBLIC_SYNTHETIC_MODE="true"
```

### 15.2 Auth.js v5 + Cognito (`lib/aws/cognito.ts` / `auth.ts`)

```typescript
import NextAuth from 'next-auth';
import Cognito from 'next-auth/providers/cognito';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: `https://cognito-idp.af-south-1.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`,
    }),
  ],
  callbacks: {
    jwt({ token, profile, account }) {
      if (profile) {
        token.tenantId = (profile as Record<string, unknown>)['custom:tenant_id'] ?? (profile as Record<string, unknown>)['tenant_id'];
        token.role = (profile as Record<string, unknown>)['custom:role'] ?? 'FACILITY_MANAGER';
      }
      if (account?.id_token) token.idToken = account.id_token; // forwarded to API Gateway + AppSync
      return token;
    },
    session({ session, token }) {
      session.tenantId = token.tenantId as string;
      session.role = token.role as string;
      return session;
    },
  },
});
```

Middleware (`middleware.ts` / `proxy.ts` per the project's Next.js 16 proxy convention) rejects
any `(app)` route where the session lacks `tenantId`.

### 15.3 Tenant-scoped Prisma wrapper (`lib/db/client.ts`)

Every server-side query runs inside a transaction that sets the RLS context:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = globalThis.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;

export async function withTenant<T>(
  tenantId: string,
  fn: (tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0]) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_tenant_id = '${tenantId.replace(/'/g, "''")}'`,
    );
    return fn(tx);
  });
}
```

All query functions in `lib/db/queries/*` take the transaction client — never the bare `prisma`
instance — so no query can run without tenant context.

### 15.4 AppSync subscriptions (`lib/aws/appsync.ts` + hooks)

```typescript
import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT!,
      region: process.env.NEXT_PUBLIC_APPSYNC_REGION!,
      defaultAuthMode: 'userPool',
    },
  },
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
    },
  },
});

export const realtimeClient = generateClient();
```

`hooks/use-real-time-alerts.ts` subscribes to `onAlert(tenantId)` (tenantId from `useTenant()`),
pushes into the Zustand alert store, triggers the critical banner for CRITICAL severity, and
updates the header's `LAST SYNC` timestamp on every message. `use-facility-health.ts` and
`use-telemetry.ts` follow the same pattern on the other two subscriptions.

### 15.5 Hosting the Next.js app

The dashboard itself can run on Vercel or AWS. If hosting on AWS for a single-cloud story:

1. Build a standalone image: `output: 'standalone'` in `next.config.ts`, multi-stage Dockerfile.
2. Push to ECR (`clara-web` repo), run on the existing `clara-cluster` as a Fargate service
   (2 tasks, 512 CPU / 1024 MB) behind an ALB in the public subnets.
3. ACM certificate for `app.claraai.com` → ALB HTTPS listener; Route 53 alias record.
4. The app's task role needs: Secrets Manager read (`clara/rds/app`), `ses:SendEmail`,
   `s3:GetObject/PutObject` on the reports bucket, `sagemaker:InvokeEndpoint` on `clara-*`.

**✅ Verify Phase 15:** `npm run dev`, log in as `demo@claraai.com`, confirm: dashboard renders
the 4 seeded facilities, the LIVE DATA badge pulses, and acknowledging an alert persists.

---

## Phase 16 — End-to-End Smoke Test

Run the full chain in order. Every step must pass before the investor demo.

| # | Test | Expected |
|---|---|---|
| 1 | Replay engine running (`desired-count 1`) | MQTT messages visible on `clara/telemetry/#` |
| 2 | Timestream query for last 5 min | Rows with all 5 dimensions populated |
| 3 | Orchestrator CloudWatch logs | SageMaker invocations + HealthScore writes |
| 4 | Login as `demo@claraai.com` | Dashboard shows JHB-DC-01, CPT-MFG-01, PTA-HQ-01, DBN-LOG-01 |
| 5 | Open `/equipment/<CHL-01 id>` | Health 82.0%, TTF 45d, fault "Stage 2 Compressor Shaft Bearing Wear", FFT peak at 298 Hz highlighted |
| 6 | Publish a test CRITICAL alert via AppSync mutation | Banner appears on dashboard within ~2s; LAST SYNC updates |
| 7 | **Cross-tenant isolation (API)** — call `GET /v1/facilities` with Tenant A's token, attempt Tenant B's facility id on `GET /v1/facilities/{id}` | 404/403, never Tenant B data |
| 8 | **Cross-tenant isolation (RLS)** — `withTenant(tenantA, …)` query for a Tenant B asset id | Empty result |
| 9 | **Cross-tenant isolation (WebSocket)** — subscribe `onAlert` with mismatched tenantId | Subscription rejected (`Unauthorized`) |
| 10 | Generate ESG report (`POST /v1/esg/reports`) | PDF lands in `clara-reports/<tenant_id>/…`, SES email with working pre-signed link |
| 11 | Stop replay service | `clara-replay-stopped` alarm fires within 10 min |

Tests 7–9 are the security gate. **Any cross-tenant leak is a release blocker.**

---

## Appendix A — Region Strategy & Service Availability

Primary region: **af-south-1 (Cape Town)** — South Africa data residency for the ZAR-market pilot.

| Service | af-south-1? | Decision |
|---|---|---|
| Cognito, API Gateway, Lambda, IoT Core, RDS, S3, SES, Fargate/ECS, CloudWatch, AppSync, SageMaker | ✅ | Deploy in af-south-1 |
| **Timestream for LiveAnalytics** | ❌ (and closed to new customers in many accounts) | `eu-west-1`, or **Timestream for InfluxDB in af-south-1** (preferred fallback — keeps everything in-region). Flag the final choice against CLAUDE.md. |

If Timestream ends up in `eu-west-1`, telemetry crosses regions (~150–180 ms RTT). That's fine
for the dashboard (queries are aggregations, not interactive round-trips per keystroke), but
keep the orchestrator's *write* path (IoT→Lambda→RDS/AppSync) entirely in af-south-1 so alerts
stay snappy.

## Appendix B — Cost Controls for the PoC

Estimated PoC monthly run-rate (single replay stream, serverless SageMaker): **US$250–450/month**.

1. **SageMaker Serverless Inference** for all 10 endpoints — biggest single saving (~$1,700/mo avoided).
2. `db.t4g.medium` single-AZ RDS; stop the instance outside demo windows if idle for days.
3. Replay engine `desired-count 0` when not demoing — one command, instant savings.
4. One NAT gateway, not per-AZ (acceptable PoC availability trade-off, ~$32/mo each).
5. CloudWatch log retention at 30 days everywhere.
6. Budget alarm:

```bash
aws budgets create-budget --account-id <ACCOUNT_ID> --budget '{
  "BudgetName": "clara-poc-monthly",
  "BudgetLimit": { "Amount": "500", "Unit": "USD" },
  "TimeUnit": "MONTHLY", "BudgetType": "COST"
}' --notifications-with-subscribers '[{
  "Notification": { "NotificationType": "ACTUAL", "ComparisonOperator": "GREATER_THAN", "Threshold": 80 },
  "Subscribers": [{ "SubscriptionType": "EMAIL", "Address": "ops@claraai.com" }]
}]'
```

## Appendix C — Teardown

Reverse dependency order:

```bash
aws ecs update-service --cluster clara-cluster --service clara-replay --desired-count 0
aws ecs delete-service --cluster clara-cluster --service clara-replay --force
aws ecs delete-cluster --cluster clara-cluster
for E in failure-forecast fault-type-identifier energy-baseline energy-waste-detector sound-health-monitor safe-operating-range insights pue-optimiser hot-spot-tracker power-quality-guard; do
  aws sagemaker delete-endpoint --endpoint-name clara-$E
done
aws appsync delete-graphql-api --api-id <APPSYNC_API_ID>
aws apigatewayv2 delete-api --api-id <API_ID>
# Lambda functions, IoT rules/things/certs, Timestream, RDS (final snapshot!), S3 (empty first),
# Cognito pool, NAT gateway (stop paying immediately), then VPC, then IAM roles.
aws rds delete-db-instance --db-instance-identifier clara-pg \
  --final-db-snapshot-identifier clara-pg-final
```

---

*Companion documents: [INTEGRATION.md](./INTEGRATION.md) (service wiring reference),
[CLAUDE.md](../CLAUDE.md) (project brief — schema, screens, conventions).*
