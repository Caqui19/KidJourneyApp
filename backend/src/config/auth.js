const ACCESS_TOKEN_LIFETIME = '15m';
const REFRESH_TOKEN_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
const JWT_ISSUER = 'kidjourney-api';
const JWT_AUDIENCE = 'kidjourney-app';

const jwtSecret = process.env.JWT_SECRET;

if (
    typeof jwtSecret !== 'string' ||
    jwtSecret.length < 43 ||
    /^(replace|change|example|secret|troque)/i.test(jwtSecret)
) {
    throw new Error('JWT_SECRET deve ser uma chave aleatória com pelo menos 32 bytes.');
}

module.exports = {
    ACCESS_TOKEN_LIFETIME,
    REFRESH_TOKEN_LIFETIME_MS,
    JWT_ISSUER,
    JWT_AUDIENCE,
    jwtSecret,
};
