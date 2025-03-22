const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado, token requerido' });
    }

    try {
        const tokenParts = token.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Formato de token inválido' });
        }

        const decoded = jwt.verify(tokenParts[1], process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Error en autenticación:", error);
        res.status(401).json({ error: 'Token inválido' });
    }
};

module.exports = authMiddleware;  // ✅ Asegurarse de exportarlo correctamente
