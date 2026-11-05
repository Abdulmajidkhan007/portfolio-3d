# 3D Lab — Okean sahnasi

`/ocean` sahifasi: kichik orol atrofida eshkakli qayiqni boshqarish. Portfoliodan
navbar'dagi **3D Lab** havolasi orqali ochiladi. Sahifa va uning WebGL qismi alohida
chunk'larda — asosiy sahifa ularni hech qachon yuklamaydi.

## Tuzilma

```
src/features/ocean/
  OceanPage.tsx            sahifa: sifat tanlash, fallback, HUD, klaviatura
  config.ts                barcha sozlanadigan raqamlar (qayiq, kamera, quyosh, dunyo)
  types.ts                 umumiy tiplar
  i18n.ts                  sahifa matnlari (uz/en) — asosiy lug'atda emas, bundle uchun
  lib/                     WebGL'siz sof mantiq (src/__tests__/ocean.test.ts tekshiradi)
    boatPhysics.ts         tezlanish, qarshilik, rul, orol/tosh/chegara to'qnashuvi
    waves.ts               qayiqni chayqatadigan analitik to'lqin (pitch/roll)
    island.ts              qirg'oq shakli, proplar joylashuvi, tosh kolliderlari
    seabed.ts              suv ostidagi qiyalik profili, chuqurlik funksiyasi (TS + undan yasalgan GLSL)
    wake.ts                iz bo'laklarini masofa bo'yicha chiqaruvchi WakeEmitter
    underwater.ts          suv ostini aniqlash, chuqurlikka bog'liq tuman
    quality.ts             high / medium / low / fallback qarori va har birining sozlamalari
    boatInput.ts           klaviatura + joystikni React'siz yig'adigan obyekt
  hooks/                   useBoatKeyboard, useDocumentVisible, useOceanQuality, useQualityPreference, useOceanStrings
  components/              HUD (sifat tanlash bilan), TouchJoystick, OceanFallback, SceneErrorBoundary
  scene/                   R3F: OceanCanvas, OceanSky, OceanWater, Island, Seabed, Boat, Wake,
                           Underwater, CameraRig, SunLight
    shaders/               caustics (GLSL + MeshStandardMaterial patch), waterEffects (Water patch), fog chunk'lari
```

## Texnologiyalar

- three 0.185 `Sky` (Preetham) — r185'da shader ichida **bulutlar** ham bor, shuning uchun
  bulutlar qo'shimcha geometriyasiz. Osmonning ikkinchi nusxasi bir marta PMREM
  environment map'ga render qilinadi: modellar yorug'ligi va lite suv aksi shundan.
- three `Water` (`examples/jsm/objects/Water.js`) — normal-map to'lqin, osmon/orol aksi,
  `alpha` bilan tiniqlik. Lite rejimda o'rniga bitta `MeshStandardMaterial` (aks uchun
  ikkinchi render yo'q).
- Quyosh — `DirectionalLight`, qayiq bilan birga yuradi, shuning uchun soya xaritasi
  doim kamera ko'rayotgan joyga sarflanadi.
- Qayiq fizikasi va to'lqin — sof funksiyalar (`lib/`), `useFrame` ichida React'siz.

## Boshqaruv

| Kirish | Amal |
| --- | --- |
| W / ↑, S / ↓ | oldinga / orqaga |
| A / ←, D / → | burilish |
| C yoki "Kamera" tugmasi | kuzatuvchi ↔ erkin kamera (OrbitControls, qayiq bilan birga yuradi) |
| Telefon/planshet (`pointer: coarse`) | ekrandagi joystik: yuqoriga — oldinga, yonga — burilish |
| Erkin kamerada pastga aylantirish | suv ostiga tushish (`medium`/`high`) |
| "Grafika" ro'yxati | Avto / Yuqori / O'rta / Past |

## Unumdorlik va fallback

Sifat darajasi: **high / medium / low** (+ WebGL'siz `fallback`). Avtomatik tanlanadi, HUD'dagi
**Grafika** ro'yxatidan qo'lda ham o'zgartiriladi (Avto · Yuqori · O'rta · Past, `localStorage`
`ocean-quality` da eslab qolinadi).

| Holat | Daraja |
| --- | --- |
| WebGL yo'q / kontekst ochilmadi | `fallback`: `OceanFallback` surati; three.js umuman yuklanmaydi |
| CPU rasterizator (SwiftShader, llvmpipe) yoki kuchsiz telefon (≤4 yadro yoki ≤3 GB) | `low` |
| Boshqa telefon/planshet (`pointer: coarse`) | `medium` |
| Desktop | `high` |
| Avto rejimda ikki marta ketma-ket < 28 FPS (2 s oynalar) | bir pog'ona pastga: high → medium → low |

| Sozlama | low | medium | high |
| --- | --- | --- | --- |
| DPR | 1 | [1, 1.25] | [1, 1.5] |
| Soya | yo'q | 1024 | 2048 (telefonda 1024) |
| Suv | `MeshStandardMaterial`, aks yo'q | `Water`, aks 256 | `Water`, aks 512 (telefonda 256) |
| MSAA | yo'q | yo'q | desktopda |
| Qayiq izi | — | 44 bo'lak | 72 bo'lak |
| Qirg'oq/tosh ko'pigi, tiniq sayozlik, caustics | — | ✓ | ✓ |
| Suv osti (tuman, rang, pastdan sirt) | — (kamera suvga tushmaydi) | ✓ | ✓ |
| Yorug'lik nurlari (god rays) | — | — | ✓ |

| Boshqa holat | Natija |
| --- | --- |
| `prefers-reduced-motion` | to'lqin ×0.2, suv sekin, bulutlar to'xtaydi, kamera silliqlashsiz; caustics, ko'pik va nurlar ×0.2 tezlikda |
| Tab ko'rinmayapti | `frameloop="never"` — render to'liq to'xtaydi |
| Suv ostida | osmon va `Water` yashiriladi — aks render pass'i ham to'xtaydi |

DPR hech qachon 1.5 dan oshmaydi (`MAX_DPR`, testda tekshiriladi). Daraja almashganda Canvas
qayta yaratiladi (`key`): MSAA tirik kontekstda o'zgarmaydi; assetlar keshdan olinadi.

Sinov uchun: `/ocean?quality=high|medium|low|fallback` darajani majburlaydi (avto-pasaytirish va
HUD tanlovi o'chadi; eski `full`/`lite` ham ishlaydi), `/ocean?fps` FPS hisoblagichini,
`/ocean?dive` esa erkin kamerani darhol suv ostida ochadi. O'lchangan FPS
`document.documentElement.dataset.oceanFps` da ham turadi (Playwright o'qiydi).

## 2-bosqich effektlari

Hammasi bitta-ikkita draw call, post-processing va qo'shimcha render target yo'q.

1. **Qayiq izi** (`scene/Wake.tsx`) — bitta `InstancedBufferGeometry`. `WakeEmitter` qayiq
   orqasi har `WAKE.spacing` (0.7) birlik yurganda ring-buffer'ga bitta bo'lak yozadi (x, z, kurs,
   tug'ilgan vaqt, kuch = tezlik/maks). Vertex shader bo'lakni yoshiga qarab kengaytiradi — ketma-ket
   bo'laklar V shaklini chizadi; fragment shader chetlarda ikki oq "qanot", o'rtada tez so'nuvchi
   ko'pik, shovqin bilan buzilgan. 6 s da to'liq so'nadi. CPU har bo'lakda 5 ta float yozadi.
   `index0AttributeName = 'position'`: ANGLE/SwiftShader'da instanced atribut 0-joyga tushsa
   mesh umuman chizilmasdi.
2. **Qirg'oq ko'pigi** (`shaders/waterEffects.ts`) — `Water` fragment shader'iga qo'shiladi.
   Chuqurlik depth pre-pass'siz, analitik: `seabedDepth(xz)` orol qiyaligi profilidan
   (`lib/seabed.ts`) — o'sha raqamlardan qum mesh'i ham quriladi, GLSL esa TS'dan generatsiya
   qilinadi, shuning uchun ikkisi ajralib ketmaydi. Ko'pik = suv chizig'idagi doimiy chiziq +
   qirg'oqqa qarab yuruvchi chiziqlar (chuqurlik 0..1.9) + toshlar atrofida halqa; `Water`ning
   o'z `time` va normal-shovqini bilan.
3. **Sayoz suv + caustics** — o'sha patch chuqurlik 0..4.5 da suvni firuza va tiniq qiladi
   (`alpha` 1 → 0.32, `transparent`), ostidagi qum ko'rinadi. Qum materialiga
   (`useCausticSand`, `onBeforeCompile`) y < 0 bo'lgan joyda harakatlanuvchi caustics
   naqshi qo'shiladi (uchta egilgan sinus to'lqinining nol chizig'i, ikki qatlam), chuqurlik
   bilan so'nadi. Orol qiyaligi endi −12 dagi tekis tubga (`Seabed`) tushadi.
4. **Suv osti** (`scene/Underwater.tsx`) — kamera y < −0.05 bo'lganda: tuman ko'k-yashilga
   o'tadi va yaqinlashadi (chuqurlikka qarab qorayadi, `lib/underwater.ts`), osmon va suv
   sirti yashiriladi, pastga qaragan sirt ko'rsatiladi: tepada Snell oynasi (≈49°) va caustics
   jimirlashi. `high`da 9 ta additive "nur" billboard'i (kamera atrofidagi 3×3 katakka bog'langan,
   quyosh tomonga og'gan). Ustidan yengil CSS vinyetka (render pass emas). Erkin kamerada
   `maxPolarAngle` 0.9π gacha ochiladi, pastki chegara `SEABED.cameraFloor` (−10.5). Ovoz yo'q.

## Assetlar

| Fayl | Hajm | Manba | Litsenziya |
| --- | --- | --- | --- |
| `public/ocean/ocean-kit.glb` | ~45 KB | [Kenney — Pirate Kit](https://kenney.nl/assets/pirate-kit): `boat-row-small`, `palm-bend`, `palm-straight`, `rocks-a`, `rocks-b`, `rocks-sand-a`, `grass-plant` + `colormap.png` | CC0 1.0 |
| `public/ocean/waternormals.webp` | ~43 KB | three.js `examples/textures/waternormals.jpg` (r185), 512 px WebP | MIT (three.js) |
| `public/ocean/poster.webp` | ~21 KB | shu sahnaning skrinshoti | loyiha |

Jami ~110 KB (chegara 3 MB). Orol qumi va o't qatlami — protsedural `LatheGeometry`.

Kenney modellari Kenney sayti bu muhitda bloklangani uchun GitHub ko'zgusidan olindi:
`github.com/daedalus2012/pirate-assets`, commit `2bd9276b3f36fd0487480373b9ffb7ff43bf0aaa`,
papka `GLB format/`. Asl paket va litsenziya: https://kenney.nl/assets/pirate-kit
("License: Creative Commons Zero, CC0"). Atribut shart emas, lekin shu yerda qayd etildi.

### Siqish

`ocean-kit.glb` — **meshopt** (`EXT_meshopt_compression`) + `KHR_mesh_quantization` +
WebP tekstura (`EXT_texture_webp`); 7 modelning xom GLB'lari ~225 KB edi. Qayta
yig'ish:

```bash
npm i --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 \
  @gltf-transform/functions@4 meshoptimizer
node scripts/ocean/build-kit.mjs "<Kenney Pirate Kit>/GLB format"
```

Skript sahnaga `ocean-kit` nomini beradi: aks holda u birinchi model nomini oladi va
GLTFLoader ildiz node'ni `boat-row-small_1` deb qayta nomlaydi.

### CSP

Meshopt dekoderi WebAssembly'ni ishga tushiradi, shuning uchun `firebase.json`dagi
`script-src` ga `'wasm-unsafe-eval'` qo'shildi. Bu faqat WASM kompilyatsiyasiga ruxsat
beradi — JS `eval` va inline skriptlar avvalgidek bloklangan (`csp.test.ts`).
Draco tanlanmadi: uning dekoderi blob: Worker yoki CDN talab qiladi, ikkalasi ham CSP'ni
ko'proq ochishni talab qilardi.

## Bundle

`vite.config.ts` rolldown `codeSplitting` guruhlariga o'tkazildi:

- `three` — WebGL kutubxonalari va faqat ular import qiladigan paketlar (scheduler'dan
  tashqari: u react-dom'ga ham kerak);
- `ocean-vendor` — faqat `/ocean` orqali yetiladigan modullar (Water, Sky, GLTFLoader,
  meshopt, OrbitControls) — ~105 KB, asosiy sahifa yuklamaydi;
- `gsap`, `motion`, `vendor` — avvalgidek.

### 2-bosqich o'sishi

| Chunk | 1-bosqich | 2-bosqich | Farq (gzip) |
| --- | --- | --- | --- |
| `OceanCanvas` | 10.54 KB (4.41 gz) | 23.35 KB (9.20 gz) | +4.8 KB |
| `OceanPage` | 11.87 KB (4.58 gz) | 14.10 KB (5.38 gz) | +0.8 KB |
| `math` (okean config/lib umumiy) | 0.79 KB (0.50 gz) | 1.07 KB (0.67 gz) | +0.2 KB |
| `ocean-vendor` | 105.24 KB | 105.24 KB | 0 |

Okean jami **≈ +5.8 KB gzip**, yangi asset yo'q. Bosh sahifa: `index.js` 70.07 KB, CSS
76.74 KB (hash ham bir xil), `vendor`/`gsap`/`motion` — o'zgarmagan. HUD'dagi yangi rang
inline `style` bilan berilgan: faqat shu yerda ishlatiladigan Tailwind klassi umumiy CSS'ni
o'stirardi. Lazy `three` chunk'i +41 bayt (okean ishlatadigan yangi three eksportlari
nomlari; three.core bitta modul, ajratib bo'lmaydi).

Eslatma: avvalgi `manualChunks` sozlamasida `vendor` chunk'i `three` chunk'ini **statik**
import qilardi (scheduler u yerga tushib qolgan edi), ya'ni asosiy sahifa 884 KB WebGL
runtime'ni birinchi yuklanishdayoq olardi. Yangi bo'linishda `vendor` `three`ni import
qilmaydi — WebGL faqat 3D bo'lim yaqinlashganda yuklanadi.

## Skrinshotlar

Playwright (headless Chromium, SwiftShader) bilan olingan, `docs/ocean/`. Daraja HUD tanlovi
orqali qo'yilgan (SwiftShader avtomatik `low` oladi):

| Qurilma | Dark | Light |
| --- | --- | --- |
| Mobil (iPhone 14, `medium`, joystik bosilgan) | `ocean-mobile-dark.webp` | `ocean-mobile-light.webp` |
| Planshet (iPad gen 7, `medium`) | `ocean-tablet-dark.webp` | `ocean-tablet-light.webp` |
| Desktop (1440×900, `high`, iz ko'rinadi) | `ocean-desktop-dark.webp` | `ocean-desktop-light.webp` |
| Suv osti — mobil (`medium`, `?dive`) | `ocean-mobile-underwater-dark.webp` | — |
| Suv osti — planshet (`medium`, `?dive`) | — | `ocean-tablet-underwater-light.webp` |
| Suv osti — desktop (`high`, nurlar bilan) | `ocean-desktop-underwater-dark.webp` | `ocean-desktop-underwater-light.webp` |
| Mobil `low` (2-bosqich o'chiq) | `ocean-mobile-low.webp` | — |
| WebGL yo'q (`?quality=fallback`) | `ocean-fallback.webp` | — |

Sahna kunduzgi, ikkala mavzuda bir xil; mavzuga HUD (tugmalar, yo'riqnoma, joystik, sifat
tanlovi) moslashadi.

### FPS haqida

SwiftShader (CPU rasterizator) bu muhitda juda beqaror natija berdi: bir sahifada 2 s oynalar
24 → 3 FPS gacha sakraydi, 1-bosqich `main` build'i ham shu vaqtda xuddi shunday (lite 390×844
~6–8, full ~4–26) ko'rsatdi — ya'ni raqamlar mashina yukini o'lchaydi, sahnani emas, va
1-bosqichdagi ~24–27 bilan solishtirib bo'lmaydi. 1280×720 da `medium` barqaror ~21 FPS
ko'rsatdi. Real telefon GPU'sida 30+ FPS maqsadini `/ocean?fps` bilan tekshirish kerak;
avto rejim sekin bo'lsa o'zi pastga tushadi, `low` esa 1-bosqich `lite` bilan deyarli bir xil yuk (faqat qum qiyaligi tubgacha uzaygan).
