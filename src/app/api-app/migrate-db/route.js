import db from '@/server/admin-backend/Database/oldDB';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function runMigration(request) {
  try {
    const conn = await db.promise().getConnection();
    const results = [];
    const { searchParams } = new URL(request.url);
    const fixMedia = searchParams.get('fixMedia') === 'true' || searchParams.get('fixMedia') === '1';

    // 1. Items table columns
    const itemColumns = [
      { name: 'partner_image', type: 'VARCHAR(255) NULL' },
      { name: 'search_tags', type: 'VARCHAR(500) NULL' },
      { name: 'slug', type: 'VARCHAR(255) NULL' },
      { name: 'meta_title', type: 'VARCHAR(255) NULL' },
      { name: 'meta_description', type: 'TEXT NULL' },
      { name: 'meta_keywords', type: 'TEXT NULL' },
    ];

    for (const col of itemColumns) {
      try {
        await conn.query(`ALTER TABLE items ADD COLUMN ${col.name} ${col.type}`);
        results.push(`Added ${col.name} to items table`);
      } catch (e) {
        results.push(`items.${col.name}: ${e.message}`);
      }
    }

    // 2. Socials table columns
    const socialCols = ['website', 'youtubechannel', 'email', 'linkedin', 'googlemap'];
    for (const col of socialCols) {
      try {
        await conn.query(`ALTER TABLE socials ADD COLUMN ${col} VARCHAR(255) NULL`);
        results.push(`Added ${col} to socials table`);
      } catch (e) {
        results.push(`socials.${col}: ${e.message}`);
      }
    }

    // 3. Ensure item_urls table exists
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS item_urls (
          id INT AUTO_INCREMENT PRIMARY KEY,
          item_id INT NOT NULL,
          urls JSON,
          FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
        )
      `);
      results.push('Ensured item_urls table exists');
    } catch (e) {
      results.push(`item_urls creation error: ${e.message}`);
    }

    // 4. Ensure organization_submissions table exists
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS organization_submissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          organization_name VARCHAR(255) NOT NULL,
          contact_person_name VARCHAR(255) NOT NULL,
          contact_person_mobile VARCHAR(50) NOT NULL,
          organization_logo_path VARCHAR(255) NULL,
          user_google_email VARCHAR(255) NULL,
          user_google_name VARCHAR(255) NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      results.push('Ensured organization_submissions table exists');
    } catch (e) {
      results.push(`organization_submissions error: ${e.message}`);
    }

    // 5. Optional / Automatic Fix for broken preupload image URLs
    // preupload- files are FTP-uploaded to /public_html/media and served from
    // https://media.khudii.com — so the CORRECT URL is media.khudii.com/preupload-*
    // A previous bad migration may have rewritten them to khudii.com/preupload-*
    // which is wrong. This block restores those URLs back to media.khudii.com.
    if (fixMedia) {
      try {
        const [itemsResult] = await conn.query(`
          UPDATE items 
          SET introductory_image_path = REPLACE(introductory_image_path, 'https://khudii.com/preupload-', 'https://media.khudii.com/preupload-')
          WHERE introductory_image_path LIKE '%khudii.com/preupload-%'
            AND introductory_image_path NOT LIKE '%media.khudii.com/preupload-%'
        `);

        const [itemImagesResult] = await conn.query(`
          UPDATE item_images 
          SET image_path = REPLACE(image_path, 'https://khudii.com/preupload-', 'https://media.khudii.com/preupload-')
          WHERE image_path LIKE '%khudii.com/preupload-%'
            AND image_path NOT LIKE '%media.khudii.com/preupload-%'
        `);

        results.push(`Media fix applied: Restored ${itemsResult.changedRows || 0} items and ${itemImagesResult.changedRows || 0} gallery images from khudii.com → media.khudii.com`);
      } catch (e) {
        results.push(`Media fix error: ${e.message}`);
      }
    }

    conn.release();
    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), results });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  return runMigration(request);
}

export async function POST(request) {
  return runMigration(request);
}
