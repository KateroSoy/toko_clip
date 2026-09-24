# Auth Test Report

Status: **PASS untuk implementasi auth dan static TypeScript validation**.

## Verified

- 100 akun hardcoded tersedia: `tokoclip001`–`tokoclip100`.
- 100 password unik.
- 100/100 credential plaintext pada owner CSV cocok dengan SHA-256 yang tertanam di server source.
- Tidak ada password plaintext customer di project deployment.
- `/api/process` memerlukan signed login session.
- `/api/status/[jobId]` memerlukan signed login session.
- Session memakai HttpOnly, SameSite=Lax cookie dan HMAC-SHA256 signature.
- Session expired setelah 12 jam.
- TypeScript source melewati isolated syntax/type validation dengan stub framework types.

## Build environment note

Full `npm install && next build` tidak dapat diselesaikan di sandbox karena instalasi dependency eksternal timeout. Project menggunakan Next.js 15.5.2 / React 19.1.0 dan package manifest tetap siap untuk Vercel, yang akan menginstal dependency saat deployment.

## Production note

Hardcoded auth cocok untuk MVP/simple customer gate. Disable/reset satu akun memerlukan perubahan source + redeploy. Untuk skala lebih besar gunakan database/auth provider dan quota per customer.
