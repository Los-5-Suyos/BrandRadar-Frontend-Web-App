// BrandRadar Fake API Server
// Usa Express directamente (más compatible que json-server beta)
// Ejecutar con: node server.js

const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, 'db.json');

// Helpers
const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
const writeDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

app.use(cors());
app.use(express.json());

// ─── AUTH ──────────────────────────────────────────────────────────────────
app.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  const db = readDB();
  const users = db.registered_users || db.users || [];
  const user = users.find(u => u.email === email);

  if (!user || user.password !== password)
    return res.status(401).json({ message: 'Credenciales incorrectas.' });
  if (user.status === 'BLOCKED')
    return res.status(403).json({ message: 'Cuenta bloqueada.' });

  res.json({
    token: 'fake-jwt-' + Date.now(),
    user: { id: user.id, email: user.email, name: user.name,
            status: user.status, accountType: user.accountType,
            assignedBrandIds: user.assignedBrandIds || [], failedAttempts: 0 }
  });
});

app.post('/auth/register', (req, res) => {
  const { name, email, password, accountType } = req.body || {};
  const db = readDB();
  const users = db.registered_users || [];

  if (users.find(u => u.email === email))
    return res.status(409).json({ message: 'Email ya registrado.' });

  const newUser = { id: 'u-' + Date.now(), name, email, password,
                    accountType, status: 'PENDING_VERIFICATION',
                    failedAttempts: 0, assignedBrandIds: [] };
  users.push(newUser);
  db.registered_users = users;
  writeDB(db);

  res.status(201).json({ id: newUser.id, email: newUser.email,
    name: newUser.name, status: newUser.status, accountType: newUser.accountType,
    token: 'fake-verify-' + Date.now() });
});

// ─── GENERIC CRUD (simula json-server) ─────────────────────────────────────
const COLLECTIONS = ['users','workspaces','brands','mentions','alerts',
                     'incidents','reports','auditLogs','sentimentHistory',
                     'monitoringRules','registered_users','patterns'];

COLLECTIONS.forEach(col => {
  // GET all
  app.get(`/${col}`, (req, res) => {
    const db = readDB();
    let items = db[col] || [];
    // simple filter by query params
    Object.entries(req.query).forEach(([k, v]) => {
      items = items.filter(i => String(i[k]) === String(v));
    });
    res.json(items);
  });

  // GET by id
  app.get(`/${col}/:id`, (req, res) => {
    const db = readDB();
    const item = (db[col] || []).find(i => String(i.id) === req.params.id);
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  });

  // POST
  app.post(`/${col}`, (req, res) => {
    const db = readDB();
    if (!db[col]) db[col] = [];
    const item = { id: col + '-' + Date.now(), ...req.body };
    db[col].push(item);
    writeDB(db);
    res.status(201).json(item);
  });

  // PUT
  app.put(`/${col}/:id`, (req, res) => {
    const db = readDB();
    const idx = (db[col] || []).findIndex(i => String(i.id) === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    db[col][idx] = { ...db[col][idx], ...req.body, id: req.params.id };
    writeDB(db);
    res.json(db[col][idx]);
  });

  // PATCH
  app.patch(`/${col}/:id`, (req, res) => {
    const db = readDB();
    const idx = (db[col] || []).findIndex(i => String(i.id) === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Not found' });
    db[col][idx] = { ...db[col][idx], ...req.body };
    writeDB(db);
    res.json(db[col][idx]);
  });

  // DELETE
  app.delete(`/${col}/:id`, (req, res) => {
    const db = readDB();
    const before = (db[col] || []).length;
    db[col] = (db[col] || []).filter(i => String(i.id) !== req.params.id);
    if (db[col].length === before) return res.status(404).json({ message: 'Not found' });
    writeDB(db);
    res.json({});
  });
});

app.listen(PORT, () => {
  console.log('\n  \\{^_^}/ BrandRadar Fake API lista!\n');
  console.log(`  > http://localhost:${PORT}\n`);
  console.log('  Endpoints disponibles:');
  console.log(`    POST   /auth/login`);
  console.log(`    POST   /auth/register`);
  COLLECTIONS.forEach(c => console.log(`    GET    /${c}`));
  console.log('');
});
