const express = require('express');
const mysql = require('mysql2');

const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./user');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: '192.168.1.97',
  user: 'root', // Replace with your MySQL username
  password: 'Seatech@123', // Replace with your MySQL password
  database: 'family_tree', // Replace with your database name
});
const crypto = require('crypto');
db.connect((err) => {
  if (err) {
    //console.error('Database connection failed:', err.stack);
    return;
  }
 // console.log('Connected to MySQL database.');
});

app.use(express.json()); // For parsing application/json
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true, // Set to true if using HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);







// POST route to save user data
app.post('/api/signup', (req, res) => {
  const {
    prefix,
    first_name,
    middle_name,
    last_name,
    display_name,
    phone_number,
    email_id,
    address,
    area,
    district,
    state,
    pin
  } = req.body;

  // Check if all required fields are present
  if (
    !prefix ||
    !first_name ||
    !last_name ||
    !display_name ||
    !phone_number ||
    !email_id ||
    !address ||
    !area ||
    !district ||
    !state ||
    !pin
  ) {
    return res.status(400).json({ msg: 'Please fill all the fields' });
  }

  // Insert the data into the MySQL database
  const query = `
      INSERT INTO users (prefix, first_name, middle_name, last_name, display_name, phone_number, email_id, address, area, district, state, pin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
  db.query(
    query,
    [prefix, first_name, middle_name, last_name, display_name, phone_number, email_id, address, area, district, state, pin],
    (err, result) => {
      if (err) {
       // console.error('Failed to save user data:', err);
        return res.status(500).json({ error: 'Failed to save user data' });
      }
      res.status(201).json({ id: result.insertId, first_name, last_name, email_id });
    }
  );
});
// =============================================================================================

// POST route to save user data
app.post('/api/update', async (req, res) => {
  const { phone_number, otp } = req.body;

//console.log('<><<><<><>',req.body);
  try {
    // Ensure both phone_number and otp are provided
    if (!phone_number || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }
    // Update the user's OTP where the phone number matches
    const [updated] = await User.update(
      { otp }, // Fields to update
      { where: { phone_number } } // Condition to match
    );

    if (updated) {
      return res.json({ message: 'OTP updated successfully' });
    } else {
      return res.status(404).json({ message: 'User not found with provided phone number' });
    }
  } catch (error) {
    //console.error('Error updating user data:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});



// ==============================================================================================


const nodemailer = require('nodemailer');

app.post('/api/login', async (req, res) => {
  const { input } = req.body;

  // Determine if the input is an email or phone number
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
  const isPhone = /^\d{10}$/.test(input);

  if (!isEmail && !isPhone) {
    return res.status(400).json({ message: 'Please enter a valid email address or a 10-digit mobile number.' });
  }

  // Generate a random 4-digit OTP
  const otp = crypto.randomInt(1000, 9999).toString();
  //const otpExpiration = new Date(Date.now() + 90 * 1000); // OTP valid for 90 seconds

  findUser(input, isEmail, isPhone);
  // Find or create a user in the database
  async function findUser(input, isEmail, isPhone) {
    let user;

    try {
      if (isEmail) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'rajasbehera@gmail.com',
            pass: 'Gmailpassword@1703',
          },
        });

        const mailOptions = {
          from: 'rajasbehera@gmail.com',
          to: input,
          subject: 'Your OTP Code',
          text: `Your OTP is ${otp}. It will expire in 90 seconds.`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).json({ message: 'Error sending OTP', error });
          } else {
            return res.json({ message: 'OTP sent successfully to mail' });
          }
        });
        user = await User.findOne({ where: { email_id: input } });
      //  console.log('User found with email:', user);
      } else if (isPhone) {
      //  console.log(`OTP sent to ${input}: ${otp}`);
        user = await User.findOne({ where: { phone_number: input } });
        if (user) {
         //  console.log('User found with phone number:', user);
          return res.json({ message: 'OTP sent successfully to phone',  data: `${otp}` });
        } else {
          //console.log("User doesn't exist");
          res.json({ message: 'Create Account First' });

        }

      }
    } catch (error) {
     // console.error('Error fetching user:', error.message);
    }

    return user;
  }


});


//   User.findOne({ where: { phone_number: '8888888888' } })
// .then(user => {
//   console.log('User found:-------', user);
// })
// .catch(error => {
//   console.error('Error fetching data------123----:', error);
// });


app.post('/api/verify-otp', async (req, res) => {
  const { email_id, phone_number, otp } = req.body;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email_id);
  const isPhone = /^\d{10}$/.test(req.body.phone_number);

  let user;

  if (isEmail) {
    user = await User.findOne({ where: { email_id } });
  } else if (isPhone) {
    user = await User.findOne({ where: { phone_number } });
  }
 // console.log('><<><><-----1------><><><><><><', user.otp);
  console.log('><<><><-----2-------><><><><><><',  user.id);
  const { id } = req.body;
  if (user && user.otp == otp ) {
    user.isLoggedIn = true;
    
  req.session.userId = id;
    await user.save();
    res.json({ message: 'Login successful', redirectTo: '/home', userId: user.id });
  } else {
    res.status(400).json({ message: 'Invalid OTP or OTP expired' });
  }
});


// Middleware to check if user is logged in
app.use((req, res, next) => {
  console.log('Session:', req.session); // Log entire session object
  console.log('Session User ID:', req.session.id); // Log userId specifically
  if (req.session.id) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized access' });
  }
});

// app.post('/login', (req, res) => {
//   const { userId } = req.body;
//   req.session.userId = userId;
//   res.json({ message: 'Login successful', userId });
// });



// app.get('/profile', (req, res) => {
//   res.json({ userId: req.session.userId });
// });



//   ============================================================================================

app.get('/api/search', (req, res) => {
  const { first_name, area, district, state, uniqueId } = req.query;
  let query = 'SELECT * FROM users WHERE 1=1';
  let params = [];

  if (first_name) {
    query += ' AND first_name LIKE ?';
    params.push(`%${first_name}%`);
  }
  if (area) {
    query += ' AND area LIKE ?';
    params.push(`%${area}%`);
  }
  if (district) {
    query += ' AND district LIKE ?';
    params.push(`%${district}%`);
  }
  if (state) {
    query += ' AND state LIKE ?';
    params.push(`%${state}%`);
  }
  if (uniqueId) {
    query += ' AND uniqueId = ?';
    params.push(uniqueId);
  }

  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    // console.log(results);
    res.json(results);
  });
});

//   =============================================================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));