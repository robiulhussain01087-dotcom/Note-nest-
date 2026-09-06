// NoteNest Static Asset & Google Drive Helpers

export const NOTENEST_OFFICIAL_LOGO = '/assets/notenest-logo.png';

export interface QrOption {
  id: 'qr-1' | 'qr-2' | 'qr-3';
  label: string;
  title: string;
  name: string;
  beneficiaryName: string;
  recipientName: string;
  upiId: string;
  path: string;
  imagePath: string;
  description: string;
}

export const QR_CODE_OPTIONS: QrOption[] = [
  {
    id: 'qr-1',
    label: 'QR Code 1',
    title: 'QR Code 1',
    name: 'Nabiran Necha',
    beneficiaryName: 'Nabiran Necha',
    recipientName: 'Nabiran Necha',
    upiId: 'notenest01@ptyes',
    path: '/assets/qr/qr-1.png',
    imagePath: '/assets/qr/qr-1.png',
    description: 'Paytm UPI QR • Nabiran Necha'
  },
  {
    id: 'qr-2',
    label: 'QR Code 2',
    title: 'QR Code 2',
    name: 'Md. Robiul Hussain',
    beneficiaryName: 'Md. Robiul Hussain',
    recipientName: 'Md. Robiul Hussain',
    upiId: 'notenest01@ptyes',
    path: '/assets/qr/qr-2.png',
    imagePath: '/assets/qr/qr-2.png',
    description: 'Paytm UPI QR • Md. Robiul Hussain'
  },
  {
    id: 'qr-3',
    label: 'QR Code 3',
    title: 'QR Code 3',
    name: 'Marajina Khatun',
    beneficiaryName: 'Marajina Khatun',
    recipientName: 'Marajina Khatun',
    upiId: 'notenest01@ptyes',
    path: '/assets/qr/qr-3.png',
    imagePath: '/assets/qr/qr-3.png',
    description: 'Paytm UPI QR • Marajina Khatun'
  }
];

export const DEFAULT_ACTIVE_QR = 'qr-1' as const;

/**
 * Resolves the active QR code image path safely.
 * Always falls back to /assets/qr/qr-1.png if undefined, null, or invalid.
 */
export function getActiveQrCodePath(activeId?: string | null): string {
  if (activeId === 'qr-2') return '/assets/qr/qr-2.png';
  if (activeId === 'qr-3') return '/assets/qr/qr-3.png';
  return '/assets/qr/qr-1.png';
}

/**
 * Resolves the active QR option metadata.
 */
export function getActiveQrOption(activeId?: string | null): QrOption {
  const found = QR_CODE_OPTIONS.find(q => q.id === activeId);
  return found || QR_CODE_OPTIONS[0];
}

/**
 * Validates whether a given string is a valid URL.
 */
export function isValidUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates whether a given URL is a legitimate Google Drive URL.
 */
export function isValidGoogleDriveUrl(url?: string | null): boolean {
  if (!url || !isValidUrl(url)) return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');
}

/**
 * Extracts the file ID from various Google Drive URL formats:
 * - https://drive.google.com/file/d/FILE_ID/view...
 * - https://drive.google.com/open?id=FILE_ID
 * - https://docs.google.com/document/d/FILE_ID/...
 */
export function extractGoogleDriveFileId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Pattern 1: /file/d/FILE_ID or /d/FILE_ID
  const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{20,})/);
  if (matchD && matchD[1]) return matchD[1];

  // Pattern 2: id=FILE_ID
  const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (matchId && matchId[1]) return matchId[1];

  return null;
}

/**
 * Converts a Google Drive link into an embeddable preview iframe URL:
 * https://drive.google.com/file/d/<FILE_ID>/preview
 */
export function getGoogleDriveEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  return null;
}

/**
 * Alias for getGoogleDriveEmbedUrl
 */
export function getGoogleDrivePreviewUrl(url?: string | null): string {
  if (!url) return '';
  const embed = getGoogleDriveEmbedUrl(url);
  return embed || url;
}

/**
 * Converts a Google Drive view link into a direct download URL if possible.
 */
export function getGoogleDriveDirectDownloadUrl(url?: string | null): string {
  if (!url) return '';
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }
  return url;
}
