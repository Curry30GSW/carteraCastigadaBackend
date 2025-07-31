const axios = require('axios');
const jwt = require('jsonwebtoken');
const { validateLogin } = require('../models/loginModel');
const { registrarAuditoria } = require('../middlewares/auditoriaService');


const loginAttempts = new Map();
const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000;

const login = async (req, res) => {
    const { user, password, captcha } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    if (!captcha) {
        return res.status(400).json({ success: false, message: 'Captcha no recibido' });
    }

    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
        const captchaVerifyResponse = await axios.post(verifyURL);

        if (!captchaVerifyResponse.data.success) {
            return res.status(403).json({ success: false, message: 'Falló la verificación del CAPTCHA' });
        }

        const attempt = loginAttempts.get(user);
        if (attempt && attempt.count >= MAX_ATTEMPTS) {
            const timePassed = Date.now() - attempt.lastAttempt;
            if (timePassed < BLOCK_TIME) {
                await registrarAuditoria(user, ip, 'Cuenta bloqueada por múltiples intentos fallidos');
                const timeLeft = Math.ceil((BLOCK_TIME - timePassed) / 1000);
                return res.status(429).json({
                    success: false,
                    message: `Demasiados intentos fallidos. Intenta nuevamente en ${timeLeft} segundos.`
                });
            } else {
                loginAttempts.delete(user);
            }
        }

        const isValid = await validateLogin(user, password);

        if (isValid) {
            loginAttempts.delete(user);
            await registrarAuditoria(user, ip, 'Inicio de sesión exitoso');

            const token = jwt.sign(
                { user },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                token
            });
        } else {
            if (loginAttempts.has(user)) {
                loginAttempts.set(user, {
                    count: attempt.count + 1,
                    lastAttempt: Date.now()
                });
            } else {
                loginAttempts.set(user, {
                    count: 1,
                    lastAttempt: Date.now()
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Usuario o contraseña incorrectos'
            });
        }

    } catch (error) {
        console.error('Error en la verificación del login:', error.message);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
};

const logout = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        if (!token) {
            return res.status(400).json({ success: false, message: 'Token no proporcionado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = decoded.user;

        await registrarAuditoria(user, ip, 'Cierre de sesión');

        return res.status(200).json({ success: true, message: 'Sesión cerrada con éxito' });
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido' });
    }
};

module.exports = {
    login,
    logout
};
