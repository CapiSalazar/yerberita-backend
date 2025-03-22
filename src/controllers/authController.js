 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
require('dotenv').config();

const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
            [name, email, hashedPassword]
        );

        res.status(201).json({ user: result.rows[0] });
    } catch (error) {
        console.error("🔥 Error en el registro:", error);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("📨 Email recibido:", email);
        console.log("🔑 Password recibida:", password);

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            console.log("❌ Usuario no encontrado");
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        const user = result.rows[0];
        console.log("📦 Usuario encontrado:", user.email);
        console.log("🔐 Hash en base de datos:", user.password);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log("🔍 ¿Contraseña coincide?", isMatch);

        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("✅ Login exitoso");

        res.json({ token });

    } catch (error) {
        console.error("🔥 Error al iniciar sesión:", error);
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
};

module.exports = { register, login };
