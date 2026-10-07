const { Sequelize } = require('sequelize');

const requiredDatabaseSettings = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingDatabaseSettings = requiredDatabaseSettings.filter(
    (setting) => !process.env[setting]
);

if (missingDatabaseSettings.length > 0) {
    throw new Error(`Configuração ausente: ${missingDatabaseSettings.join(', ')}`);
}

const databasePort = Number(process.env.DB_PORT || 3306);

if (!Number.isInteger(databasePort) || databasePort < 1 || databasePort > 65535) {
    throw new Error('DB_PORT inválida.');
}

if (process.env.NODE_ENV === 'production' && process.env.DB_SSL !== 'true') {
    throw new Error('DB_SSL=true é obrigatório em produção.');
}

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: databasePort,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        charset: 'utf8mb4',
        ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: true } } : {}),
    },
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
    },
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});

module.exports = sequelize;
