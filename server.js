const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const nodemailer = require('nodemailer');

// Configure transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'shaldonbarnes07@gmail.com',
        pass: 'nxre ocwl ogyo kjmj'
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


const app = express();
const port = 3000;

// PostgreSQL connection setup
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'airportdb',
    password: 'Shaldon(10)',
    port: 5433,
});

// Connect to database
pool.connect()
    .then(() => console.log('Connected to the database'))
    .catch((err) => console.error('Database connection failed:', err));

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// Add new flight (WITH gate check and insert if missing)
app.post('/api/flights', async (req, res) => {
    const { flight_name, flight_no, dept_time, arr_time, gate_id, terminal, status } = req.body;
    if (!flight_name || !flight_no || !dept_time || !arr_time || !gate_id || !terminal || !status) {
        return res.status(400).json({ message: 'Missing required flight or gate data.' });
    }

    const deptTimeFormatted = (dept_time);
    const arrTimeFormatted = (arr_time);
    const gateIdInt = parseInt(gate_id);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Ensure gate exists, insert with full info if missing
        const gateCheck = await client.query('SELECT 1 FROM GATE WHERE gate_id = $1', [gateIdInt]);
        if (gateCheck.rows.length === 0) {
            await client.query('INSERT INTO GATE (gate_id, Terminal, Status) VALUES ($1, $2, $3)', [gateIdInt, terminal, status]);
        }

        await client.query(
            `INSERT INTO FLIGHTS (flight_name, flight_no, dept_time, arr_time, gate_id)
             VALUES ($1, $2, $3, $4, $5)`,
            [flight_name, flight_no, deptTimeFormatted, arrTimeFormatted, gateIdInt]
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
                    TO_CHAR(f.Dept_time, 'HH24:MI:SS') AS dept_time, 
                    TO_CHAR(f.Arr_time, 'HH24:MI:SS') AS arr_time,
                    f.gate_id, g.terminal, g.status
             FROM FLIGHTS f JOIN GATE g ON f.gate_id = g.gate_id
             ORDER BY f.flight_id`
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching flights:', error);
        res.status(500).json({ message: 'Failed to fetch flights.' });
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
        await pool.query(
            `INSERT INTO PASSENGERS (pass_name, flight_name, flight_no, dept_time) 
             VALUES ($1, $2, $3, $4)`,
            [pass_name, flight_name, flight_no, dept_time]
        );
        res.status(201).json({ message: 'Passenger added successfully' });
    } catch (error) {
        console.error('Error adding passenger:', error);
        res.status(500).json({ message: 'Failed to add passenger' });
    }
});



// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/signup.html`);
});
