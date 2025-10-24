import { keycloakRequest } from "@helpers/keycloak";
import axios from "axios";

export const fetchUserByIdKeycloak = async (token: string, id: string) => {
    const user = await keycloakRequest("GET", `/users/${id}`, token);
    return user;
};

export const fetchUsersKeycloak = async (token: string, queryParams: any) => {
    const users = await keycloakRequest("GET", `/users`, token, {
        params: queryParams,
    });
    return users;
}

export const checkSameUsernameKeycloak = async (token: string, username: string) => {
    const users = await keycloakRequest("GET", `/users`, token, {
        params: { username },
    });
    return users;
}

export const createUserKeycloak = async (token: string, data: any) => {
    await keycloakRequest("POST", `/users`, token, {
        data: {
            username: data.username,
            email: data.email,
            enabled: data.status === "1",
            firstName: data.name,
            attributes: { created_by: data.creator },
            credentials: [
                {
                    type: 'password',
                    value: data.password,
                    temporary: false,
                },
            ],
        },
    });
};

export const updateUserKeycloak = async (token: string, id: string, dataToUpdate: any) => {
    await keycloakRequest("PUT", `/users/${id}`, token, {
        data: dataToUpdate,
    });
};

export const updateUserPasswordKeycloak = async (token: string, id: string, newPassword: string, temporary: boolean) => {
    await keycloakRequest("PUT", `/users/${id}/reset-password`, token, {
        data: { type: "password", value: newPassword, temporary: temporary },
    });
};

export const disableUserKeycloak = async (token: string, id: string) => {
    await keycloakRequest("PUT", `/users/${id}`, token, {
        data: { enabled: false },
    });
}

export const enableUserKeycloak = async (token: string, id: string) => {
    await keycloakRequest("PUT", `/users/${id}`, token, {
        data: { enabled: true },
    });
}

export const deleteUserKeycloak = async (token: string, id: string) => {
    await keycloakRequest("DELETE", `/users/${id}`, token);
}

export const generateSecretKey = async (token: string, id: string) => {
    const url = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${id}/client-secret`;

    const { data } = await axios.post(url, null, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return data;
};

export const fetchUserInfoKeycloak = async (accessToken: string) => {
    const userInfoUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
    const { data } = await axios.get(userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data;
};