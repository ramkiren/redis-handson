const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors package

const app = express();
const port = 3001;

const client = redis.createClient();

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes


// Simulated user data (for demo purposes)
const users = {
  'john_doe': { password: 'password123', email: 'john@example.com' },
  'jane_smith': { password: 'pass456', email: 'jane@example.com' },
};

// Middleware to check if a user is logged in
const checkLoggedIn = (req, res, next) => {
  const { username } = req.body;
  client.get(username, (err, reply) => {
    if (reply) {
      res.json({ success: true, message: `Welcome back, ${username}!` });
    } else {
      next();
    }
  });
};

// Login route
app.post('/login', checkLoggedIn, (req, res) => {
  const { username, password } = req.body;

  // Simulate checking credentials against a database
  const user = users[username];

  if (user && user.password === password) {
    // Cache the username for future requests
    client.set(username, JSON.stringify(user));
    res.json({ success: true, message: `Welcome, ${username}!` });
  } else {
    res.json({ success: false, message: 'Invalid credentials.' });
  }
});

// Logout route
app.post('/logout', (req, res) => {
  const { username } = req.body;
  client.del(username, (err, reply) => {
    if (reply === 1) {
      res.json({ success: true, message: 'Logout successful!' });
    } else {
      res.json({ success: false, message: 'User not found.' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
