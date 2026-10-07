const bcrypt = require('bcryptjs');
const { randomUUID, randomBytes } = require('node:crypto');
const { User, Session, sequelize } = require('../models');
const {
    createAccessToken,
    createRefreshCredential,
    expiryDate,
    hashesMatch,
    parseRefreshCredential,
} = require('../security/tokens');

const BCRYPT_COST = 12;
const MAX_PASSWORD_BYTES = 72;
const MIN_PASSWORD_LENGTH = 8;
const dummyPasswordHash = bcrypt.hash(randomBytes(32).toString('hex'), BCRYPT_COST);

function normalizedEmail(value) {
    return typeof value === 'string' ? value.trim().normalize('NFKC').toLowerCase() : '';
}

function validEmail(email) {
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function safeUser(user) {
    return {
        id: user.id,
        nome: user.nome,
        email: user.email,
    };
}

function authPayload(user, sessionId, refreshCredential) {
    return {
        accessToken: createAccessToken(user.id, sessionId),
        refreshToken: refreshCredential,
        user: safeUser(user),
    };
}

async function createSession(user, transaction) {
    const sessionId = randomUUID();
    const refresh = createRefreshCredential(sessionId);

    await Session.create({
        id: sessionId,
        userId: user.id,
        refreshTokenHash: refresh.hash,
        expiresAt: expiryDate(),
    }, { transaction });

    return authPayload(user, sessionId, refresh.credential);
}

function isValidPassword(password) {
    return typeof password === 'string' &&
        password.length >= MIN_PASSWORD_LENGTH &&
        Buffer.byteLength(password, 'utf8') <= MAX_PASSWORD_BYTES;
}

async function register(req, res) {
    const { nome, email: rawEmail, senha, aceite_termos } = req.body || {};
    const email = normalizedEmail(rawEmail);
    const name = typeof nome === 'string' ? nome.trim() : '';

    if (
        name.length < 2 ||
        name.length > 100 ||
        /[\u0000-\u001f\u007f]/.test(name) ||
        !validEmail(email) ||
        !isValidPassword(senha) ||
        aceite_termos !== true
    ) {
        return res.status(400).json({
            message: 'Informe um nome e email válidos, uma senha de pelo menos 8 caracteres e aceite os termos.',
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(senha, BCRYPT_COST);
        const response = await sequelize.transaction(async (transaction) => {
            const user = await User.create({
                nome: name,
                email,
                senha: hashedPassword,
                aceite_termos: true,
            }, { transaction });

            return createSession(user, transaction);
        });

        return res.status(201).json(response);
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Este email já está cadastrado.' });
        }

        console.error('Falha ao cadastrar usuário:', error.name || 'Error');
        return res.status(500).json({ message: 'Não foi possível concluir o cadastro.' });
    }
}

async function login(req, res) {
    const { email: rawEmail, senha } = req.body || {};
    const email = normalizedEmail(rawEmail);

    if (!validEmail(email) || typeof senha !== 'string' || senha.length === 0) {
        return res.status(400).json({ message: 'Informe email e senha.' });
    }

    try {
        const user = await User.findOne({ where: { email } });
        const passwordIsTooLong = Buffer.byteLength(senha, 'utf8') > MAX_PASSWORD_BYTES;
        const passwordForComparison = passwordIsTooLong
            ? senha.slice(0, MAX_PASSWORD_BYTES)
            : senha;
        const passwordMatches = await bcrypt.compare(
            passwordForComparison,
            user && !passwordIsTooLong ? user.senha : await dummyPasswordHash
        );

        if (!user || !passwordMatches || passwordIsTooLong) {
            return res.status(401).json({ message: 'Email ou senha inválidos.' });
        }

        const response = await sequelize.transaction((transaction) => createSession(user, transaction));
        return res.status(200).json(response);
    } catch (error) {
        console.error('Falha ao autenticar usuário:', error.name || 'Error');
        return res.status(500).json({ message: 'Não foi possível entrar agora.' });
    }
}

async function refresh(req, res) {
    const credential = parseRefreshCredential(req.body && req.body.refreshToken);

    if (!credential) {
        return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
    }

    try {
        const response = await sequelize.transaction(async (transaction) => {
            const session = await Session.findByPk(credential.sessionId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!session || session.revokedAt || session.expiresAt <= new Date()) {
                return null;
            }

            if (!hashesMatch(session.refreshTokenHash, credential.hash)) {
                await session.update({ revokedAt: new Date() }, { transaction });
                return null;
            }

            const user = await User.findByPk(session.userId, { transaction });

            if (!user) {
                await session.update({ revokedAt: new Date() }, { transaction });
                return null;
            }

            const rotatedCredential = createRefreshCredential(session.id);
            await session.update({ refreshTokenHash: rotatedCredential.hash }, { transaction });

            return authPayload(user, session.id, rotatedCredential.credential);
        });

        if (!response) {
            return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error('Falha ao renovar sessão:', error.name || 'Error');
        return res.status(500).json({ message: 'Não foi possível renovar a sessão.' });
    }
}

async function logout(req, res) {
    const credential = parseRefreshCredential(req.body && req.body.refreshToken);

    if (!credential) return res.status(204).end();

    try {
        await sequelize.transaction(async (transaction) => {
            const session = await Session.findByPk(credential.sessionId, {
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (session && !session.revokedAt && hashesMatch(session.refreshTokenHash, credential.hash)) {
                await session.update({ revokedAt: new Date() }, { transaction });
            }
        });
    } catch (error) {
        console.error('Falha ao encerrar sessão:', error.name || 'Error');
        return res.status(500).json({ message: 'Não foi possível confirmar o logout no servidor.' });
    }

    return res.status(204).end();
}

function me(req, res) {
    return res.status(200).json({ user: safeUser(req.user) });
}

module.exports = {
    login,
    logout,
    me,
    refresh,
    register,
};
