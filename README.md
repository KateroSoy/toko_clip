# TokoClip — Vercel + OpenShorts + Simple Auth

Frontend customer TokoClip yang dapat dideploy di Vercel. Video diproses melalui OpenShorts API; OpenShorts API key tetap server-side.

## Authentication

- 100 akun customer hardcoded: `tokoclip001` sampai `tokoclip100`.
- Source app hanya menyimpan SHA-256 password, bukan password plaintext.
- Session menggunakan signed **HttpOnly cookie**, berlaku 12 jam.
- `/`, `/api/process`, dan `/api/status/*` hanya dapat digunakan setelah login.
- Daftar credential lengkap diberikan terpisah sebagai `tokoclip-100-accounts-OWNER-ONLY.csv`. Jangan commit file tersebut.

## Environment variables di Vercel

```env
OPENSHORTS_API_KEY=osk_xxx
OPENSHORTS_API_URL=https://api.openshorts.app
AUTH_SECRET=<random-string-minimal-32-karakter>
```

Generate `AUTH_SECRET` dengan salah satu cara:

```bash
openssl rand -base64 48
```

atau:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Local

```bash
npm install
cp .env.example .env.local
# isi API key + AUTH_SECRET
npm run dev
```

Buka `http://localhost:3000/login`.

## Deploy Vercel

1. Push folder project ini ke GitHub private repository.
2. Import repository di Vercel.
3. Tambahkan tiga environment variable di atas.
4. Deploy.
5. Bagikan satu credential dari CSV owner-only kepada setiap customer.

## Security notes

Ini sengaja dibuat sebagai **simple hardcoded auth**. Untuk produk berbayar berskala besar, migrasikan akun ke database/Auth provider agar password reset, disable user, audit, rate limit, dan usage quota dapat dikelola tanpa redeploy.
