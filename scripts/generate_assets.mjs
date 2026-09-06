import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import sharp from 'sharp';

const ASSETS_DIR = path.resolve(process.cwd(), 'public/assets');
const QR_DIR = path.resolve(ASSETS_DIR, 'qr');

if (!fs.existsSync(ASSETS_DIR)) fs.mkdirSync(ASSETS_DIR, { recursive: true });
if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true });

async function createQrCard({ filename, initials, name, avatarBg, upiUri, upiId }) {
  // Generate QR as SVG data or base64 PNG
  const qrSvg = await QRCode.toString(upiUri, {
    type: 'svg',
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'M'
  });

  // Extract inner svg paths
  const svgBodyMatch = qrSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const qrContent = svgBodyMatch ? svgBodyMatch[1] : '';

  // Get viewBox
  const viewBoxMatch = qrSvg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 100 100';

  const cardSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="840" viewBox="0 0 600 840" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#052952" />
      <stop offset="60%" stop-color="#031b36" />
      <stop offset="100%" stop-color="#021226" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Background White Page -->
  <rect width="600" height="840" fill="#F8FAFC" />

  <!-- Avatar Circle -->
  <circle cx="300" cy="80" r="44" fill="${avatarBg}" filter="url(#shadow)" />
  <text x="300" y="93" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="bold" fill="#1E293B" text-anchor="middle">${initials}</text>

  <!-- Name and Verified Badge -->
  <g transform="translate(300, 160)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" fill="#0F172A" text-anchor="middle">${name}</text>
    <!-- Verified Badge (blue circle with checkmark) -->
    <g transform="translate(140, -18)">
      <circle cx="12" cy="12" r="12" fill="#00BAF2" />
      <path d="M7 12l3.5 3.5 7-7" stroke="#FFFFFF" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </g>

  <!-- Main Dark Blue Payment Card -->
  <g filter="url(#shadow)">
    <rect x="50" y="195" width="500" height="520" rx="24" fill="url(#cardGrad)" />

    <!-- Card Top Header: Paytm + Heart + UPI -->
    <g transform="translate(180, 245)">
      <!-- "paytm" in cyan -->
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#00BAF2" letter-spacing="-1">paytm</text>
      <!-- Heart icon in red -->
      <path d="M102 -10 C96 -20 82 -14 82 -2 C82 10 102 22 102 22 C102 22 122 10 122 -2 C122 -14 108 -20 102 -10 Z" fill="#EF4444" transform="scale(0.8) translate(30, -5)" />
      <!-- "UPI" in white with flag stripes on I -->
      <text x="145" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF">UPI</text>
    </g>

    <!-- White QR Code Box -->
    <rect x="135" y="275" width="330" height="330" rx="16" fill="#FFFFFF" />
    
    <!-- QR Code SVG injected -->
    <svg x="150" y="290" width="300" height="300" viewBox="${viewBox}">
      ${qrContent}
    </svg>

    <!-- UPI ID line below QR inside the card -->
    <g transform="translate(300, 650)">
      <!-- Paytm Arrowhead Icon -->
      <path d="M-140 -6 L-122 -14 L-127 -6 L-122 2 Z" fill="#00BAF2" />
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" fill="#FFFFFF" text-anchor="middle">${upiId}</text>
    </g>
  </g>

  <!-- Card Footer: Scan with any UPI app -->
  <g transform="translate(300, 755)">
    <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="600" fill="#64748B" text-anchor="middle">Scan with any UPI app</text>
  </g>

  <!-- App badges: Paytm, PhonePe, Google Pay, BHIM -->
  <g transform="translate(130, 775)">
    <!-- Paytm badge -->
    <rect x="0" y="0" width="75" height="30" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="37" y="20" font-family="sans-serif" font-size="11" font-weight="800" fill="#00BAF2" text-anchor="middle">paytm</text>

    <!-- PhonePe badge -->
    <rect x="90" y="0" width="75" height="30" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="127" y="20" font-family="sans-serif" font-size="11" font-weight="800" fill="#5F259F" text-anchor="middle">PhonePe</text>

    <!-- GPay badge -->
    <rect x="180" y="0" width="75" height="30" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="217" y="20" font-family="sans-serif" font-size="11" font-weight="800" fill="#4285F4" text-anchor="middle">GPay</text>

    <!-- BHIM badge -->
    <rect x="270" y="0" width="75" height="30" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" />
    <text x="307" y="20" font-family="sans-serif" font-size="11" font-weight="800" fill="#00833F" text-anchor="middle">BHIM</text>
  </g>
</svg>`;

  const svgPath = path.resolve(QR_DIR, `${filename}.svg`);
  const pngPath = path.resolve(QR_DIR, `${filename}.png`);

  fs.writeFileSync(svgPath, cardSvg, 'utf8');
  await sharp(Buffer.from(cardSvg)).png().toFile(pngPath);
  console.log(`Generated ${pngPath}`);
}

async function createLogo() {
  const logoSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Brand colors -->
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b2447" />
      <stop offset="100%" stop-color="#04152d" />
    </linearGradient>
    <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38a169" />
      <stop offset="100%" stop-color="#2f855a" />
    </linearGradient>
    <linearGradient id="brightGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#48bb78" />
      <stop offset="100%" stop-color="#276749" />
    </linearGradient>
    <linearGradient id="goldGlow" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ECC94B" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#ECC94B" stop-opacity="0.1" />
    </linearGradient>
    <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#000000" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Clean Circular Emblem White Background -->
  <circle cx="400" cy="400" r="390" fill="#FFFFFF" stroke="#F1F5F9" stroke-width="4" filter="url(#logoShadow)" />

  <!-- Outer Ring Accent Arc -->
  <circle cx="400" cy="400" r="365" fill="none" stroke="#0F2850" stroke-width="3" stroke-dasharray="14 10" opacity="0.35" />
  <circle cx="400" cy="400" r="350" fill="none" stroke="#0F2850" stroke-width="1.5" opacity="0.25" />

  <!-- Laurel Leaves across the top arc -->
  <g id="topLaurel" fill="#38A169">
    <!-- Left Laurel Leaf cluster -->
    <path d="M230 180 C240 165 260 160 275 170 C260 185 240 185 230 180 Z" />
    <path d="M260 150 C272 138 292 135 305 147 C290 160 270 158 260 150 Z" />
    <path d="M295 125 C310 115 330 115 342 128 C325 140 305 135 295 125 Z" />
    <path d="M335 110 C352 102 372 105 382 120 C365 130 345 122 335 110 Z" />

    <!-- Right Laurel Leaf cluster -->
    <path d="M570 180 C560 165 540 160 525 170 C540 185 560 185 570 180 Z" />
    <path d="M540 150 C528 138 508 135 495 147 C510 160 530 158 540 150 Z" />
    <path d="M505 125 C490 115 470 115 458 128 C475 140 495 135 505 125 Z" />
    <path d="M465 110 C448 102 428 105 418 120 C435 130 455 122 465 110 Z" />
  </g>

  <!-- Golden Radiating Rays behind star -->
  <g stroke="#ECC94B" stroke-width="2.5" opacity="0.75" stroke-linecap="round">
    <line x1="400" y1="140" x2="400" y2="95" />
    <line x1="380" y1="145" x2="360" y2="105" />
    <line x1="420" y1="145" x2="440" y2="105" />
    <line x1="365" y1="155" x2="330" y2="125" />
    <line x1="435" y1="155" x2="470" y2="125" />
  </g>

  <!-- 5-Pointed Emerald Star -->
  <polygon points="400,120 409,144 434,144 414,159 421,183 400,169 379,183 386,159 366,144 391,144" fill="#38A169" filter="url(#logoShadow)" />

  <!-- Graduation Mortarboard inside Nest -->
  <!-- Mortarboard Cap Top (Diamond) -->
  <polygon points="400,200 485,228 400,256 315,228" fill="url(#navyGrad)" />
  <!-- Mortarboard Skullcap Underneath -->
  <path d="M350 242 L350 262 C350 282 450 282 450 262 L450 242 Z" fill="#0A1C36" />
  <!-- Lime Green Button and Tassel -->
  <circle cx="400" cy="228" r="5" fill="#4ADE80" />
  <path d="M400 228 C435 235 448 245 450 265" fill="none" stroke="#4ADE80" stroke-width="3.5" stroke-linecap="round" />
  <!-- Tassel Brush -->
  <polygon points="446,265 454,265 456,280 444,280" fill="#4ADE80" />

  <!-- The Twig Nest cradling the cap and book -->
  <g fill="none" stroke="#0F2850" stroke-linecap="round">
    <!-- Nest Branches Curves -->
    <path d="M290 285 Q400 325 510 285" stroke-width="8" />
    <path d="M280 295 Q400 340 520 295" stroke-width="6" stroke="#1E3A8A" />
    <path d="M305 305 Q400 348 495 305" stroke-width="5" stroke="#38A169" />
    <path d="M270 288 Q330 310 400 315" stroke-width="4" stroke="#0F2850" />
    <path d="M400 315 Q470 310 530 288" stroke-width="4" stroke="#0F2850" />
    <!-- Twig Details sticking out -->
    <line x1="280" y1="290" x2="265" y2="280" stroke-width="4" stroke="#0F2850" />
    <line x1="520" y1="290" x2="535" y2="280" stroke-width="4" stroke="#0F2850" />
    <line x1="295" y1="305" x2="280" y2="315" stroke-width="3.5" stroke="#1E3A8A" />
    <line x1="505" y1="305" x2="520" y2="315" stroke-width="3.5" stroke="#1E3A8A" />
  </g>

  <!-- Open Book Foundation -->
  <g id="openBook">
    <!-- Dark Blue Hard Cover Outer Spine/Base -->
    <path d="M220 420 Q310 435 400 405 Q490 435 580 420 L570 435 Q490 450 400 420 Q310 450 230 435 Z" fill="#0A192F" />

    <!-- Left Open Pages with Emerald Accent -->
    <path d="M230 415 Q310 430 400 400 L400 355 Q310 380 230 370 Z" fill="#F8FAFC" stroke="#0F2850" stroke-width="3" />
    <path d="M230 405 Q310 420 400 390 L400 345 Q310 370 230 360 Z" fill="#FFFFFF" stroke="#38A169" stroke-width="2.5" />

    <!-- Right Open Pages with Emerald Accent -->
    <path d="M570 415 Q490 430 400 400 L400 355 Q490 380 570 370 Z" fill="#F8FAFC" stroke="#0F2850" stroke-width="3" />
    <path d="M570 405 Q490 420 400 390 L400 345 Q490 370 570 360 Z" fill="#FFFFFF" stroke="#38A169" stroke-width="2.5" />

    <!-- Book Page Lines (representing knowledge/notes) -->
    <g stroke="#CBD5E1" stroke-width="2" stroke-linecap="round">
      <line x1="260" y1="375" x2="370" y2="363" />
      <line x1="260" y1="387" x2="370" y2="375" />
      <line x1="260" y1="399" x2="350" y2="387" />

      <line x1="430" y1="363" x2="540" y2="375" />
      <line x1="430" y1="375" x2="540" y2="387" />
      <line x1="450" y1="387" x2="540" y2="399" />
    </g>

    <!-- Center Spine Ribbon / Bookmark -->
    <path d="M400 390 L400 445 L408 438 L416 445 L416 390 Z" fill="#38A169" />
  </g>

  <!-- Typography: "NoteNest" -->
  <g transform="translate(400, 560)">
    <text x="-12" y="0" font-family="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" font-size="88" font-weight="900" fill="#0A1E3F" letter-spacing="-2" text-anchor="end">Note</text>
    <text x="0" y="0" font-family="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" font-size="88" font-weight="900" fill="#38A169" letter-spacing="-2" text-anchor="start">Nest</text>
  </g>

  <!-- Divider Line with Diamond Center -->
  <g transform="translate(400, 600)">
    <line x1="-220" y1="0" x2="-25" y2="0" stroke="#0F2850" stroke-width="2" opacity="0.75" />
    <polygon points="0,-6 6,0 0,6 -6,0" fill="#38A169" />
    <line x1="25" y1="0" x2="220" y2="0" stroke="#0F2850" stroke-width="2" opacity="0.75" />
  </g>

  <!-- Subtitle Tagline: "LEARN • PREPARE • SUCCEED" -->
  <g transform="translate(400, 645)">
    <text x="0" y="0" font-family="'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif" font-size="22" font-weight="800" fill="#1E293B" letter-spacing="6" text-anchor="middle">
      LEARN <tspan fill="#38A169">•</tspan> PREPARE <tspan fill="#38A169">•</tspan> SUCCEED
    </text>
  </g>
</svg>`;

  const svgPath = path.resolve(ASSETS_DIR, 'notenest-logo.svg');
  const pngPath = path.resolve(ASSETS_DIR, 'notenest-logo.png');

  fs.writeFileSync(svgPath, logoSvg, 'utf8');
  await sharp(Buffer.from(logoSvg)).png().toFile(pngPath);
  console.log(`Generated ${pngPath}`);
}

async function run() {
  console.log('Generating QR 1 (Nabiran Necha)...');
  await createQrCard({
    filename: 'qr-1',
    initials: 'NN',
    name: 'Nabiran Necha',
    avatarBg: '#A3D9A5',
    upiUri: 'upi://pay?pa=notenest01@ptyes&pn=Nabiran%20Necha&cu=INR',
    upiId: 'notenest01@ptyes'
  });

  console.log('Generating QR 2 (Md. Robiul Hussain)...');
  await createQrCard({
    filename: 'qr-2',
    initials: 'MH',
    name: 'Md. Robiul Hussain',
    avatarBg: '#FFA07A',
    upiUri: 'upi://pay?pa=notenest01@ptyes&pn=Md.%20Robiul%20Hussain&cu=INR',
    upiId: 'notenest01@ptyes'
  });

  console.log('Generating QR 3 (Marajina Khatun)...');
  await createQrCard({
    filename: 'qr-3',
    initials: 'MK',
    name: 'Marajina Khatun',
    avatarBg: '#D8B4E2',
    upiUri: 'upi://pay?pa=notenest01@ptyes&pn=Marajina%20Khatun&cu=INR',
    upiId: 'notenest01@ptyes'
  });

  console.log('Generating official NoteNest logo...');
  await createLogo();

  console.log('All static assets generated successfully!');
}

run().catch(console.error);
