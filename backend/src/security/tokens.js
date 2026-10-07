const { createHash, randomBytes, timingSafeEqual } = require('node:crypto');
const jwt = require('jsonwebtoken');
const {
    ACCESS_TOKEN_LIFETIME,
    REFRESH_TOKEN_LIFETIME_MS,
    JWT_ISSUER,
    JWT_AUDIENCE,
    jwtSecret,
} = require('../config/auth');

function hashRefreshSecret(secret) {
    return createHash('sha256').update(secret, 'utf8').digest('hex');
}

function hashesMatch(left, right) {
    if (
        typeof left !== 'string' ||
        typeof right !== 'string' ||
        !/^[a-f0-9]{64}$/i.test(left) ||
        !/^[a-f0-9]{64}$/i.test(right)
    ) {
        return false;
    }

    return timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

function createRefreshCredential(sessionId) {
    const secret = randomBytes(32).toString('base64url');

    return {
        credential: `${sessionId}.${secret}`,
        hash: hashRefreshSecret(secret),
    };
}

function parseRefreshCredential(credential) {
    if (typeof credential !== 'string') return null;

    const match = credential.match(/^([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\.([A-Za-z0-9_-]{43})$/i);

    if (!match) return null;

    return {
        sessionId: match[1],
        hash: hashRefreshSecret(match[2]),
    };
}

function createAccessToken(userId, sessionId) {
    return jwt.sign(
        { sid: sessionId, tokenType: 'access' },
        jwtSecret,
        {
            algorithm: 'HS256',
            expiresIn: ACCESS_TOKEN_LIFETIME,
            issuer: JWT_ISSUER,
            audience: JWT_AUDIENCE,
            subject: String(userId),
        }
    );
}

function verifyAccessToken(token) {
    const claims = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        maxAge: ACCESS_TOKEN_LIFETIME,
    });

    if (
        !claims ||
        typeof claims !== 'object' ||
        claims.tokenType !== 'access' ||
        !/^\d+$/.test(claims.sub || '') ||
        typeof claims.sid !== 'string'
    ) {
        throw new jwt.JsonWebTokenError('Token inválido.');
    }

    return claims;
}

function expiryDate() {
    return new Date(Date.now() + REFRESH_TOKEN_LIFETIME_MS);
}

module.exports = {
    createAccessToken,
    createRefreshCredential,
    expiryDate,
    hashesMatch,
    parseRefreshCredential,
    verifyAccessToken,
};
