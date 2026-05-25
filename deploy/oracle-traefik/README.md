# VisaCoach on Oracle Traefik

This bundle fits the Docker layout already running on the Oracle instance:

```text
/opt/docker
  compose.yaml
  apps/
    visacoach/
      compose.yaml
      backend.Dockerfile
      frontend.Dockerfile
      nginx.conf
      source/
  data/
    visacoach/
      backend.env
```

The app is public by default. Do not add `authelia@docker` to these routers unless you intentionally want to block public practice sessions behind your private SSO.

## 1. Add The App Directory

On the Oracle host:

```bash
cd /opt/docker
mkdir -p apps/visacoach
```

Copy the files from this directory into `/opt/docker/apps/visacoach/`.

Then put the VisaCoach source checkout at:

```text
/opt/docker/apps/visacoach/source
```

For example:

```bash
cd /opt/docker/apps/visacoach
git clone <your-visacoach-repo-url> source
```

## 2. Add The Include

In `/opt/docker/compose.yaml`, add:

```yaml
  - apps/visacoach/compose.yaml
```

near the other `include:` entries.

## 3. Add Public Host Settings

In `/opt/docker/.env`, add:

```bash
VISACOACH_HOSTNAME=visa.yourdomain.com
VISACOACH_APP_DIR=/opt/docker/apps/visacoach
VISACOACH_GOOGLE_CLIENT_ID=
```

`VISACOACH_APP_DIR` can be omitted if you keep the app at `/opt/docker/apps/visacoach`. `VISACOACH_GOOGLE_CLIENT_ID` is optional. If you use Google OAuth, set it to the same OAuth client ID used by the frontend.

If `/opt/docker/.env` does not already define `DOCKER_DATA_DIR`, add:

```bash
DOCKER_DATA_DIR=/opt/docker/data
```

Docker Compose reads `/opt/docker/.env` when you run commands from `/opt/docker`, but your interactive shell does not automatically load those variables. If `echo $DOCKER_DATA_DIR` is empty in SSH, that does not mean Compose is missing it. Use `/opt/docker/data` directly in shell commands, or run `set -a && source /opt/docker/.env && set +a` for that shell session.

Point the Porkbun DNS record for `visa.yourdomain.com` to the Oracle instance public IP.

## 4. Add Backend Secrets

Create the backend secret file:

```bash
cd /opt/docker
mkdir -p data/visacoach
cp apps/visacoach/backend.env.example data/visacoach/backend.env
nano data/visacoach/backend.env
```

Fill:

- `MONGODB_URI`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- optional rate limit/log settings

## 5. Build And Start

From `/opt/docker`:

```bash
docker compose --profile visacoach build visacoach-backend visacoach-frontend
docker compose --profile visacoach up -d visacoach-backend visacoach-frontend
```

Check status:

```bash
docker ps --filter name=visacoach
docker logs --tail=100 visacoach-backend
curl -I https://visa.yourdomain.com/
curl https://visa.yourdomain.com/api/live
curl https://visa.yourdomain.com/health
curl https://visa.yourdomain.com/api/health
```

`/api/live` should return `200` whenever the backend process is running. `/api/health` can return `503` with `status: "degraded"` if MongoDB is unreachable.

From the source checkout, you can also run:

```bash
cd /opt/docker/apps/visacoach/source
APP_URL=https://visa.yourdomain.com npm run smoke:prod
```

This smoke test avoids Gemini calls so it does not spend AI quota.

For AI/quota visibility, inspect the detailed health payload:

```bash
curl https://visa.yourdomain.com/api/health
```

Look at `checks.ai.quotaCooldown` and `checks.ai.usageSinceStart`. These fields are runtime counters only; they reset when the backend container restarts and do not include secrets or applicant answers.

If `/api/health` returns the React HTML instead of JSON, Traefik is sending API paths to the frontend. Re-copy the latest `compose.yaml`, restart the VisaCoach containers, and inspect the backend router labels:

```bash
cd /opt/docker/apps/visacoach
cp source/deploy/oracle-traefik/compose.yaml .
cd /opt/docker
docker compose --profile visacoach up -d --force-recreate visacoach-backend visacoach-frontend
docker inspect visacoach-backend --format '{{json .Config.Labels}}'
```

## Updates

Pull source changes, rebuild, and restart:

```bash
cd /opt/docker/apps/visacoach/source
git pull
cd /opt/docker
docker compose --profile visacoach build visacoach-backend visacoach-frontend
docker compose --profile visacoach up -d visacoach-backend visacoach-frontend
```
