const pool = require('../../config/database');

// Create a new contact message
exports.createContactMessage = async (req, res) => {
    try {
        const { name, email, address, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required fields' });
        }

        const query = 'INSERT INTO contact_messages (name, email, address, message) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(query, [name, email, address, message]);

        res.status(201).json({
            message: 'Contact message sent successfully',
            data: {
                id: result.insertId,
                name,
                email,
                address,
                message
            }
        });
    } catch (error) {
        console.error('Error creating contact message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Get all contact messages
exports.getContactMessages = async (req, res) => {
    try {
        const query = 'SELECT * FROM contact_messages ORDER BY created_at DESC';
        const [rows] = await pool.query(query);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
