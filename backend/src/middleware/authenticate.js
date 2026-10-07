const { Op } = require('sequelize');
const { User, Session } = require('../models');
const { verifyAccessToken } = require('../security/tokens');

async function authenticate(req, res, next) {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer ([^\s]+)$/i);

    if (!match) {
        return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
    }

    try {
        const claims = verifyAccessToken(match[1]);
        const session = await Session.findOne({
            where: {
                id: claims.sid,
                userId: Number(claims.sub),
                revokedAt: null,
                expiresAt: { [Op.gt]: new Date() },
            },
        });

        if (!session) {
            return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
        }

        const user = await User.findByPk(session.userId, {
            attributes: ['id', 'nome', 'email'],
        });

        if (!user) {
            return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
        }

        req.user = user;
        req.sessionId = session.id;
        return next();
    } catch (error) {
        if (error.name !== 'JsonWebTokenError' && error.name !== 'TokenExpiredError') {
            console.error('Falha ao validar sessão:', error.name || 'Error');
            return res.status(500).json({ message: 'Não foi possível validar a sessão.' });
        }

        return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
    }
}

module.exports = authenticate;
