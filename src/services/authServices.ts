import { GeneralErrorKey } from "@errors/general/generalErrorsKeys";
import { throwError } from "@errors/throwError";
import { UserErrorKey } from "@errors/user/userErrorsKeys";
import { getCurrentWIBDate } from "@helpers/timeHelper";
import { User } from "@models/User";
import { PrismaClient as SatriaClient } from "../../prisma/generated/satria-client";
import { buildMenuTree, deduplicateMenus } from "@helpers/utils";
import { AuthErrorKey } from "@errors/auth/authErrorsKeys";
import { getCachedAdminToken, keycloakExchangeCode, keycloakRefreshToken, keycloakRequest } from "@helpers/keycloak";
import { updateUserPasswordKeycloak } from "@models/keycloak/user_keycloak";

// Inisialisasi Prisma Client
const prisma = new SatriaClient();

const permissionFetch = async (id : any) => {
    try {
        const permission : any = await prisma.$queryRaw`
            WITH RECURSIVE user_menus AS (
                SELECT
                    mm.mm_id,
                    mm.mm_name,
                    mm.mm_url,
                    mm.mm_parent_id,
                    mm.mm_order,
                    mm.mm_icon,
                    CAST(mrd.mrd_permission AS CHAR(1000)) AS mrd_permission
                FROM mst_user u
                JOIN mst_role r ON u.mu_mr_id = r.mr_id
                JOIN mst_role_detail mrd ON r.mr_id = mrd.mrd_mr_id
                JOIN mst_menu mm ON mrd.mrd_mm_id = mm.mm_id
                WHERE u.mu_id = ${id} AND r.mr_status = '1'
            ),
            menu_ancestors AS (
                SELECT 
                    um.mm_id,
                    um.mm_name,
                    um.mm_url,
                    um.mm_parent_id,
                    um.mm_order,
                    um.mm_icon,
                    um.mrd_permission
                FROM user_menus um

                UNION ALL

                SELECT
                    mm.mm_id,
                    mm.mm_name,
                    mm.mm_url,
                    mm.mm_parent_id,
                    mm.mm_order,
                    mm.mm_icon,
                    NULL AS mrd_permission
                FROM mst_menu mm
                JOIN menu_ancestors ma ON mm.mm_id = ma.mm_parent_id
            )
            SELECT *
            FROM menu_ancestors
            ORDER BY
                CASE 
                    WHEN mm_parent_id = 0 THEN 0
                    ELSE 1
                END,
                mm_parent_id,
                mm_order;

        `

        const dedupedMenuItems = deduplicateMenus(permission);
		const menuTree = buildMenuTree(dedupedMenuItems);

        return menuTree
    } catch (err : any) {
        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR)
    }
}

export const login = async (data : any) => {
    try {
        // 🔑 Ambil token dari Keycloak
        // Password Flow
        // const keycloakTokens = await keycloakLogin(username, password);
        // if (!keycloakTokens.access_token) {
        //     throwError(AuthErrorKey.INVALID_CREDENTIALS);
        // }

        // Standart Flow
        const { code, redirectUri } = data;
        const keycloakTokens = await keycloakExchangeCode(code, redirectUri);
        if (!keycloakTokens.access_token) {
            throwError(AuthErrorKey.INVALID_CREDENTIALS);
        }
        // Decode JWT supaya bisa ambil data user
        const decoded: any = JSON.parse(
            Buffer.from(keycloakTokens.access_token.split(".")[1], "base64").toString()
        );
        console.log("Decoded Keycloak Token:", decoded);

        return {
            accessToken: keycloakTokens.access_token,
            refreshToken: keycloakTokens.refresh_token,
            expiresIn: keycloakTokens.expires_in,
            tokenType: keycloakTokens.token_type,
            user: {
                username: decoded.preferred_username,
                email: decoded.email,
                name: decoded.name,
            },
        };
        
    } catch (err : any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR)
    }
};

export const refreshToken = async (data : any) => {
    try {
        const { refreshToken } = data;
        
        const keycloakTokens = await keycloakRefreshToken(refreshToken);

        return {
            accessToken: keycloakTokens.access_token,
            refreshToken: keycloakTokens.refresh_token,
            expiresIn: keycloakTokens.expires_in,
        };
    } catch (err : any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR)
    }
};

export const changePassword = async (id: any, newPassword: string, confirmPassword: string) => {
    try {
        if (newPassword !== confirmPassword) {
            throwError(UserErrorKey.PASSWORDS_DO_NOT_MATCH);
        }

        const token = await getCachedAdminToken(); // pakai cache token
        if (!token) {
            throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR, 'Failed to obtain token');
        }

        await updateUserPasswordKeycloak(token, id, newPassword, false);

        return { success: true };
    } catch (err: any) {
        if (err?.isCustomError) {
            throw err;
        }

        console.log(err);
        throwError(GeneralErrorKey.INTERNAL_SERVER_ERROR);
    }
};