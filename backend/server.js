const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_for_production';
const publicRoot = path.join(__dirname, '..');
const dbPath = path.join(__dirname, 'db.sqlite');

const defaultFoods = [
    { id: 1, name: 'Croissant', price: 4.99, image: 'photos/croissant.jpg', category: 'Croissants & Pastries' },
    { id: 2, name: 'Sourdough Bread', price: 6.99, image: 'photos/sourdough.jpg', category: 'Bread' },
    { id: 3, name: 'Chocolate Cake', price: 8.99, image: 'photos/chocolate-cake.jpg', category: 'Cakes' },
    { id: 4, name: 'Cinnamon Roll', price: 5.49, image: 'photos/cinnamon-roll.jpg', category: 'Sweet Treats' },
    { id: 5, name: 'Glazed Donut', price: 3.99, image: 'photos/donut.jpg', category: 'Donuts & Muffins' },
    { id: 6, name: 'Cheesecake', price: 7.99, image: 'photos/cheesecake.jpg', category: 'Cakes' },
    { id: 7, name: 'Blueberry Muffin', price: 4.49, image: 'photos/muffin.jpg', category: 'Donuts & Muffins' },
    { id: 8, name: 'Butter Bagel', price: 3.49, image: 'photos/bagel.jpg', category: 'Bread' },
    { id: 9, name: 'Almond Croissant', price: 5.99, image: 'photos/almond-croissant.jpg', category: 'Croissants & Pastries' },
    { id: 10, name: 'Brioche', price: 4.49, image: 'photos/brioche.jpg', category: 'Bread' },
    { id: 11, name: 'Tiramisu', price: 6.99, image: 'photos/tiramisu.jpg', category: 'Cakes' },
    { id: 12, name: 'Carrot Cake', price: 7.49, image: 'photos/carrot-cake.jpg', category: 'Cakes' },
    { id: 13, name: 'Brownies', price: 4.99, image: 'photos/brownies.jpg', category: 'Sweet Treats' },
    { id: 14, name: 'Apple Pie', price: 8.49, image: 'photos/apple-pie.jpg', category: 'Pies & Tarts' },
    { id: 15, name: 'Macarons (Box of 6)', price: 9.99, image: 'photos/macarons.jpg', category: 'Sweet Treats' },
    { id: 16, name: 'Rye Bread', price: 5.99, image: 'photos/rye-bread.jpg', category: 'Bread' },
    { id: 17, name: 'Raspberry Tart', price: 6.49, image: 'photos/raspberry-tart.jpg', category: 'Pies & Tarts' },
    { id: 18, name: 'Cronut', price: 5.49, image: 'photos/cronut.jpg', category: 'Croissants & Pastries' }
];

const db = new sqlite3.Database(dbPath, (error) => {
  if (error) {
    console.error('Unable to open database', error);
    process.exit(1);
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS foods (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT NOT NULL,
        category TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        isAdmin INTEGER NOT NULL DEFAULT 0
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        userId INTEGER NOT NULL,
        createdAt TEXT NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY,
        orderId INTEGER NOT NULL,
        foodId INTEGER NOT NULL,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY(orderId) REFERENCES orders(id)
      )`
    );

    const defaultAdminUsername = process.env.ADMIN_USERNAME || 'admin';
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    db.get('SELECT COUNT(*) AS count FROM foods', (error, row) => {
      if (error) {
        console.error('Database error while checking foods count:', error);
        return;
      }

      if (!row || row.count === 0) {
        const insertStmt = db.prepare(
          'INSERT INTO foods (id, name, price, image, category) VALUES (?, ?, ?, ?, ?)'
        );

        defaultFoods.forEach((food) => {
          insertStmt.run(food.id, food.name, food.price, food.image, food.category);
        });

        insertStmt.finalize();
      }
    });

    db.all('PRAGMA table_info(users)', (error, rows) => {
      if (error) {
        console.error('Unable to inspect users table schema:', error);
        return;
      }

      const hasIsAdmin = rows.some((row) => row.name === 'isAdmin');
      const ensureAdminColumn = (callback) => {
        if (hasIsAdmin) {
          callback();
          return;
        }

        db.run('ALTER TABLE users ADD COLUMN isAdmin INTEGER NOT NULL DEFAULT 0', (alterError) => {
          if (alterError) {
            console.error('Unable to add isAdmin column:', alterError);
          }
          callback();
        });
      };

      ensureAdminColumn(() => {
        db.get('SELECT id FROM users WHERE username = ?', [defaultAdminUsername], (error, row) => {
          if (error) {
            console.error('Database error while checking admin user:', error);
            return;
          }

          if (!row) {
            bcrypt.hash(defaultAdminPassword, 10, (hashError, passwordHash) => {
              if (hashError) {
                console.error('Admin password hashing failed:', hashError);
                return;
              }

              db.run(
                'INSERT INTO users (username, password, isAdmin) VALUES (?, ?, 1)',
                [defaultAdminUsername, passwordHash],
                (insertError) => {
                  if (insertError) {
                    console.error('Unable to create admin user:', insertError);
                  }
                }
              );
            });
          }
        });
      });
    });
  });
}

initializeDatabase();

app.use(express.json());
app.use(express.static(publicRoot));

app.get('/api/foods', (req, res) => {
  db.all('SELECT id, name, price, image, category FROM foods ORDER BY category, id', (error, rows) => {
    if (error) {
      console.error('Database query failed:', error);
      return res.status(500).json({ error: 'Unable to load foods' });
    }
    res.json(rows);
  });
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header.' });
  }

  const token = authHeader.slice(7);
  jwt.verify(token, JWT_SECRET, (error, payload) => {
    if (error) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }
    req.user = payload;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

app.post('/api/checkout', authenticateToken, (req, res) => {
  const { cart } = req.body;
  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  const orderItems = cart.map((item) => ({
    foodId: Number(item.id),
    name: String(item.name || ''),
    price: Number(item.price),
    quantity: Number(item.quantity),
  }));

  if (orderItems.some((item) => !item.foodId || !item.name || item.price <= 0 || item.quantity <= 0)) {
    return res.status(400).json({ error: 'Invalid cart item data.' });
  }

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  db.get('SELECT id FROM users WHERE username = ?', [req.user.username], (error, userRow) => {
    if (error) {
      console.error('Database query failed:', error);
      return res.status(500).json({ error: 'Unable to checkout.' });
    }

    if (!userRow) {
      return res.status(401).json({ error: 'Unable to identify user.' });
    }

    const createdAt = new Date().toISOString();
    db.run(
      'INSERT INTO orders (userId, createdAt, total) VALUES (?, ?, ?)',
      [userRow.id, createdAt, total],
      function (insertError) {
        if (insertError) {
          console.error('Failed to create order:', insertError);
          return res.status(500).json({ error: 'Unable to checkout.' });
        }

        const orderId = this.lastID;
        const itemStmt = db.prepare(
          'INSERT INTO order_items (orderId, foodId, name, price, quantity) VALUES (?, ?, ?, ?, ?)'
        );

        orderItems.forEach((item) => {
          itemStmt.run(orderId, item.foodId, item.name, item.price, item.quantity);
        });

        itemStmt.finalize((finalizeError) => {
          if (finalizeError) {
            console.error('Failed to save order items:', finalizeError);
            return res.status(500).json({ error: 'Unable to checkout.' });
          }

          res.status(201).json({ orderId });
        });
      }
    );
  });
});

app.get('/api/admin/orders', authenticateToken, requireAdmin, (req, res) => {
  const query = `
    SELECT orders.id AS orderId,
      orders.createdAt,
      orders.total,
      users.username,
      order_items.foodId,
      order_items.name,
      order_items.price,
      order_items.quantity
    FROM orders
    JOIN users ON users.id = orders.userId
    JOIN order_items ON order_items.orderId = orders.id
    ORDER BY orders.createdAt DESC, order_items.id
  `;

  db.all(query, (error, rows) => {
    if (error) {
      console.error('Failed to load admin orders:', error);
      return res.status(500).json({ error: 'Unable to load orders.' });
    }

    const orders = [];
    rows.forEach((row) => {
      let order = orders.find((item) => item.orderId === row.orderId);
      if (!order) {
        order = {
          orderId: row.orderId,
          username: row.username,
          createdAt: row.createdAt,
          total: row.total,
          items: [],
        };
        orders.push(order);
      }

      order.items.push({
        foodId: row.foodId,
        name: row.name,
        price: row.price,
        quantity: row.quantity,
      });
    });

    res.json({ orders });
  });
});

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const trimmedUsername = username.trim();
  bcrypt.hash(password, 10, (hashError, passwordHash) => {
    if (hashError) {
      console.error('Password hashing failed:', hashError);
      return res.status(500).json({ error: 'Unable to register user.' });
    }

    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    stmt.run(trimmedUsername, passwordHash, function (error) {
      if (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
          return res.status(409).json({ error: 'Username already exists.' });
        }
        console.error('Database insert failed:', error);
        return res.status(500).json({ error: 'Unable to register user.' });
      }

      const token = jwt.sign({ username: trimmedUsername, isAdmin: false }, JWT_SECRET, { expiresIn: '2h' });
      res.status(201).json({ username: trimmedUsername, token, isAdmin: false });
    });
    stmt.finalize();
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const trimmedUsername = username.trim();
  db.get('SELECT password, isAdmin FROM users WHERE username = ?', [trimmedUsername], (error, row) => {
    if (error) {
      console.error('Database query failed:', error);
      return res.status(500).json({ error: 'Unable to login.' });
    }

    if (!row) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const storedPassword = row.password;
    const isAdminFlag = !!row.isAdmin;

    const sendToken = () => {
      const token = jwt.sign({ username: trimmedUsername, isAdmin: isAdminFlag }, JWT_SECRET, { expiresIn: '2h' });
      res.json({ username: trimmedUsername, token, isAdmin: isAdminFlag });
    };

    if (/^\$2[aby]\$/.test(storedPassword)) {
      bcrypt.compare(password, storedPassword, (compareError, isMatch) => {
        if (compareError) {
          console.error('Password comparison failed:', compareError);
          return res.status(500).json({ error: 'Unable to login.' });
        }

        if (!isMatch) {
          return res.status(401).json({ error: 'Invalid username or password.' });
        }

        sendToken();
      });
    } else {
      if (password !== storedPassword) {
        return res.status(401).json({ error: 'Invalid username or password.' });
      }

      bcrypt.hash(password, 10, (hashError, passwordHash) => {
        if (hashError) {
          console.error('Password hashing failed during upgrade:', hashError);
          sendToken();
          return;
        }

        db.run('UPDATE users SET password = ? WHERE username = ?', [passwordHash, trimmedUsername], (updateError) => {
          if (updateError) {
            console.error('Failed to upgrade password hash:', updateError);
          }
          sendToken();
        });
      });
    }
  });
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicRoot, 'Shoppingcart.html'));
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
  console.log('Serving frontend from', publicRoot);
});
