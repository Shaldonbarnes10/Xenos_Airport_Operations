const express = require('express');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();
const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send email function
const sendWelcomeEmail = (toemail, username) => {
    const now = new Date().toLocaleString();
    const mailOptions = {
        from: 'shaldonbarnes07@gmail.com',
        to: toemail,
        subject: 'Welcome to Xenos Airport Admin Panel ✈️',
        html: `<h3>Hi ${username},</h3><p>Welcome! You’ve successfully signed up as an <b>Admin User</b> at ${now}.</p>`
    };
    return transporter.sendMail(mailOptions);
};

const sendSigninEmail = (toemail, username) => {
    const now = new Date().toLocaleString();
    const mailOptions = {
        from: 'shaldonbarnes07@gmail.com',
        to: toemail,
        subject: 'Xenos✈️ Signed in Sucessfully!!',
        html: `<h3>Hi ${username},</h3><p>Welcome! You’ve successfully signed in at ${now}</p><p> Visit our website to avail exceptional airport management services</p>`
    };
    return transporter.sendMail(mailOptions);
};

const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const port = 3000;

// PostgreSQL connection setup
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = pool;

// Connect to database
pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Database connection failed:', err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/reports', express.static(path.join(__dirname, 'public/reports')));

// Serve HTML files
app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/signin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signin.html'));
});

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { username, password, designation } = req.body;

    try {
        const existingUser = await pool.query('SELECT * FROM ADMIN_USERS WHERE Username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        await pool.query(
            'INSERT INTO ADMIN_USERS (Username, Password, Role) VALUES ($1, $2, $3)',
            [username, password, designation]
        );

        // Send welcome email
        await sendWelcomeEmail(username, username); // assuming username is the email

        res.status(201).json({ message: 'User created successfully, email sent.' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'Failed to create user' });
    }
});


// Signin endpoint
app.post('/api/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await pool.query('SELECT * FROM ADMIN_USERS WHERE Username = $1', [username]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User does not exist' });
        }

        if (user.rows[0].password !== password) {
            return res.status(401).json({ message: 'Invalid password' });
        }
        await sendSigninEmail(username, username);
        res.status(200).json({ message: 'Signin successful' });
    } catch (error) {
        console.error('Error during signin:', error);
        res.status(500).json({ message: 'Failed to signin' });
    }
});

app.post('/api/flights', async (req, res) => {
    const { flight_name, flight_no, flight_date, dept_time, arr_time, gate_id, terminal, status } = req.body;
    if (!flight_name || !flight_no || !flight_date || !dept_time || !arr_time || !gate_id || !terminal || !status) {
        return res.status(400).json({ message: 'Missing required flight or gate data.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Ensure gate exists, insert with terminal only if missing
        const gateCheck = await client.query('SELECT 1 FROM GATE WHERE gate_id = $1', [gate_id]);
        if (gateCheck.rows.length === 0) {
            await client.query('INSERT INTO GATE (gate_id, Terminal) VALUES ($1, $2)', [gate_id, terminal]);
        }

        await client.query(
            `INSERT INTO FLIGHTS (flight_name, flight_no, flight_date, dept_time, arr_time, gate_id, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [flight_name, flight_no, flight_date, dept_time, arr_time, gate_id, status]
        );        

        await client.query('COMMIT');
        res.status(201).json({ message: 'Flight added successfully.' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error adding flight:', error);
        res.status(500).json({ message: 'Failed to add flight.' });
    } finally {
        client.release();
    }
});


app.get('/api/flights', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT f.flight_id, f.flight_name, f.flight_no, 
                    TO_CHAR(f.flight_date, 'YYYY-MM-DD') AS flight_date,
                    TO_CHAR(f.dept_time, 'HH24:MI:SS') AS dept_time,
                    TO_CHAR(f.arr_time, 'HH24:MI:SS') AS arr_time,
                    f.gate_id, g.terminal, f.status
             FROM FLIGHTS f 
             JOIN GATE g ON f.gate_id = g.gate_id
             ORDER BY f.flight_date ASC, f.dept_time ASC`
        );               
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ message: 'Failed to fetch flights.' });
    }
});


app.put('/api/flights/:id', async (req, res) => {
    const { flight_name, flight_no, flight_date, dept_time, arr_time, gate_id, terminal, status } = req.body;
    const flightId = req.params.id;

    try {
        await pool.query('BEGIN');

        const gateCheck = await pool.query('SELECT 1 FROM GATE WHERE gate_id = $1', [gate_id]);
        if (gateCheck.rows.length === 0) {
            await pool.query('INSERT INTO GATE (gate_id, Terminal) VALUES ($1, $2)', [gate_id, terminal]);
        } else {
            await pool.query('UPDATE GATE SET Terminal = $2 WHERE gate_id = $1', [gate_id, terminal]);
        }

        await pool.query(
            `UPDATE FLIGHTS
             SET flight_name = $1,
                 flight_no = $2,
                 flight_date = $3,
                 dept_time = $4,
                 arr_time = $5,
                 gate_id = $6,
                 status = $7
             WHERE flight_id = $8`,
            [flight_name, flight_no, flight_date, dept_time, arr_time, gate_id, status, flightId]
        );

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Flight updated successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error updating flight:', error);
        res.status(500).json({ message: 'Failed to update flight' });
    }
});


// Delete a flight
app.delete('/api/flights/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM FLIGHTS WHERE flight_id = $1', [req.params.id]);
        res.status(204).end();
    } catch (error) {
        console.error('Error deleting flight:', error);
        res.status(500).json({ message: 'Failed to delete flight.' });
    }
});

// Get all passengers
app.get('/api/passengers', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM PASSENGERS ORDER BY pass_id'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching passengers:', error);
        res.status(500).json({ message: 'Failed to fetch passengers' });
    }
});

// Insert a new passenger
app.post('/api/passengers', async (req, res) => {
    const { pass_name, flight_name, flight_no, dept_time } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO PASSENGERS (pass_name, flight_name, flight_no, dept_time) 
             VALUES ($1, $2, $3, $4) RETURNING *`, // Return the newly created passenger
            [pass_name, flight_name, flight_no, dept_time]
        );
        res.status(201).json({ message: 'Passenger added successfully', passenger: result.rows[0] }); // Include the passenger in the response
    } catch (error) {
        console.error('Error adding passenger:', error);
        res.status(500).json({ message: 'Failed to add passenger' });
    }
});

// Update a passenger
app.put('/api/passengers/:id', async (req, res) => {
    try {
        const { pass_name, flight_name, flight_no, dept_time } = req.body;
        const result = await pool.query(
            'UPDATE passengers SET pass_name = $1, flight_name = $2, flight_no = $3, dept_time = $4 WHERE pass_id = $5 RETURNING *',
            [pass_name, flight_name, flight_no, dept_time, req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Passenger not found' });
        }
        
        res.json({ passenger: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a passenger
app.delete('/api/passengers/:id', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM passengers WHERE pass_id = $1 RETURNING *',
            [req.params.id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Passenger not found' });
        }
        
        res.json({ message: 'Passenger deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Report generation endpoint
app.post('/api/reports', async (req, res) => {
    const { reportType = 'general' } = req.body;
    
    try {
        // Create reports directory if it doesn't exist
        const reportsDir = path.join(__dirname, 'public', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${reportType}_report_${timestamp}.pdf`;
        const filePath = path.join(reportsDir, fileName);
        const publicPath = `/reports/${fileName}`;

        // Create PDF document
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Common header for all reports
        doc.fontSize(20).text('XENOS Flight Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Report Type: ${reportType.replace(/_/g, ' ').toUpperCase()}`, { align: 'center' });
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Generate different report types
        switch (reportType) {
            case 'detailed':
                await generateDetailedReport(doc);
                break;
            case 'passenger':
                await generatePassengerReport(doc);
                break;
            default: // general
                await generateGeneralReport(doc);
        }

        doc.end();

        stream.on('finish', () => {
            res.status(201).json({ 
                message: 'Report generated successfully', 
                filePath: publicPath,
                fileName 
            });
        });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ 
            message: `Failed to generate ${reportType} report`,
            error: error.message 
        });
    }
});


// Detailed Report generation endpoint
app.post('/api/reports/detailed', async (req, res) => {
    try {
        // Create reports directory
        const reportsDir = path.join(__dirname, 'public', 'reports');
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `detailed_report_${timestamp}.pdf`;
        const filePath = path.join(reportsDir, fileName);
        const publicPath = `/reports/${fileName}`;

        // Create PDF document
        const doc = new PDFDocument({ margin: 50 });
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Report Header
        doc.fontSize(20).text('XENOS Detailed Flight Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // 1. Airline Status Table
        doc.fontSize(14).text('Airline Status Overview', { underline: true });
        doc.moveDown(0.5);

        // Get airline status data
        const airlineStatusData = await pool.query(`
            SELECT 
                f.Flight_name AS airline_name,
                COUNT(f.Flight_id) AS num_flights,
                SUM(CASE WHEN f.Status ILIKE ANY (ARRAY['ontime', 'boarding']) THEN 1 ELSE 0 END) AS on_time,
                SUM(CASE WHEN f.Status ILIKE 'Delayed' THEN 1 ELSE 0 END) AS delayed
            FROM flights f
            GROUP BY f.Flight_name
            ORDER BY f.Flight_name
        `);
        
    
        // Draw airline status table
        drawTable(doc, 
            ['Airline Name', 'Number of Flights', 'On Time', 'Delayed'],
            airlineStatusData.rows.map(row => [
                row.airline_name,
                row.num_flights.toString(),
                row.on_time.toString(),
                row.delayed.toString()
            ]),
            [180, 100, 80, 80],
            true
        );
        

        doc.addPage(); // Add new page for passenger table

        // 2. Passenger Details Table
        doc.fontSize(14).text('Passenger Flight Details', { underline: true });
        doc.moveDown(0.5);

        // Get passenger data
        const passengerData = await pool.query(`
            SELECT 
                p.Pass_name AS passenger_name,
                COUNT(DISTINCT p.Pass_id) AS num_flights
            FROM passengers p
            GROUP BY p.Pass_name
            ORDER BY p.Pass_name
        `);

        // Draw passenger table
        drawTable(doc,
            ['Passenger Name', 'Total Flights'],
            passengerData.rows.map(row => [
                row.passenger_name,
                row.num_flights.toString()
            ]),
            [250, 100]
        );

        doc.end();

        stream.on('finish', () => {
            res.status(201).json({ 
                message: 'Detailed report generated successfully', 
                filePath: publicPath,
                fileName 
            });
        });

    } catch (error) {
        console.error('Error generating detailed report:', error);
        res.status(500).json({ 
            message: 'Failed to generate detailed report',
            error: error.message 
        });
    }
});


// Helper function to draw tables in PDF
function drawTable(doc, headers, rows, columnWidths) {
    const startY = doc.y;
    const startX = 50;
    const rowHeight = 20;
    const headerHeight = 25;
    
    // Draw headers
    doc.font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
        doc.text(header, x, startY, { width: columnWidths[i], align: 'left' });
        x += columnWidths[i];
    });
    
    // Draw rows
    doc.font('Helvetica');
    rows.forEach((row, rowIndex) => {
        x = startX;
        row.forEach((cell, colIndex) => {
            doc.text(cell, x, startY + headerHeight + (rowIndex * rowHeight), { 
                width: columnWidths[colIndex],
                align: 'left'
            });
            x += columnWidths[colIndex];
        });
    });
    
    // Update document position
    doc.y = startY + headerHeight + (rows.length * rowHeight) + 10;
}



// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/signup.html`);
});
