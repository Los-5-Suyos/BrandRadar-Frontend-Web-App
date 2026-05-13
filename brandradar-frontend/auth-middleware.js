/**
 * json-server middleware for BrandRadar auth fake API
 * Run: npx json-server db.json --middlewares auth-middleware.js --port 3000
 */
module.exports = (req, res, next) => {
  // POST /auth/login
  if (req.method === 'POST' && req.path === '/auth/login') {
    const { email, password } = req.body || {};
    const fs = require('fs');
    const db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    const users = db.registered_users || db.users || [];

    const user = users.find(u => u.email === email);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({ message: 'Cuenta bloqueada.' });
    }

    return res.json({
      token: 'fake-jwt-token-' + Date.now(),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        accountType: user.accountType,
        assignedBrandIds: user.assignedBrandIds || [],
        failedAttempts: 0,
      }
    });
  }

  // POST /auth/register
  if (req.method === 'POST' && req.path === '/auth/register') {
    const { name, email, password, accountType } = req.body || {};
    const fs = require('fs');
    const db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    const users = db.registered_users || [];

    const exists = users.find(u => u.email === email);
    if (exists) {
      return res.status(409).json({ message: 'Email ya registrado.' });
    }

    const newUser = {
      id: 'u-' + Date.now(),
      name, email, password,
      accountType,
      status: 'PENDING_VERIFICATION',
      failedAttempts: 0,
      assignedBrandIds: [],
    };
    users.push(newUser);
    db.registered_users = users;
    fs.writeFileSync('./db.json', JSON.stringify(db, null, 2));

    return res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      status: newUser.status,
      accountType: newUser.accountType,
      token: 'fake-verify-token-' + Date.now(),
    });
  }

  next();
};
