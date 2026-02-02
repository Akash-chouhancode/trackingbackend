const pool = require('../../config/database');

function generateTrackingId(name, email) {
  const base = (email || name || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (base.slice(0, 5) || '').padEnd(5, 'X');
  const numbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 10)).join('');
  const letters = Array.from({ length: 5 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  return `${prefix}${numbers}${letters}`;
}

async function createTracking(req, res) {
  try {
    const { name, phone, email } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Check if email already exists
    if (email) {
      const [existing] = await pool.query('SELECT id FROM tracking_ids WHERE email = ?', [email]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'This email is already registered with a tracking ID.' });
      }
    }

    let trackingId = generateTrackingId(name, email);
    let attempts = 0;
    while (attempts < 3) {
      try {
        const [result] = await pool.query(
          'INSERT INTO tracking_ids (name, phone, email, tracking_id) VALUES (?, ?, ?, ?)',
          [name, phone, email || null, trackingId]
        );
        return res.status(201).json({
          message: 'Tracking ID created successfully',
          tracking_id: trackingId,
          data: {
            id: result.insertId,
            name,
            phone,
            email: email || null,
            tracking_id: trackingId
          }
        });
      } catch (e) {
        if (e && e.code === 'ER_DUP_ENTRY') {
          trackingId = generateTrackingId(name, email);
          attempts += 1;
          continue;
        }
        throw e;
      }
    }
    return res.status(500).json({ error: 'Could not generate unique tracking ID' });
  } catch (e) {
    return res.status(500).json({ error: 'Internal Server Error', details: e.message });
  }
}

async function getTrackings(req, res) {
  try {
    const query = `
      SELECT 
        t.id, 
        t.name, 
        t.phone, 
        t.email, 
        t.tracking_id, 
        t.created_at,
        u.location,
        u.estimated_date,
        u.estimated_time,
        u.status as status
      FROM tracking_ids t
      LEFT JOIN tracking_updates u ON t.id = u.tracking_record_id 
      AND u.id = (
          SELECT MAX(id)
          FROM tracking_updates
          WHERE tracking_record_id = t.id
      )
      ORDER BY t.created_at DESC
    `;
    const [rows] = await pool.query(query);
    return res.status(200).json(rows);
  } catch (e) {
    return res.status(500).json({ error: 'Internal Server Error', details: e.message });
  }
}

module.exports = { createTracking, getTrackings };

