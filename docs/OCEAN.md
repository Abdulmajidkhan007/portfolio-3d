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
    quality.ts             full / lite / fallback qarori va har birining sozlamalari
    boatInput.ts           klaviatura + joystikni React'siz yig'adigan obyekt
  hooks/                   useBoatKeyboard, useDocumentVisible, useOceanQuality, useOceanStrings
  components/              HUD, TouchJoystick, OceanFallback, SceneErrorBoundary
  scene/                   R3F: OceanCanvas, OceanSky, OceanWater, Island, Boat, CameraRig, SunLight
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

## Unumdorlik va fallback

| Holat | Natija |
| --- | --- |
| WebGL yo'q / kontekst ochilmadi | `OceanFallback`: sahna surati (`public/ocean/poster.webp`) + izoh; three.js umuman yuklanmaydi |
| CPU rasterizator (SwiftShader, llvmpipe) yoki kuchsiz telefon (≤4 yadro yoki ≤3 GB) | `lite`: DPR 1, soyasiz, aks render'siz suv, MSAA yo'q |
| Boshqalar | `full`: DPR [1, 1.5], soyalar (telefon 1024, desktop 2048), aks 256/512 |
| `full` ikki marta ketma-ket < 28 FPS (2 s oynalar) | avtomatik `lite`ga tushadi |
| `prefers-reduced-motion` | to'lqin amplitudasi ×0.2, suv sekin, bulutlar to'xtaydi, kamera silliqlashsiz |
| Tab ko'rinmayapti | `frameloop="never"` — render to'liq to'xtaydi |

DPR hech qachon 1.5 dan oshmaydi (`MAX_DPR`, testda tekshiriladi).

Sinov uchun: `/ocean?quality=full|lite|fallback` darajani majburlaydi (avto-pasaytirish
o'chadi), `/ocean?fps` FPS hisoblagichini ko'rsatadi. O'lchangan FPS
`document.documentElement.dataset.oceanFps` da ham turadi (Playwright o'qiydi).

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

Eslatma: avvalgi `manualChunks` sozlamasida `vendor` chunk'i `three` chunk'ini **statik**
import qilardi (scheduler u yerga tushib qolgan edi), ya'ni asosiy sahifa 884 KB WebGL
runtime'ni birinchi yuklanishdayoq olardi. Yangi bo'linishda `vendor` `three`ni import
qilmaydi — WebGL faqat 3D bo'lim yaqinlashganda yuklanadi.

## 2-bosqich rejasi (hali qilinmagan)

1. **Qayiq izi (wake)** — qayiq orqasida V-shaklli iz: ring-buffer'dagi so'nggi N pozitsiyadan
   tasma (`BufferGeometry`, har kadr yangilanadi), alfa vaqt bilan so'nadi; tezlikka bog'liq
   kenglik. Lite'da o'chiq.
2. **Ko'pik** — qirg'oq chizig'ida (`shoreRadiusAt` bo'yicha halqa mesh) va qayiq tumshug'ida
   shovqin-teksturali ko'pik; `Water` shader'iga depth-based foam qo'shish varianti — custom
   `onBeforeCompile` bilan, alohida render target talab qiladi (faqat full).
3. **Caustics** — sayozlikdagi qum ustida animatsiyalangan caustics teksturasi (proyeksiyali
   `DecalGeometry` yoki qum materialiga `onBeforeCompile`), suv chuqurligi bo'yicha so'nadi.
4. **Suv osti** — kamera y < 0 bo'lganda post-effekt: tuman rangi/zichligi almashadi,
   ko'k tus, yengil distortion; `Water` pastdan ko'rinishi uchun `side: DoubleSide` va
   alohida pastki material. Erkin kamerada `maxPolarAngle` cheklovini olib tashlash bilan.
5. Unumdorlik byudjeti: har bir effekt `QualitySettings`ga bayroq sifatida qo'shiladi va
   `pickQuality` testlari kengaytiriladi.

## Skrinshotlar

Playwright (headless Chromium, SwiftShader) bilan olingan, `docs/ocean/`:

| Qurilma | Dark | Light |
| --- | --- | --- |
| Mobil (iPhone 14, avto → `lite`, joystik bosilgan) | `ocean-mobile-dark.webp` | `ocean-mobile-light.webp` |
| Planshet (iPad, `?quality=full`) | `ocean-tablet-dark.webp` | `ocean-tablet-light.webp` |
| Desktop (1440×900, `?quality=full`) | `ocean-desktop-dark.webp` | `ocean-desktop-light.webp` |
| WebGL yo'q (`?quality=fallback`) | `ocean-fallback.webp` | — |

Sahna kunduzgi, ikkala mavzuda bir xil; mavzuga HUD (tugmalar, yo'riqnoma, joystik) moslashadi.

### O'lchangan FPS (SwiftShader — CPU rasterizator, GPU emas)

| Viewport | lite | full |
| --- | --- | --- |
| 390×844, DPR 1 | ~24 | ~5–6 |
| 1280×720 | ~27 | ~3–23 |

Bu CPU'da render — real telefon GPU'sini ifodalamaydi. Shuning uchun SwiftShader/llvmpipe
avtomatik `lite` oladi va `full` sekin bo'lsa o'zi `lite`ga tushadi. Real qurilmada 30+ FPS
maqsadini `/ocean?fps` bilan tekshirish kerak.
