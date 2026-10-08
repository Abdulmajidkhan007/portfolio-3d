# Firebase migratsiyasi va backend

> Netlify'dan Firebase'ga ko'chirish. Sayt endi **statik emas** — aloqa
> formasi haqiqiy backend orqali ishlaydi.

**Oxirgi yangilanish:** 2026-10-03

---

## Nega ko'chirildi

Netlify hisobi yopildi. Lekin ko'chirish faqat "hosting almashtirish" emas edi:
aloqa formasi **Netlify Forms** ga tayanardi — bu Netlify'ning o'z xizmati va
boshqa hech qayerda yo'q. Ya'ni hostingni almashtirish avtomatik ravishda
**backend yozishni** talab qildi.

Natijada loyiha statik saytdan **full-stack** loyihaga aylandi.

---

## Backendda nima ishlatilgan

| Qatlam | Texnologiya | Vazifasi |
|---|---|---|
| Hosting | **Firebase Hosting** | `dist/` statik fayllari, CDN, SSL, SPA rewrite |
| Backend | **Cloud Functions (2-avlod)** | `POST /api/contact` endpointi |
| Runtime | **Node.js 22** + TypeScript 5.9 | funksiya kodi |
| Baza | **Cloud Firestore** | kelgan xabarlar (`messages`), rate limit hisobi (`rate_limits`) |
| Admin kirish | **firebase-admin SDK** | funksiya ichidan Firestore'ga yozish |
| Maxfiy qiymatlar | **Firebase Secrets** (`defineSecret`) | Telegram tokeni — kodda ham, `.env` da ham emas |
| Xavfsizlik | **Firestore Security Rules** | brauzerdan o'qish ham, yozish ham **butunlay** taqiqlangan |
| Bildirishnoma | **Telegram Bot API** | yangi xabar kelganda darhol xabar |

Region: `europe-west1` (O'zbekistonga eng yaqin arzon region).

### Fayllar

```
firebase.json          hosting, rewrite'lar, sarlavhalar, CSP, emulyator portlari
.firebaserc            loyiha ID si
firestore.rules        barcha mijoz kirishini taqiqlaydi
functions/
  package.json         Node 22, firebase-admin, firebase-functions
  tsconfig.json        module: node16 (subpath importlar uchun shart)
  src/validate.ts      toza tekshiruv mantig'i — Firebase'ga bog'liq emas
  src/index.ts         contact funksiyasi: validatsiya → limit → Firestore → Telegram
```

---

## Oqim: forma bosilgandan keyin nima bo'ladi

```
Brauzer                    Firebase Hosting          Cloud Function         Firestore
   │                              │                        │                    │
   ├─ POST /api/contact ─────────►│                        │                    │
   │  {name,email,message,        ├─ rewrite ─────────────►│                    │
   │   botField}                  │                        │                    │
   │                              │                   1. parseContact()         │
   │                              │                   2. honeypot?              │
   │                              │                   3. rate limit ───────────►│
   │                              │                   4. xabarni saqlash ──────►│
   │                              │                   5. Telegram xabari        │
   │◄──────── 200 {ok:true} ──────┤◄───────────────────────┤                    │
```

**Muhim:** `firebase.json` dagi rewrite tartibi. `/api/contact` **birinchi**,
`**` (SPA catch-all) **keyin** turishi shart. Aks holda POST so'rov
`index.html` ga tushadi, 200 HTML qaytadi va forma "muvaffaqiyat" deb
ko'rsatadi — xabar esa hech qayerga bormaydi. Bu jimgina buziladigan xato,
shuning uchun `contact-contract.test.ts` tartibni tekshiradi.

---

## Himoya qatlamlari

1. **Honeypot** — `botField` inputi odamdan yashirin. To'ldirilgan bo'lsa
   funksiya `200 OK` qaytaradi, lekin **hech narsa saqlamaydi**. Bot
   "muvaffaqiyat" ko'radi va qayta urinmaydi.
2. **Server tomon validatsiya** — mijoz tekshiruvi faqat qulaylik uchun.
   HTTP so'rovni `curl` bilan ham yuborish mumkin.
3. **Rate limit** — bitta IP dan daqiqasiga 3 ta. Firestore tranzaksiyasida
   hisoblanadi, shuning uchun parallel so'rovlar ham to'g'ri sanaladi.
4. **Firestore Rules** — `allow read, write: if false`. Admin SDK qoidalarni
   chetlab o'tadi, shuning uchun funksiya ishlayveradi, brauzer esa yo'q.
5. **CSP** — `script-src 'self' 'sha256-...'`, `connect-src 'self'`.
   Endpoint bir xil domenda bo'lgani uchun CSP ni kengaytirish shart emas.

---

## O'rnatish va deploy

### 1. Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Loyiha yaratish

[console.firebase.google.com](https://console.firebase.google.com) → **Add project**.

Keyin `.firebaserc` dagi `BU_YERGA_FIREBASE_PROJECT_ID` ni haqiqiy ID ga almashtiring:

```json
{ "projects": { "default": "abdullohkhan-portfolio" } }
```

### 3. Firestore'ni yoqish

Console → **Firestore Database** → **Create database** → **Production mode**
→ region `eur3` yoki `europe-west1`.

### 4. Blaze rejasi

Cloud Functions **Blaze** (pay-as-you-go) rejasini talab qiladi. Bepul kvota
katta (oyiga 2 mln chaqiruv), portfolio uchun amalda 0 so'm chiqadi, lekin
karta biriktirish shart. Console → **Upgrade**.

> Kutilmagan hisobdan saqlanish uchun: Console → Usage and billing →
> **Budget alerts** → oyiga $1 limit qo'ying.

### 5. Telegram bildirishnomasi (ixtiyoriy)

```bash
firebase functions:secrets:set TELEGRAM_BOT_TOKEN
firebase functions:secrets:set TELEGRAM_CHAT_ID
```

Sozlanmasa funksiya baribir ishlaydi — xabar faqat Firestore'ga yoziladi.

### 6. Sayt manzilini to'g'rilash

`index.html` dagi `canonical`, `og:url`, `og:image` va `src/data/content.ts`
dagi `live` manzili hozir `https://abdullohkhan-portfolio.web.app` ga ishora
qiladi. Loyiha ID ingiz boshqa bo'lsa — o'zgartiring.

### 7. Deploy

```bash
npm install
npm run build
cd functions && npm install && cd ..
firebase deploy
```

Faqat bitta qismni yangilash:

```bash
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
```

---

## Telefondan deploy (GitHub Actions) — terminal kerak emas

Kompyuter bo'lmasa ham bo'ladi: kod `main` ga push qilinganda
`.github/workflows/deploy.yml` saytni va funksiyani o'zi joylaydi. Siz faqat
bir marta brauzerda sozlaysiz (hammasi telefondan qilinadi).

### 1. Firebase loyiha
[console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
Nomi: `abdullohkhan-portfolio`. Pastdagi **Project ID** ham aynan shunday
bo'lsin — saytdagi manzillar (`canonical`, sitemap, rezyume) shu nomga
bog'langan. Band bo'lsa — boshqa ID oling va Claude'ga ayting, manzillar
yangilanadi. Google Analytics — o'chiq.

### 2. Blaze rejasi
⚙️ → **Usage and billing** → **Details & settings** → **Modify plan** → **Blaze**
→ mavjud billing hisobini tanlang (Atoyo'dagi). Bepul kvota bu sayt uchun
yetarli. Xavfsizlik uchun
[console.cloud.google.com/billing](https://console.cloud.google.com/billing) →
**Budgets & alerts** → 1 $ lik ogohlantirish qo'ying.

### 3. Firestore
**Build → Firestore Database → Create database → Production mode** →
location `eur3` (yoki `europe-west1`).

### 4. Service account kaliti
⚙️ **Project settings → Service accounts → Generate new private key** →
JSON fayl telefoningizga yuklanadi.

Unga deploy huquqi bering:
`console.cloud.google.com/iam-admin/iam?project=<PROJECT_ID>` → ro'yxatdan
`firebase-adminsdk-...` qatorini toping → ✏️ → **Add another role** →
**Owner** → **Save**.

> ⚠️ Bu kalit loyihani to'liq boshqaradi. Faqat GitHub secret'ga qo'ying,
> hech kimga yubormang; 5-qadamdan keyin telefondagi JSON faylni o'chiring.

### 5. GitHub sozlamalari
`github.com/Abdulmajidkhan007/portfolio-3d` → **Settings → Secrets and
variables → Actions**:

| Tab | Nomi | Qiymati |
|---|---|---|
| Variables | `FIREBASE_PROJECT_ID` | `abdullohkhan-portfolio` (yoki sizdagi ID) |
| Secrets | `FIREBASE_SERVICE_ACCOUNT` | JSON faylning **to'liq matni** (faylni matn ko'ruvchida oching → hammasini belgilang → nusxalang) |
| Secrets | `TELEGRAM_BOT_TOKEN` | ixtiyoriy — forma xabarlari keladigan bot tokeni |
| Secrets | `TELEGRAM_CHAT_ID` | ixtiyoriy — o'zingizning Telegram ID'ingiz (@IDFINDER007BOT) |

### 6. Ishga tushirish
**Actions → Deploy (Firebase) → Run workflow**. 5–8 daqiqa. Yashil bo'lsa —
sayt `https://<PROJECT_ID>.web.app` da. Keyin har `main` ga push o'zi deploy
qiladi. Qizil bo'lsa — loglarning oxirgi 20 qatorini Claude'ga yuboring.

---

## Lokal sinov (emulyator)

Deploy qilmasdan to'liq oqimni tekshirish:

```bash
npm run build
cd functions && npm run build && cd ..
firebase emulators:start
```

- Sayt: http://localhost:5000
- Emulyator paneli: http://localhost:4000 — Firestore'ga tushgan xabarni
  shu yerda ko'rasiz

Endpointni to'g'ridan-to'g'ri sinash:

```bash
curl -X POST http://localhost:5000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test","email":"a@b.uz","message":"Bu sinov xabari."}'
```

Kutilgan javob: `{"ok":true}`

Honeypot sinovi (hech narsa saqlanmasligi kerak):

```bash
curl -X POST http://localhost:5000/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"name":"Bot","email":"a@b.uz","message":"spam spam","botField":"x"}'
```

---

## Kelgan xabarlarni ko'rish

Console → **Firestore Database** → `messages` kolleksiyasi.

Har hujjatda: `name`, `email`, `message`, `ip`, `userAgent`, `createdAt`.

---

## Testlar

```bash
npm test
```

Backendga tegishli uchtasi:

| Test | Nimani qo'riqlaydi |
|---|---|
| `contact-validate.test.ts` | validator: honeypot, email, uzunlik, nazorat belgilari |
| `contact-contract.test.ts` | forma maydonlari ↔ validator kalitlari, rewrite tartibi |
| `csp.test.ts` | inline skript hash'i `firebase.json` dagi CSP ga mos |

`functions/` uchun alohida test toolchain'i yo'q: `validate.ts` Firebase'ga
bog'liq bo'lmagani uchun ildizdagi Vitest uni to'g'ridan-to'g'ri import qiladi.
Ikkita test tizimi — ikki marta yangilanadigan va ikki marta buziladigan narsa.

---

## Netlify'dan nima o'zgardi

| Edi | Bo'ldi |
|---|---|
| `netlify.toml` | `firebase.json` |
| Netlify Forms | `POST /api/contact` → Cloud Function |
| `index.html` dagi yashirin forma | kerak emas, o'chirildi |
| `data-netlify`, `netlify-honeypot` atributlari | `botField` + server tekshiruvi |
| Netlify dashboard → Forms | Firestore `messages` kolleksiyasi |
| Netlify spam filtri | honeypot + rate limit |
| `netlify-form.test.ts` | `contact-contract.test.ts` |
| Ma'lumotlar bazasi yo'q | Firestore |

---

## Tekshirilgan / tekshirilmagan

**Tekshirildi:**
- `npm test` — 431/431 o'tdi
- `npm run build` — muvaffaqiyatli
- `npm run lint` — 0 xato
- `functions/` TypeScript kompilyatsiyasi haqiqiy `firebase-admin` va
  `firebase-functions` turlari bilan — 0 xato

**Tekshirilmadi:**
- Haqiqiy deploy va jonli endpoint. Buning uchun Firebase loyihasi, Blaze
  rejasi va `firebase login` kerak — ular sizning hisobingizda.
- Emulyatorda to'liq oqim (Firebase CLI va Java kerak).

**2026-10-03 da qo'shildi:**
- Runtime `nodejs20` → `nodejs22`: Node 20 ning hayot muddati 2026-aprelda
  tugagan, Cloud Functions uni bosqichma-bosqich bekor qilmoqda.
- `functions/package-lock.json` commit qilindi va CI endi `functions/` ni
  alohida typecheck qiladi — ildizdagi build uni kompilyatsiya qilmaydi,
  shuning uchun undagi xato faqat deploy paytida chiqardi.
- `robots.txt`, `sitemap.xml` va rezyume hali ham o'chgan `netlify.app`
  manziliga yuborardi — `web.app` ga o'tkazildi, test qo'shildi.

Birinchi deploy'dan keyin yuqoridagi `curl` bilan endpointni sinab ko'ring.
