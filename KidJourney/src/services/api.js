import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const SESSION_STORAGE_KEY = 'kidjourney.auth.session.v1';
const API_URL = (process.env.EXPO_PUBLIC_API_URL || '').replace(/\/$/, '');

let currentSession = null;
let webSession = null;
let refreshPromise = null;
let onSessionExpired = () => {};

export class ApiError extends Error {
    constructor(message, status = null, kind = 'response') {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.kind = kind;
    }
}

function apiBaseUrl() {
    if (!API_URL) {
        throw new ApiError(
            'Configure EXPO_PUBLIC_API_URL no app para conectar ao servidor.',
            null,
            'configuration'
        );
    }

    const isDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;

    if (!isDevelopment && !API_URL.startsWith('https://')) {
        throw new ApiError('A versão publicada exige uma API com HTTPS.', null, 'configuration');
    }

    return API_URL;
}

function validSession(value) {
    return Boolean(
        value &&
        typeof value.accessToken === 'string' &&
        typeof value.refreshToken === 'string' &&
        value.user &&
        typeof value.user.id === 'number' &&
        typeof value.user.nome === 'string' &&
        typeof value.user.email === 'string'
    );
}

async function readStoredSession() {
    if (Platform.OS === 'web') return webSession;

    const serialized = await SecureStore.getItemAsync(SESSION_STORAGE_KEY);
    if (!serialized) return null;

    try {
        const session = JSON.parse(serialized);
        return validSession(session) ? session : null;
    } catch {
        return null;
    }
}

async function saveSession(session) {
    if (!validSession(session)) {
        throw new ApiError('O servidor retornou uma sessão inválida.', null, 'response');
    }

    if (Platform.OS === 'web') {
        webSession = session;
    } else {
        await SecureStore.setItemAsync(SESSION_STORAGE_KEY, JSON.stringify(session), {
            keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    }

    currentSession = session;
}

async function clearStoredSession() {
    currentSession = null;
    webSession = null;

    if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(SESSION_STORAGE_KEY);
    }
}

function setSessionExpiredHandler(handler) {
    onSessionExpired = typeof handler === 'function' ? handler : () => {};
    return () => {
        onSessionExpired = () => {};
    };
}

async function sendRequest(path, { method = 'GET', body, accessToken } = {}) {
    let baseUrl;

    try {
        baseUrl = apiBaseUrl();
    } catch (error) {
        throw error;
    }

    const headers = { Accept: 'application/json' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(`${baseUrl}/api/auth${path}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: controller.signal,
        });

        const responseText = await response.text();
        let data = {};

        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch {
                throw new ApiError('O servidor retornou uma resposta inválida.', response.status);
            }
        }

        if (!response.ok) {
            throw new ApiError(
                data.message || 'Não foi possível concluir a solicitação.',
                response.status
            );
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (error && error.name === 'AbortError') {
            throw new ApiError('A conexão demorou demais. Tente novamente.', null, 'network');
        }

        throw new ApiError('Não foi possível conectar ao servidor.', null, 'network');
    } finally {
        clearTimeout(timeoutId);
    }
}

async function rotateRefreshToken() {
    if (!currentSession || !currentSession.refreshToken) {
        throw new ApiError('Sessão inválida ou expirada.', 401);
    }

    if (!refreshPromise) {
        refreshPromise = (async () => {
            const refreshed = await sendRequest('/refresh', {
                method: 'POST',
                body: { refreshToken: currentSession.refreshToken },
            });
            await saveSession(refreshed);
            return refreshed;
        })();
    }

    try {
        return await refreshPromise;
    } finally {
        refreshPromise = null;
    }
}

async function expireLocalSession() {
    try {
        await clearStoredSession();
    } finally {
        onSessionExpired();
    }
}

async function authenticatedRequest(path, options = {}) {
    if (!currentSession) {
        throw new ApiError('Entre novamente para continuar.', 401);
    }

    try {
        return await sendRequest(path, { ...options, accessToken: currentSession.accessToken });
    } catch (error) {
        if (error.status !== 401) throw error;
    }

    try {
        await rotateRefreshToken();
        return await sendRequest(path, { ...options, accessToken: currentSession.accessToken });
    } catch (error) {
        if (error.status === 401) await expireLocalSession();
        throw error;
    }
}

async function startAuthenticatedSession(path, body) {
    const session = await sendRequest(path, { method: 'POST', body });
    await saveSession(session);
    return session.user;
}

export function register(nome, email, senha, aceite_termos) {
    return startAuthenticatedSession('/register', {
        nome,
        email,
        senha,
        aceite_termos,
    });
}

export function login(email, senha) {
    return startAuthenticatedSession('/login', { email, senha });
}

export async function logout() {
    const refreshToken = currentSession && currentSession.refreshToken;
    let serverRevoked = false;
    let localCleared = false;

    try {
        await clearStoredSession();
        localCleared = true;
    } catch {
        // Still revoke the server session if the device's secure store cannot be cleared.
    }

    onSessionExpired();

    if (refreshToken) {
        try {
            await sendRequest('/logout', {
                method: 'POST',
                body: { refreshToken },
            });
            serverRevoked = true;
        } catch {
            // Local logout must still work if the user is offline.
        }
    }

    return { serverRevoked, localCleared };
}

export async function restoreSession() {
    const storedSession = await readStoredSession();
    if (!storedSession) return null;

    currentSession = storedSession;

    try {
        const response = await authenticatedRequest('/me');
        return response.user;
    } catch (error) {
        if (error.status === 401) {
            await expireLocalSession();
        }
        return null;
    }
}

export { setSessionExpiredHandler };
