# CRYON61 STUDIO — Katabump deployment

## 1. Database
Create a PostgreSQL database and copy its connection string into `DATABASE_URL`.

## 2. Environment
Copy `.env.example` to the hosting environment and set real values. At minimum:

- `APP_URL`
- `DATABASE_URL`
- `AUTH_SECRET`
- `OWNER_EMAIL`
- `OWNER_PASSWORD`
- `MIDTRANS_SERVER_KEY`
- `MIDTRANS_IS_PRODUCTION`
- `PRIVATE_STORAGE_PATH`

## 3. Build

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run build
npm start
```

Use the port assigned by the hosting panel. If the panel provides `PORT`, configure the Node start command/environment according to the host's standard Node.js deployment mechanism.

## 4. Midtrans

Webhook:

`https://YOUR-DOMAIN/api/payments/midtrans/webhook`

Start with sandbox credentials. Only switch `MIDTRANS_IS_PRODUCTION=true` after a successful end-to-end test.

## 5. Private assets

The default storage path is `./storage/private`. This requires persistent disk. If the hosting environment uses ephemeral containers, move product files to S3-compatible object storage and implement the same StorageProvider interface before selling real assets.

## 6. HTTPS

Use the hosting provider's HTTPS/domain configuration. Keep secure cookies enabled in production.

## 7. Backup

Back up PostgreSQL and private product storage separately.

## 8. Production checklist

- [ ] PostgreSQL connected
- [ ] HTTPS active
- [ ] `AUTH_SECRET` changed
- [ ] Owner password changed
- [ ] Midtrans sandbox tested
- [ ] Midtrans webhook verified
- [ ] Private storage persistent
- [ ] Database backups configured
- [ ] Real products uploaded
- [ ] Product licenses tested
- [ ] Download authorization tested
