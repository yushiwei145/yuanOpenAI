const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

require('dotenv').config();

app.set('views engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Setup routes
app.use('/', (() => {
  const router = express.Router();
  router.use('/', require('./routes/home'));
  return router;
})());
app.use('/api', (() => {
  const router = express.Router();
  router.use('/cogsrch', require('./routes/api/cogsrch'));
  return router;
})());

// Health check
app.get('/health', (req, res, use) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

