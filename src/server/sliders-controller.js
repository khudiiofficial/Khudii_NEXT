import db from './admin-backend/Database/oldDB.js';

const sql = db.promise();

let initPromise;
async function initSlidersTable() {
  if (!initPromise) {
    initPromise = (async () => {
      await sql.query(`
        CREATE TABLE IF NOT EXISTS home_sliders (
          id INT NOT NULL AUTO_INCREMENT,
          title VARCHAR(255) NOT NULL,
          image_url VARCHAR(500) NOT NULL,
          link_url VARCHAR(500) DEFAULT NULL,
          display_order INT NOT NULL DEFAULT 0,
          is_active TINYINT(1) NOT NULL DEFAULT 1,
          created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL DEFAULT NULL,
          PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    })().catch((e) => {
      initPromise = undefined;
      throw e;
    });
  }
  return initPromise;
}

const clean = (val, max = 500) => String(val ?? '').slice(0, max).trim();

export async function listAdminSliders(req, res) {
  try {
    await initSlidersTable();
    const [rows] = await sql.query(
      'SELECT id, title, image_url AS imageUrl, link_url AS linkUrl, display_order AS `order`, is_active AS isActive, created_at AS createdAt FROM home_sliders WHERE deleted_at IS NULL ORDER BY display_order ASC, id ASC'
    );
    return res.json({ success: true, data: rows.map(r => ({ ...r, isActive: Boolean(r.isActive) })) });
  } catch (err) {
    console.error('[Sliders Controller Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch sliders' });
  }
}

export async function listPublicSliders(req, res) {
  try {
    await initSlidersTable();
    const [rows] = await sql.query(
      'SELECT id, title, image_url AS imageUrl, link_url AS linkUrl, display_order AS `order` FROM home_sliders WHERE deleted_at IS NULL AND is_active = 1 ORDER BY display_order ASC, id ASC'
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[Sliders Controller Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch public sliders' });
  }
}

export async function createSlider(req, res) {
  try {
    await initSlidersTable();
    const title = clean(req.body?.title, 255);
    const imageUrl = clean(req.body?.imageUrl || req.body?.image_url, 500);
    const linkUrl = clean(req.body?.linkUrl || req.body?.link_url, 500) || null;
    const isActive = req.body?.isActive !== false ? 1 : 0;

    if (!title || !imageUrl) {
      return res.status(400).json({ success: false, message: 'Title and image are required' });
    }

    const [countRows] = await sql.query('SELECT COUNT(*) AS total FROM home_sliders WHERE deleted_at IS NULL');
    const order = Number(countRows[0]?.total || 0) + 1;

    const [result] = await sql.query(
      'INSERT INTO home_sliders (title, image_url, link_url, display_order, is_active) VALUES (?, ?, ?, ?, ?)',
      [title, imageUrl, linkUrl, order, isActive]
    );

    return res.status(201).json({
      success: true,
      message: 'Slider created successfully',
      data: { id: result.insertId, title, imageUrl, linkUrl, order, isActive: Boolean(isActive) },
    });
  } catch (err) {
    console.error('[Sliders Controller Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to create slider' });
  }
}

export async function updateSlider(req, res) {
  try {
    await initSlidersTable();
    const id = Number(req.params?.id || req.body?.id);
    if (!id) return res.status(400).json({ success: false, message: 'Slider ID is required' });

    const title = clean(req.body?.title, 255);
    const imageUrl = clean(req.body?.imageUrl || req.body?.image_url, 500);
    const linkUrl = clean(req.body?.linkUrl || req.body?.link_url, 500) || null;
    const isActive = req.body?.isActive !== undefined ? (req.body.isActive ? 1 : 0) : undefined;
    const order = req.body?.order !== undefined ? Number(req.body.order) : undefined;

    const updates = [];
    const params = [];

    if (title) { updates.push('title = ?'); params.push(title); }
    if (imageUrl) { updates.push('image_url = ?'); params.push(imageUrl); }
    if (linkUrl !== undefined) { updates.push('link_url = ?'); params.push(linkUrl); }
    if (isActive !== undefined) { updates.push('is_active = ?'); params.push(isActive); }
    if (order !== undefined) { updates.push('display_order = ?'); params.push(order); }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(id);
    await sql.query(`UPDATE home_sliders SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ success: true, message: 'Slider updated successfully' });
  } catch (err) {
    console.error('[Sliders Controller Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to update slider' });
  }
}

export async function deleteSlider(req, res) {
  try {
    await initSlidersTable();
    const id = Number(req.params?.id);
    if (!id) return res.status(400).json({ success: false, message: 'Slider ID is required' });

    await sql.query('UPDATE home_sliders SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Slider deleted successfully' });
  } catch (err) {
    console.error('[Sliders Controller Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to delete slider' });
  }
}

export async function reorderSliders(req, res) {
  try {
    await initSlidersTable();
    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Array of slider IDs required' });
    }

    for (let i = 0; i < ids.length; i++) {
      await sql.query('UPDATE home_sliders SET display_order = ? WHERE id = ?', [i + 1, ids[i]]);
    }

    return res.json({ success: true, message: 'Sliders reordered successfully' });
  } catch (err) {
    console.error('[Sliders Controller Error]', err);
    return res.status(500).json({ success: false, message: 'Failed to reorder sliders' });
  }
}
