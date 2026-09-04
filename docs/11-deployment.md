# 11 · Deployment guide

## 11.1 Client (this app)

```bash
# 1. verify
npx tsc --noEmit
npx expo export --platform all

# 2. EAS builds (native)
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit -p ios

# 3. Web build (Vercel)
npm run build:web     # expo export --platform web -> dist/
vercel --prod
```

`app.json` already pins `runtimeVersion: appVersion` and an update channel, so OTA updates ship through `eas update --branch production`.

## 11.2 Backend (FastAPI)

```bash
docker build -t bkk-transit-api .
docker run -p 8000:8000 -e DATABASE_URL=postgresql://... bkk-transit-api
# migrations
alembic upgrade head
# GTFS nightly job (03:00 ICT)
celery -A jobs beat -l info
```

Environment variables:

```
DATABASE_URL=postgresql://user:pass@host:5432/bkktransit
REDIS_URL=redis://host:6379/0
GTFS_STATIC_URLS=https://.../bmta.zip,...
GTFS_RT_URLS=https://.../bmta-rt,https://.../mrt-rt
SUPABASE_JWT_SECRET=...
OPENAI_API_KEY=...            # assistant reasoning (optional, rule fallback on)
```

## 11.3 Data platform (Supabase / PostGIS)

1. Create project → enable PostGIS + pgvector extensions.
2. Run `docs/02-database-schema.md` DDL (or `DB_SCHEMA_SQL` in-app).
3. Nightly ETL: download → validate (MobilityData) → upsert → rebuild `transit_edges`.
4. Backups: PITR on, nightly logical dump to object storage.

## 11.4 Edge / CDN (Cloudflare)


* DNS + CDN in front of API and tile server.
* Cache rules: `/tiles/*` → cache everything (1 y), `/v1/*` → bypass.
* Rate limit `/v1/assistant/message` (30 req/min per IP).

## 11.5 Release checklist

- [ ] `tsc --noEmit` clean · `expo export --platform all` succeeds
- [ ] Fare matrices reviewed against operator calculators (BTS/MRT/ARL)
- [ ] GTFS static version bumped + validator report attached
- [ ] Trilingual copy reviewed by native speakers (TH, MY)
- [ ] Accessibility pass (font scale, contrast, reduce motion)
- [ ] Store metadata in TH/EN, screenshots for 6.7" and tablet
- [ ] Rollout: internal → 10 % → 50 % → 100 % (crash-free ≥ 99.5 %)

## 11.6 Monitoring

| Signal | Tool | Alert |
|---|---|---|
| API p95 latency | Cloudflare Analytics | > 400 ms for 5 min |
| RT feed age | backend metric | > 120 s |
| Client crash-free sessions | Sentry | < 99 % |
| Route success rate | `/v1/journey` counter | < 97 % |
