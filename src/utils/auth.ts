/**
 * Utilidades de autenticación para el panel de administración
 * Sistema basado en cookies sin necesidad de base de datos
 */

const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días en millisegundos

/**
 * Crea un hash simple de la contraseña con un secret
 */
async function hashPassword(password: string, secret: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + secret);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica si la contraseña proporcionada coincide con la contraseña del admin
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
    const adminPassword = import.meta.env.ADMIN_PASSWORD;
    if (!adminPassword) {
        console.error('ADMIN_PASSWORD no está configurado en las variables de entorno');
        return false;
    }
    return password === adminPassword;
}

/**
 * Crea un token de sesión firmado
 */
export async function createSessionToken(): Promise<string> {
    const secret = import.meta.env.SESSION_SECRET || 'default-secret-change-me';
    const timestamp = Date.now();
    const expiresAt = timestamp + SESSION_MAX_AGE;
    const payload = `admin:${timestamp}:${expiresAt}`;
    const signature = await hashPassword(payload, secret);
    return `${payload}:${signature}`;
}

/**
 * Valida un token de sesión
 */
export async function validateSessionToken(token: string): Promise<boolean> {
    if (!token) return false;

    const parts = token.split(':');
    if (parts.length !== 4) return false;

    const [user, timestamp, expiresAt, signature] = parts;

    // Verificar que el usuario sea admin
    if (user !== 'admin') return false;

    // Verificar que no haya expirado
    const now = Date.now();
    if (now > parseInt(expiresAt)) return false;

    // Verificar la firma
    const secret = import.meta.env.SESSION_SECRET || 'default-secret-change-me';
    const payload = `${user}:${timestamp}:${expiresAt}`;
    const expectedSignature = await hashPassword(payload, secret);

    return signature === expectedSignature;
}

/**
 * Extrae y valida el token de sesión desde las cookies
 */
export async function validateSessionFromCookies(cookieHeader: string | null): Promise<boolean> {
    if (!cookieHeader) return false;

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
    }, {} as Record<string, string>);

    const sessionToken = cookies[SESSION_COOKIE_NAME];
    return await validateSessionToken(sessionToken);
}

/**
 * Crea una cookie de sesión para el cliente
 */
export async function createSessionCookie(): Promise<string> {
    const token = await createSessionToken();
    const maxAge = SESSION_MAX_AGE / 1000; // convertir a segundos

    return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Strict`;
}

/**
 * Crea una cookie para eliminar la sesión (logout)
 */
export function createLogoutCookie(): string {
    return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`;
}
