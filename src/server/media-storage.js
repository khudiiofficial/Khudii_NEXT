import ftp from 'basic-ftp';
import { Readable } from 'node:stream';

const uploadDir = process.env.FTP_UPLOAD_DIR || '/media';
const baseUrl = (process.env.FTP_BASE_URL || 'https://media.khudii.com').replace(/\/$/, '');

function config() {
  if (!process.env.FTP_HOST || !process.env.FTP_USER || !(process.env.FTP_PASS || process.env.FTP_PASSWORD)) {
    throw new Error('FTP credentials are not configured');
  }
  return {
    host: process.env.FTP_HOST,
    port: Number(process.env.FTP_PORT || 21),
    user: process.env.FTP_USER,
    password: process.env.FTP_PASS || process.env.FTP_PASSWORD,
    secure: process.env.FTP_SECURE === 'true',
    timeout: Number(process.env.FTP_TIMEOUT_MS || 300000),
  };
}

export function mediaUrl(fileName) {
  // FTP_BASE_URL (e.g. https://media.khudii.com) is the public root that maps
  // directly to FTP_UPLOAD_DIR on the server — do NOT double-encode the path.
  return `${baseUrl}/${fileName}`;
}

export function sanitizeUploadName(value) {
  const name = String(value || '').replace(/[^a-zA-Z0-9._-]/g, '');
  if (!name || name.length > 180 || name.includes('..')) throw new Error('Invalid upload filename');
  return name;
}

export async function writeUploadChunk({ fileName, buffer, offset, first }) {
  const client = new ftp.Client(Number(process.env.FTP_TIMEOUT_MS || 300000));
  client.ftp.verbose = false;
  try {
    await client.access(config());
    await client.ensureDir(uploadDir);
    await client.cd(uploadDir);
    const stream = Readable.from(buffer);

    if (first) {
      await client.uploadFrom(stream, fileName);
      return buffer.length;
    }

    let remoteSize = 0;
    try {
      remoteSize = await client.size(fileName);
    } catch {
      throw new Error('Upload session was not initialized');
    }

    if (remoteSize === offset + buffer.length) return remoteSize;
    if (remoteSize !== offset) {
      throw new Error(`Upload offset mismatch: expected ${offset}, found ${remoteSize}`);
    }

    await client.appendFrom(stream, fileName);
    return offset + buffer.length;
  } finally {
    client.close();
  }
}
