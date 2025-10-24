import dotenv from "dotenv";
import jwt, { SignOptions, TokenExpiredError } from 'jsonwebtoken';

interface MenuItem {
    mm_id: number;
	mm_parent_id: number;
	mm_name: string;
	mm_url: string;
	mm_icon: string;
	mm_order: string;
	mm_type: string;
	mm_approval_perm?: number | null;
	mm_status: string;
    mrd_permission: string;
}
interface MenuNode {
    mm_id: number;
    mm_name: string;
    mm_url: string;
    mm_icon: string;
    mm_order: string;
    permission: string;
    children: MenuNode[];
}

// Muat file .env
dotenv.config();

// Secret key untuk JWT
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

export const getTokenFromHeader = (authHeader: string | undefined): string | null => {
    const match = authHeader?.match(/^Bearer\s(.+)$/);
    return match ? match[1] : null;
};

export const deduplicateMenus = (menuItems : MenuItem[]) => {
    const uniqueMap = new Map();

    menuItems.forEach(item => {
        if (!uniqueMap.has(item.mm_id)) {
        uniqueMap.set(item.mm_id, item);
        } else {
        // Prefer the item with permission
        const existing = uniqueMap.get(item.mm_id);
        if (!existing.permission && item.mrd_permission) {
            uniqueMap.set(item.mm_id, item);
        }
        }
    });

    return Array.from(uniqueMap.values());
}

export const buildMenuTree = (menuItems : MenuItem[], parentId = 0): MenuNode[] => {
	return menuItems
	    .filter((item : MenuItem) => item.mm_parent_id === parentId)
	    .map((item : MenuItem) => ({
            mm_id: item.mm_id,
            mm_name: item.mm_name,
            mm_url: item.mm_url,
            mm_icon: item.mm_icon,
            mm_order: item.mm_order,
            permission : item.mrd_permission,
            children: buildMenuTree(menuItems, item.mm_id)
        }
    ));
}

export const verifyToken = (token: string): object | string => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error: any) {
        if (error instanceof TokenExpiredError) {
            throw new Error("TokenExpiredError");
        } else {
            throw new Error("InvalidTokenError");
        }
    }
};

// Convert number phone format (08)
export function normalizePhoneNumberFormat(phone: string): string {
    if (!phone) return phone;
    // Trim space and strip
    let normalized = phone.replace(/[\s\-]/g, '');
    if (normalized.startsWith('+62')) {
        normalized = '0' + normalized.slice(3);
    } else if (normalized.startsWith('62')) {
        normalized = '0' + normalized.slice(2);
    }
    return normalized;
}

// Remove prefix from object keys
export function removePrefix(item: any, exceptions: string[] = []): any {
    if (Array.isArray(item)) {
        return item.map(i => removePrefix(i, exceptions));
    } else if (item instanceof Date) {
        return item; // tetap Date
    } else if (item && typeof item === 'object') {
        const newItem: Record<string, any> = {};
        for (const key in item) {
            // Cek apakah key diawali dengan salah satu exception
            const isException = exceptions.some(exc => key.startsWith(exc));

            let newKey = key;
            if (!isException) {
                const index = key.indexOf('_');
                if (index >= 0) {
                    newKey = key.slice(index + 1);
                }
            }

            newItem[newKey] = removePrefix(item[key], exceptions);
        }
        return newItem;
    } else {
        return item;
    }
}

export function getBlobNameFromUrl(url: string) {
  // URL looks like: https://account.blob.core.windows.net/container/blobName

    const parts = url.split("/");
    const secondParts =  parts.slice(4).join("/"); 

    return secondParts.split("?")[0] ?? null;
}