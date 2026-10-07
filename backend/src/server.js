require('dotenv').config();

if (!['development', 'test', 'production'].includes(process.env.NODE_ENV)) {
    throw new Error('Defina NODE_ENV como development, test ou production.');
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const { jwtSecret } = require('./config/auth');

const app = express();
const port = Number(process.env.PORT || 3000);
const proxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
const allowedOrigins = new Set(
    (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT inválida.');
}

if (!Number.isInteger(proxyHops) || proxyHops < 0 || proxyHops > 5) {
    throw new Error('TRUST_PROXY_HOPS deve ser um número inteiro entre 0 e 5.');
}

// Force evaluation of the validated secret before accepting any requests.
void jwtSecret;

app.disable('x-powered-by');
app.set('trust proxy', proxyHops || false);
app.use(helmet());
app.use(cors({
    origin(origin, callback) {
        // Native clients do not send Origin; browser origins must be explicitly listed.
        callback(null, !origin || allowedOrigins.has(origin));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
}));
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && !req.secure) {
        return res.status(400).json({ message: 'A API exige uma conexão HTTPS.' });
    }

    return next();
});
app.use(express.json({ limit: '16kb', strict: true }));

app.get('/', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ message: 'KidJourney API disponível.' });
});

app.use('/api/auth', authRoutes);

app.use((req, res) => res.status(404).json({ message: 'Rota não encontrada.' }));

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.type === 'entity.too.large') {
        return res.status(413).json({ message: 'A solicitação é muito grande.' });
    }

    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'O corpo da solicitação é inválido.' });
    }

    console.error('Falha interna da API:', error.name || 'Error');
    return res.status(500).json({ message: 'Erro interno do servidor.' });
});

async function startServer() {
    try {
        await sequelize.authenticate();
        await sequelize.sync();

        const server = app.listen(port, '0.0.0.0', () => {
            console.log(`KidJourney API ouvindo na porta ${port}.`);
        });

        server.requestTimeout = 15000;
        server.headersTimeout = 10000;
        server.keepAliveTimeout = 5000;

        const shutdown = async () => {
            server.close(async () => {
                await sequelize.close();
                process.exit(0);
            });
        };

        process.once('SIGINT', shutdown);
        process.once('SIGTERM', shutdown);
    } catch (error) {
        console.error('Não foi possível iniciar a API:', error.name || 'Error');
        process.exitCode = 1;
    }
}

startServer();
