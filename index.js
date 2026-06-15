const express = require('express');
const cors = require('cors');
require('dotenv').config();
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`
        <body style="
            background:black;
            color:white;
            display:flex;
            justify-content:center;
            align-items:center;
            height:100vh;
            font-size:40px;">
            API Abarrotes funcionando
        </body>
    `);
});

const PORT = process.env.PORT || 3000;

// Crear tabla products
db.query(`
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL,
    category VARCHAR(50),
    status VARCHAR(20),
    imageBase64 LONGTEXT,
    storeId VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`, (err) => {
    if (err) {
        console.log("Error creando products:", err);
    } else {
        console.log("Tabla products creada");
    }
});

// Crear tabla users
db.query(`
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    userType VARCHAR(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`, (err) => {
    if (err) {
        console.log("Error creando users:", err);
    } else {
        console.log("Tabla users creada");
    }
});

// Crear tabla orders
db.query(`
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT,
    productName VARCHAR(100),
    quantity INT,
    total DECIMAL(10,2),
    status VARCHAR(20),
    storeId VARCHAR(100),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`, (err) => {
    if (err) {
        console.log("Error creando orders:", err);
    } else {
        console.log("Tabla orders creada");
    }
});

db.query(`ALTER TABLE orders ADD COLUMN productName VARCHAR(100)`, (err) => {
    if (err) console.log("productName ya existe o error:", err.message);
});

db.query(`ALTER TABLE orders ADD COLUMN quantity INT`, (err) => {
    if (err) console.log("quantity ya existe o error:", err.message);
});

db.query(`ALTER TABLE orders ADD COLUMN status VARCHAR(20)`, (err) => {
    if (err) console.log("status ya existe o error:", err.message);
});

db.query(`ALTER TABLE orders ADD COLUMN storeId VARCHAR(100)`, (err) => {
    if (err) console.log("storeId ya existe o error:", err.message);
});

// Obtener productos
app.get('/products', (req, res) => {
});


// Agregar producto
app.post('/products', (req, res) => {
    const { name, price, stock, category, status, imageBase64, storeId } = req.body;

    db.query(
        'INSERT INTO products (name, price, stock, category, status, imageBase64, storeId) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, price, stock, category, status, imageBase64, storeId],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Producto registrado', id: result.insertId });
        }
    );
});

// Obtener usuarios
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Registrar usuario
app.post('/users', (req, res) => {
    const { name, email, password, userType } = req.body;

    db.query(
        'INSERT INTO users (name, email, password, userType) VALUES (?, ?, ?, ?)',
        [name, email, password, userType],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Usuario registrado', id: result.insertId });
        }
    );
});

// Obtener pedidos
app.get('/orders', (req, res) => {
    db.query('SELECT * FROM orders', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Registrar pedido
app.post('/orders', (req, res) => {
    const {
        userId,
        productName,
        quantity,
        total,
        status,
        storeId
    } = req.body;

    db.query(
        `INSERT INTO orders
        (userId, productName, quantity, total, status, storeId)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            userId,
            productName,
            quantity,
            total,
            status,
            storeId
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            res.json({
                message: 'Pedido registrado',
                id: result.insertId
            });
        }
    );
});

app.put('/orders/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id],
        (err) => {
            if (err) return res.status(500).json({ error: err });

            res.json({
                message: 'Estado del pedido actualizado'
            });
        }
    );
});

// Actualizar producto
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, stock, category, status, imageBase64 } = req.body;

    db.query(
        'UPDATE products SET name = ?, price = ?, stock = ?, category = ?, status = ?, imageBase64 = ? WHERE id = ?',
        [name, price, stock, category, status, imageBase64, id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Producto actualizado' });
        }
    );
});

// Actualizar solo stock
app.put('/products/:id/stock', (req, res) => {
    const { id } = req.params;
    const { stock } = req.body;
    const status = stock > 0 ? 'DISPONIBLE' : 'AGOTADO';

    db.query(
        'UPDATE products SET stock = ?, status = ? WHERE id = ?',
        [stock, status, id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Stock actualizado' });
        }
    );
});

// Eliminar producto
app.delete('/products/:id', (req, res) => {
    const { id } = req.params;

    db.query(
        'DELETE FROM products WHERE id = ?',
        [id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: 'Producto eliminado' });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});