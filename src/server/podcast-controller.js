import db from './admin-backend/Database/oldDB.js';
import { slugifyContent, youtubeVideoId } from './shared/youtube.js';

const pool = db.promise();
const fields = 'p.id,p.slug,p.title,p.description,p.youtube_id,p.sort_order,p.is_published,p.created_at,p.updated_at,COALESCE(s.seo_title,\'\') AS seo_title,COALESCE(s.seo_description,\'\') AS seo_description,COALESCE(s.seo_keywords,\'\') AS seo_keywords,COALESCE(s.seo_image,\'\') AS seo_image';
const joined = 'FROM podcasts p LEFT JOIN podcast_seo s ON s.episode_id=p.id';
let initPromise;
function ensurePodcastSeo() {
  if (!initPromise) initPromise = pool.query(`CREATE TABLE IF NOT EXISTS podcast_seo (
    episode_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
    seo_title VARCHAR(120) NOT NULL DEFAULT '',seo_description VARCHAR(320) NOT NULL DEFAULT '',
    seo_keywords VARCHAR(500) NOT NULL DEFAULT '',seo_image VARCHAR(1000) NOT NULL DEFAULT '',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`).catch(e => { initPromise = null; throw e; });
  return initPromise;
}
function idParam(req) { const id = Number(req.params.id); return Number.isSafeInteger(id) && id > 0 ? id : null; }
function parsePodcast(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Invalid request body' };
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!title || title.length > 255) return { error: 'Title must contain 1 to 255 characters' };
  const youtube_id = youtubeVideoId(body.youtube_url ?? body.youtube_id);
  if (!youtube_id) return { error: 'Enter a valid YouTube video URL or 11-character video ID' };
  const description = body.description ?? '';
  if (typeof description !== 'string' || description.length > 5000) return { error: 'Description must be at most 5000 characters' };
  const slug = slugifyContent(body.slug || title);
  if (!slug || slug.length > 180) return { error: 'Slug must be 1 to 180 URL-safe characters' };
  const sort_order = body.sort_order == null || body.sort_order === '' ? 0 : Number(body.sort_order);
  if (!Number.isInteger(sort_order) || sort_order < 0 || sort_order > 1000000) return { error: 'Display order must be an integer from 0 to 1000000' };
  const is_published = body.is_published === true || body.is_published === 1 || body.is_published === '1' ? 1 : 0;
  const meta = { seo_title: body.seo_title ?? '', seo_description: body.seo_description ?? '', seo_keywords: body.seo_keywords ?? '', seo_image: body.seo_image ?? '' };
  for (const [field, length] of Object.entries({ seo_title: 120, seo_description: 320, seo_keywords: 500, seo_image: 1000 })) {
    if (typeof meta[field] !== 'string' || meta[field].length > length) return { error: `${field.replaceAll('_', ' ')} exceeds ${length} characters` };
    meta[field] = meta[field].trim();
  }
  if (meta.seo_image && !/^(https:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i.test(meta.seo_image)) return { error: 'SEO image must be a local path or HTTPS URL' };
  return { data: { title, description: description.trim(), youtube_id, slug, sort_order, is_published, ...meta } };
}
function sqlError(res, err, op) {
  if (err?.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A podcast with this slug already exists' });
  console.error(`[podcast ${op}]`, err);
  return res.status(500).json({ message: 'Podcast database is unavailable. Apply the podcast episodes migration and verify DB permissions.' });
}
async function saveSeo(conn, id, data) {
  await conn.query(`INSERT INTO podcast_seo (episode_id,seo_title,seo_description,seo_keywords,seo_image) VALUES (?,?,?,?,?)
    ON DUPLICATE KEY UPDATE seo_title=VALUES(seo_title),seo_description=VALUES(seo_description),seo_keywords=VALUES(seo_keywords),seo_image=VALUES(seo_image)`,
    [id, data.seo_title, data.seo_description, data.seo_keywords, data.seo_image]);
}
export async function getPublishedPodcasts(_req, res) {
  try { await ensurePodcastSeo(); const [rows] = await pool.query(`SELECT ${fields} ${joined} WHERE p.is_published=1 ORDER BY p.sort_order ASC,p.created_at DESC,p.id DESC`); return res.json({ items: rows }); }
  catch (e) { return sqlError(res, e, 'public-list'); }
}
export async function getPublishedPodcastBySlug(slug) {
  await ensurePodcastSeo();
  const [rows] = await pool.query(`SELECT ${fields} ${joined} WHERE p.is_published=1 AND p.slug=? LIMIT 1`, [slug]);
  return rows[0] || null;
}
export async function listAdminPodcasts(_req, res) {
  try { await ensurePodcastSeo(); const [rows] = await pool.query(`SELECT ${fields} ${joined} ORDER BY p.sort_order ASC,p.created_at DESC,p.id DESC`); return res.json({ items: rows }); }
  catch (e) { return sqlError(res, e, 'admin-list'); }
}
export async function getAdminPodcast(req, res) {
  const id = idParam(req); if (!id) return res.status(400).json({ message: 'Invalid podcast ID' });
  try { await ensurePodcastSeo(); const [rows] = await pool.query(`SELECT ${fields} ${joined} WHERE p.id=? LIMIT 1`, [id]); return rows.length ? res.json(rows[0]) : res.status(404).json({ message: 'Podcast not found' }); }
  catch (e) { return sqlError(res, e, 'get'); }
}
export async function createPodcast(req, res) {
  const parsed = parsePodcast(req.body); if (parsed.error) return res.status(422).json({ message: parsed.error });
  let conn;
  try {
    await ensurePodcastSeo(); conn = await pool.getConnection(); await conn.beginTransaction();
    const d = parsed.data;
    const [r] = await conn.query('INSERT INTO podcasts (title,description,youtube_id,slug,sort_order,is_published) VALUES (?,?,?,?,?,?)', [d.title, d.description, d.youtube_id, d.slug, d.sort_order, d.is_published]);
    await saveSeo(conn, r.insertId, d); await conn.commit(); return res.status(201).json({ id: r.insertId, message: 'Podcast added' });
  } catch (e) { if (conn) await conn.rollback(); return sqlError(res, e, 'create'); } finally { conn?.release(); }
}
export async function updatePodcast(req, res) {
  const id = idParam(req); if (!id) return res.status(400).json({ message: 'Invalid podcast ID' });
  const parsed = parsePodcast(req.body); if (parsed.error) return res.status(422).json({ message: parsed.error });
  let conn;
  try {
    await ensurePodcastSeo(); conn = await pool.getConnection(); await conn.beginTransaction(); const d = parsed.data;
    const [r] = await conn.query('UPDATE podcasts SET title=?,description=?,youtube_id=?,slug=?,sort_order=?,is_published=? WHERE id=?', [d.title, d.description, d.youtube_id, d.slug, d.sort_order, d.is_published, id]);
    if (!r.affectedRows) { await conn.rollback(); return res.status(404).json({ message: 'Podcast not found' }); }
    await saveSeo(conn, id, d); await conn.commit(); return res.json({ message: 'Podcast updated' });
  } catch (e) { if (conn) await conn.rollback(); return sqlError(res, e, 'update'); } finally { conn?.release(); }
}
export async function reorderPodcasts(req, res) {
  const ids = req.body?.ids;
  if (!Array.isArray(ids) || ids.length > 2000 || !ids.every(v => Number.isSafeInteger(v) && v > 0) || new Set(ids).size !== ids.length) return res.status(422).json({ message: 'Send an ordered array of unique podcast IDs' });
  let conn;
  try {
    conn = await pool.getConnection(); await conn.beginTransaction(); const [rows] = await conn.query('SELECT id FROM podcasts FOR UPDATE');
    if (rows.length !== ids.length || rows.some(row => !ids.includes(Number(row.id)))) { await conn.rollback(); return res.status(409).json({ message: 'Podcast list changed. Refresh before reordering.' }); }
    for (let i = 0; i < ids.length; i++)await conn.query('UPDATE podcasts SET sort_order=? WHERE id=?', [i + 1, ids[i]]);
    await conn.commit(); return res.json({ success: true });
  } catch (e) { if (conn) await conn.rollback(); return sqlError(res, e, 'reorder'); } finally { conn?.release(); }
}
export async function deletePodcast(req, res) {
  const id = idParam(req); if (!id) return res.status(400).json({ message: 'Invalid podcast ID' });
  let conn;
  try {
    await ensurePodcastSeo(); conn = await pool.getConnection(); await conn.beginTransaction();
    const [r] = await conn.query('DELETE FROM podcasts WHERE id=?', [id]);
    if (!r.affectedRows) { await conn.rollback(); return res.status(404).json({ message: 'Podcast not found' }); }
    await conn.query('DELETE FROM podcast_seo WHERE episode_id=?', [id]);
    await conn.commit(); return res.json({ message: 'Podcast deleted' });
  } catch (e) { if (conn) await conn.rollback(); return sqlError(res, e, 'delete'); } finally { conn?.release(); }
}
const externalGet = async url => {
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 6000);
  try { const r = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' }, cache: 'no-store' }); if (!r.ok) throw Error(`YouTube returned ${r.status}`); return await r.json(); }
  finally { clearTimeout(timer); }
};
export async function getYoutubePodcastMetadata(req, res) {
  const videoId = youtubeVideoId(req.query.url || req.query.id || '');
  if (!videoId) return res.status(422).json({ message: 'Enter a valid YouTube URL or video ID' });
  try {
    let title = '', description = '', channelTitle = '', thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, source = 'YouTube oEmbed';
    if (process.env.YOUTUBE_DATA_API_KEY) {
      try {
        const u = new URL('https://www.googleapis.com/youtube/v3/videos'); u.searchParams.set('part', 'snippet'); u.searchParams.set('id', videoId); u.searchParams.set('key', process.env.YOUTUBE_DATA_API_KEY);
        const data = await externalGet(u.toString()); const snippet = data.items?.[0]?.snippet;
        if (snippet) { title = String(snippet.title || '').slice(0, 255); description = String(snippet.description || '').slice(0, 5000); channelTitle = String(snippet.channelTitle || '').slice(0, 200); thumbnailUrl = snippet.thumbnails?.high?.url || thumbnailUrl; source = 'YouTube Data API'; }
      } catch (e) { console.warn('[youtube data api]', e.message); }
    }
    if (!title) {
      const url = new URL('https://www.youtube.com/oembed'); url.searchParams.set('url', `https://www.youtube.com/watch?v=${videoId}`); url.searchParams.set('format', 'json');
      const d = await externalGet(url.toString()); title = String(d.title || '').slice(0, 255); channelTitle = String(d.author_name || '').slice(0, 200); thumbnailUrl = d.thumbnail_url || thumbnailUrl;
    }
    return res.json({ videoId, title, description, channelTitle, thumbnailUrl, source, descriptionAvailable: Boolean(description) });
  } catch (e) { console.warn('[youtube metadata]', e.message); return res.status(502).json({ message: 'YouTube metadata is not available for this video. You can enter the fields manually.' }); }
}
export { parsePodcast };
