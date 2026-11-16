import ftp from 'basic-ftp';
import fs from 'node:fs/promises';
import path from 'node:path';

// Default is 'ftp' as requested
let currentStorageMode = process.env.MEDIA_STORAGE_MODE || 'ftp';

export async function getMediaStorageHandler(req, res) {
  return res.json({
    success: true,
    mode: currentStorageMode,
    publicPath: '/images_KTC',
  });
}

export async function setMediaStorageHandler(req, res) {
  const mode = req.body?.mode;
  if (mode !== 'public' && mode !== 'ftp') {
    return res.status(422).json({ success: false, error: 'Invalid storage mode. Must be "public" or "ftp".' });
  }
  currentStorageMode = mode;
  return res.json({ success: true, mode: currentStorageMode });
}

export async function testPublicMediaHandler(req, res) {
  try {
    const probeName = `.probe_${Date.now()}.txt`;
    const probePath = path.join(process.cwd(), 'public', probeName);
    await fs.writeFile(probePath, 'probe', 'utf8');
    await fs.unlink(probePath);
    return res.json({
      success: true,
      message: 'Hostinger public_html media storage is writable and operational.',
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.json({
      success: false,
      error: `Public folder check failed: ${err.message}`,
      checkedAt: new Date().toISOString(),
    });
  }
}

export async function testFtpMediaHandler(req, res) {
  const host = process.env.FTP_HOST;
  const user = process.env.FTP_USER;
  const password = process.env.FTP_PASS || process.env.FTP_PASSWORD;

  if (!host || !user || !password) {
    return res.json({
      success: false,
      error: 'FTP connection variables (FTP_HOST, FTP_USER, FTP_PASS) are not configured in environment.',
      checkedAt: new Date().toISOString(),
    });
  }

  const client = new ftp.Client(10000);
  client.ftp.verbose = false;
  try {
    await client.access({
      host,
      port: Number(process.env.FTP_PORT || 21),
      user,
      password,
      secure: process.env.FTP_SECURE === 'true',
      timeout: 10000,
    });
    const dir = process.env.FTP_UPLOAD_DIR || '/media';
    await client.ensureDir(dir);
    return res.json({
      success: true,
      message: `FTP media directory connected successfully at ${host}:${process.env.FTP_PORT || 21} (${dir}).`,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return res.json({
      success: false,
      error: `FTP check failed: ${err.message}`,
      checkedAt: new Date().toISOString(),
    });
  } finally {
    client.close();
  }
}
