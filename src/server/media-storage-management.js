import ftp from 'basic-ftp';
import fs from 'node:fs/promises';
import path from 'node:path';
import db from './admin-backend/Database/oldDB.js';

const pool = db.promise();

export async function getPersistedStorageMode() {
  try {
    const [rows] = await pool.query("SELECT content FROM khudii_admin_settings WHERE bucket = 'login_auth' LIMIT 1");
    if (rows[0]?.content) {
      const parsed = JSON.parse(rows[0].content);
      if (parsed?.mediaStorageMode === 'public' || parsed?.mediaStorageMode === 'ftp') {
        return parsed.mediaStorageMode;
      }
    }
  } catch { /* fallback */ }
  return process.env.MEDIA_STORAGE_MODE === 'public' ? 'public' : 'ftp';
}

export async function getMediaStorageHandler(req, res) {
  const mode = await getPersistedStorageMode();
  return res.json({
    success: true,
    mode,
    publicPath: '/uploads',
  });
}

export async function setMediaStorageHandler(req, res) {
  const mode = req.body?.mode;
  if (mode !== 'public' && mode !== 'ftp') {
    return res.status(422).json({ success: false, error: 'Invalid storage mode. Must be "public" or "ftp".' });
  }
  try {
    const [rows] = await pool.query("SELECT content FROM khudii_admin_settings WHERE bucket = 'login_auth' LIMIT 1");
    const doc = rows[0]?.content ? JSON.parse(rows[0].content) : {};
    doc.mediaStorageMode = mode;
    await pool.query(
      "INSERT INTO khudii_admin_settings (bucket, content) VALUES ('login_auth', ?) ON DUPLICATE KEY UPDATE content = VALUES(content)",
      [JSON.stringify(doc)],
    );
    return res.json({ success: true, mode });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to persist storage mode: ' + err.message });
  }
}

export async function testPublicMediaHandler(req, res) {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });
    const probeName = `.probe_${Date.now()}.txt`;
    const probePath = path.join(uploadsDir, probeName);
    await fs.writeFile(probePath, 'probe', 'utf8');
    await fs.unlink(probePath);
    return res.json({
      success: true,
      message: 'Local public/uploads media storage is writable and operational.',
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
