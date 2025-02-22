import { Request } from "express";

const PUBLIC_ROUTES: { method: string; path: string }[] = [
    { method: "POST", path: "/api/user/login" },
    { method: "POST", path: "/api/user/register" },
    { method: "POST", path: "/api/user/verify-email" },
    { method: "GET", path: "/api/user/check-reset-password-link" },
    { method: "POST", path: "/api/user/reset-password" },
    { method: "GET", path: "/api/user/refresh-token" },
    { method: "POST", path: "/api/user/logout" },
];

/**
 * Determines if a given request is for a public route.
 * @param req - The express request object.
 * @returns A boolean indicating whether the request matches any of the defined public routes.
 */
export const isPublic = (req: Request): boolean => {
    return PUBLIC_ROUTES.some(
        (request) => request.method === req.method && request.path === req.path
    );
};
