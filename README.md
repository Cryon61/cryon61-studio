# CRYON61 STUDIO

Full-stack Roblox digital asset marketplace built with Next.js 14, TypeScript, Tailwind CSS, PostgreSQL and Prisma.

## Features

- Dark premium marketplace UI
- User authentication and RBAC
- Marketplace search/filter/sorting
- Product pages and categories
- Cart and checkout
- Midtrans Snap payment architecture
- Webhook verification and idempotency
- Orders and payment records
- Digital product licenses
- Roblox User ID binding
- License verification API
- Protected private downloads
- Reviews and wishlist
- Coupon foundation
- Seller applications
- Admin dashboard
- Product publishing workflow
- Audit/admin logs
- Private file storage foundation
- Docker support

## Requirements

- Node.js >= 18.18
- PostgreSQL 14+
- Persistent disk if local private storage is used

## Local setup

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open http://localhost:3000.

## Production

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start
```

Set `APP_URL`, `DATABASE_URL`, `AUTH_SECRET`, owner credentials and payment/storage/email secrets in the hosting environment.

## Midtrans

Set `MIDTRANS_SERVER_KEY`. The checkout creates a Snap transaction server-side. Configure the Midtrans notification/webhook URL to:

`https://YOUR-DOMAIN/api/payments/midtrans/webhook`

Never trust a browser payment success flag. The webhook is verified with Midtrans `signature_key` before an order is completed.

Midtrans Snap supports multiple Indonesian payment methods depending on your merchant configuration. Additional providers can be added behind the same payment abstraction later.

## Private files

Paid asset files are stored outside `public/` using `PRIVATE_STORAGE_PATH`. For a multi-instance deployment, replace the local storage implementation with S3-compatible object storage so files persist independently from the application container.

## Roblox license API

`POST /api/license/verify`

```json
{
  "licenseKey": "CRYON61-...",
  "robloxUserId": "11083210975"
}
```

The response returns a boolean `valid` and product/license status. Keep this endpoint rate-limited and do not expose secrets in Roblox client code.

## Katabump deployment checklist

1. Create PostgreSQL database and obtain `DATABASE_URL`.
2. Upload the project or connect the repository.
3. Select Node.js 18+.
4. Install dependencies.
5. Add environment variables from `.env.example`.
6. Run `npx prisma generate`.
7. Run `npx prisma migrate deploy`.
8. Run `npm run build`.
9. Start with `npm start`.
10. Configure your domain/HTTPS.
11. Configure Midtrans webhook URL.
12. Verify a sandbox payment before production credentials.
13. Make sure the server has persistent storage if using local private files.
14. Back up PostgreSQL regularly.

Exact Katabump UI/plan options can change, so use the Node.js/PostgreSQL deployment controls available on your account rather than relying on a hard-coded panel path.
