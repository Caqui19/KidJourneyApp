const express = require('express');
const { rateLimit } = require('express-rate-limit');
const authenticate = require('../middleware/authenticate');
const { login, logout, me, refresh, register } = require('../controllers/authController');

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
});

const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Muitos cadastros deste endereço. Tente novamente mais tarde.' },
});

const refreshLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Muitas tentativas de renovar a sessão.' },
});

const logoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { message: 'Muitas solicitações de logout.' },
});

router.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});

router.post('/register', registrationLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshLimiter, refresh);
router.post('/logout', logoutLimiter, logout);
router.get('/me', authenticate, me);

module.exports = router;
