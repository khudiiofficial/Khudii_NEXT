import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { mediaUrl, sanitizeUploadName, writeUploadChunk } from '@/server/media-storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const allowedMimePrefixes = ['image/', 'video/'];
const allowedMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
]);

function isAdminHost(request) {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(':')[0]
    .toLowerCase();
  return host === 'admin.khudii.com' || host.startsWith('admin.') || process.env.FORCE_ADMIN_HOST === '1';
}


function isAllowedOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';

  const allowed = new Set([
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_ADMIN_URL,
    'http://localhost:3000',
    'http://admin.localhost:3000',
  ].filter(Boolean).map((value) => String(value).replace(/\/$/, '')));

  try {
    const originUrl = new URL(origin);
    const requestHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '').toLowerCase();
    return allowed.has(originUrl.origin) || originUrl.host.toLowerCase() === requestHost;
  } catch {
    return false;
  }
}

function authorizeAdmin(request) {
  if (!isAdminHost(request)) return true;
  const token = request.cookies.get('token')?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) return false;
  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ success: false, message: 'Origin not allowed' }, { status: 403 });
  }
  if (!authorizeAdmin(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const fileName = sanitizeUploadName(request.headers.get('x-khudii-upload-name'));
    const mime = request.headers.get('x-khudii-upload-mime') || 'application/octet-stream';
    const index = Number(request.headers.get('x-khudii-upload-index'));
    const total = Number(request.headers.get('x-khudii-upload-total'));
    const offset = Number(request.headers.get('x-khudii-upload-offset'));
    const declaredSize = Number(request.headers.get('x-khudii-upload-size'));
    const maxBytes = Number(process.env.MAX_UPLOAD_BYTES || 524288000);
    const maxChunkBytes = Number(process.env.MAX_UPLOAD_CHUNK_BYTES || 2621440);

    if (!allowedMimePrefixes.some((prefix) => mime.startsWith(prefix)) && !allowedMimeTypes.has(mime)) {
      return NextResponse.json({ success: false, message: 'Unsupported file type' }, { status: 415 });
    }
    if (![index, total, offset, declaredSize].every(Number.isFinite) || index < 0 || total < 1 || index >= total) {
      return NextResponse.json({ success: false, message: 'Invalid upload metadata' }, { status: 400 });
    }
    if (declaredSize < 1 || declaredSize > maxBytes) {
      return NextResponse.json({ success: false, message: 'File exceeds the configured upload limit' }, { status: 413 });
    }

    const buffer = Buffer.from(await request.arrayBuffer());
    if (!buffer.length || buffer.length > maxChunkBytes) {
      return NextResponse.json({ success: false, message: 'Invalid upload chunk size' }, { status: 413 });
    }
    if ((index === 0 && offset !== 0) || offset < 0 || offset + buffer.length > declaredSize) {
      return NextResponse.json({ success: false, message: 'Upload chunk metadata does not match file size' }, { status: 400 });
    }
    if (index === total - 1 && offset + buffer.length !== declaredSize) {
      return NextResponse.json({ success: false, message: 'Final chunk does not complete the declared file' }, { status: 400 });
    }

    const bytesWritten = await writeUploadChunk({
      fileName,
      buffer,
      offset,
      first: index === 0,
    });
    const completed = index === total - 1;
    if (completed && bytesWritten !== declaredSize) {
      return NextResponse.json(
        { success: false, message: `Upload size mismatch: expected ${declaredSize}, wrote ${bytesWritten}` },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      completed,
      bytesWritten,
      fileName,
      url: completed ? mediaUrl(fileName) : undefined,
    });
  } catch (error) {
    console.error('Chunked FTP upload failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'FTP upload failed',
        ...(process.env.NODE_ENV === 'development' ? { error: error.message } : {}),
      },
      { status: 500 },
    );
  }
}
