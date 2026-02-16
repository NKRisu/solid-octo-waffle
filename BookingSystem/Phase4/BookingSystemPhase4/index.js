require("dotenv").config();
const crypto = require('crypto');
const express = require("express");
const app = express();
const PORT = process.env.IPORT;
const path = require('path');
const { Pool } = require('pg');
const { body, validationResult } = require('express-validator');

// easy refer spot for allowed pattern
const finnishPattern = /^[a-zA-Z0-9äöåÄÖÅ ]+$/;

// Timestamp
function timestamp() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').replace('Z', '');
}

// --- Middleware ---
app.use(express.json()); // Parse application/json

// Serve everything in ./public as static assets
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));

// --- Views (HTML pages) ---
// GET / -> serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// Optional: GET /resources -> serve resources.html directly
app.get('/resources', (req, res) => {
  res.sendFile(path.join(publicDir, 'resources.html'));
});

// allow only these fields to be used
const allowedFields = [
  'action',
  'resourceName',
  'resourceDescription',
  'resourceAvailable',
  'resourcePrice',
  'resourcePriceUnit'
];

app.use('/api/resources', (req, res, next) => {
  const extra = Object.keys(req.body).filter(k => !allowedFields.includes(k));
  if (extra.length > 0) {
    return res.status(400).json({
      ok: false,
      error: `Unexpected fields: ${extra.join(', ')}`
    });
  }
  next();
});

// --- Postgres pool (reads PG* from .env) ---
const pool = new Pool({});

// --- express-validator rules for the payload ---
const resourceValidators = [
  body('action')
    .notEmpty().withMessage('action is required')
    .trim()
    .isIn(['create'])
    .withMessage("action must be 'create'"),

  body('resourceName')
    .notEmpty().withMessage('resourceName is required')
    .isString().withMessage('resourceName must be a string')
    .trim()
    .isLength({ min: 5, max: 30}).withMessage("minimum 5, max 30 characters.")  // added min and max length
    .matches(finnishPattern) // added pattern match
    .withMessage('resourceName contains invalid characters'),

  body('resourceDescription')
    .notEmpty().withMessage('resourceDescription is required')
    .isString().withMessage('resourceDescription must be a string')
    .trim()
    .isLength({ min:10, max: 50 }).withMessage('resourceDescription must be 10-50 characters')
    .matches(finnishPattern) // added pattern match
    .withMessage('resourceName contains invalid characters'),

  body('resourceAvailable')
    .notEmpty().withMessage('resourceAvailable is required')
    .bail()
    // allow true or "true" as some odd cases string could be sent
    .custom(value => {
      if (value === true || value === "true") return true;
      throw new Error('resourceAvailable must be true');
    })
    .toBoolean(),


  body('resourcePrice')
    .notEmpty().withMessage('resourcePrice is required')
    .isFloat({ min: 0 }).withMessage('resourcePrice must be a non-negative number')
    .toFloat(), // coercion

  body('resourcePriceUnit')
    .notEmpty().withMessage('resourcePriceUnit is required')
    .isString().withMessage('resourcePriceUnit must be a string')
    .trim()
    .isIn(['hour', 'day', 'month', 'week']) // month and week added
    .withMessage("resourcePriceUnit must be 'hour', 'day', 'week', or 'month'"),
];

// POST /api/resources -> create (minimal)
app.post('/api/resources', resourceValidators, async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg })),
    });
  }

  // Pull normalized values (coerced by express-validator .toBoolean/.toFloat)
  let {
    action = '',
    resourceName = '',
    resourceDescription = '',
    resourceAvailable = false,
    resourcePrice = 0,
    resourcePriceUnit = ''
  } = req.body;

  // Log (optional)
  console.log("The client's POST request ", `[${timestamp()}]`);
  console.log('------------------------------');
  console.log('Action ➡️ ', action);
  console.log('Name ➡️ ', resourceName);
  console.log('Description ➡️ ', resourceDescription);
  console.log('Availability ➡️ ', resourceAvailable);
  console.log('Price ➡️ ', resourcePrice);
  console.log('Price unit ➡️ ', resourcePriceUnit);
  console.log('------------------------------');

  if (action !== 'create') {
    return res.status(400).json({ ok: false, error: 'Only create is implemented right now' });
  }

  // resourceAvailable = false; this breaks.

  try {
    const insertSql = `
      INSERT INTO resources (name, description, available, price, price_unit)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, description, available, price, price_unit, created_at
    `;
    const params = [
      crypto.createHash('sha256').update(resourceName, 'utf8').digest('hex'), // hashed before storing the name, cant retvieve name... guess intended? unsure.
      resourceDescription,
      Boolean(resourceAvailable),
      Number(resourcePrice), // but why... *2,
      resourcePriceUnit
    ];

    const { rows } = await pool.query(insertSql, params);
    const created = rows[0];

    return res.status(201).json({ ok: true, data: created });
  } catch (err) {
    console.error('DB insert failed:', err);
    return res.status(500).json({ ok: false, error: 'Database error' });
  }
});

// --- Fallback 404 for unknown API routes ---
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});