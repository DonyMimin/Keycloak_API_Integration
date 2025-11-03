import { keycloakRequest } from "@helpers/keycloak";
import axios from "axios";

export const fetchUserByIdKeycloak = async (token: string, id: string) => {
    const user = await keycloakRequest("GET", `/users/${id}`, token);

    if (user?.errorMessage) {
        return { error: true, ...user };
    }

    return user;
};

export const fetchUsersKeycloak = async (token: string, queryParams: any) => {
    const users = await keycloakRequest("GET", `/users`, token, {
        params: queryParams,
    });
   
    if (users?.errorMessage) {
        return { error: true, ...users };
    }

    return users;
}

export const checkSameUsernameKeycloak = async (token: string, username: string) => {
    const users = await keycloakRequest("GET", `/users`, token, {
        params: { username },
    });
    
    if (users?.errorMessage) {
        return { error: true, ...users };
    }
    
    return users;
}

export const createUserKeycloak = async (token: string, data: any) => {
    const user = await keycloakRequest("POST", `/users`, token, {
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
    
    if (user?.errorMessage) {
        return { error: true, ...user };
    }
    
    return user;
};

export const updateUserKeycloak = async (token: string, id: string, dataToUpdate: any) => {
    const result = await keycloakRequest("PUT", `/users/${id}`, token, {
        data: dataToUpdate,
    });
    
    if (result?.errorMessage) {
        return { error: true, ...result };
    }
    
    return result;
};

export const updateUserPasswordKeycloak = async (token: string, id: string, newPassword: string, temporary: boolean) => {
    const result = await keycloakRequest("PUT", `/users/${id}/reset-password`, token, {
        data: { type: "password", value: newPassword, temporary: temporary },
    });
    
    if (result?.errorMessage) {
        return { error: true, ...result };
    }
    
    return result;
};

export const disableUserKeycloak = async (token: string, id: string, updater: string) => {
    const result = await keycloakRequest("PUT", `/users/${id}`, token, {
        data: { enabled: false, updated_by: updater },
    });
    
    if (result?.errorMessage) {
        return { error: true, ...result };
    }
    
    return result;
};

export const enableUserKeycloak = async (token: string, id: string, updater: string) => {
    const result = await keycloakRequest("PUT", `/users/${id}`, token, {
        data: { enabled: true, updated_by: updater },
    });
    
    if (result?.errorMessage) {
        return { error: true, ...result };
    }
    
    return result;
};

export const deleteUserKeycloak = async (token: string, id: string) => {
    const result = await keycloakRequest("DELETE", `/users/${id}`, token);
    
    if (result?.errorMessage) {
        return { error: true, ...result };
    }
    
    return result;
};

export const generateSecretKey = async (token: string, id: string) => {
    const url = `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}/clients/${id}/client-secret`;
    const { data } = await axios.post(url, null, {
        headers: { Authorization: `Bearer ${token}` },
    });
    
    if (data?.errorMessage) {
        return { error: true, ...data };
    }
    
    return data;
};

export const fetchUserInfoKeycloak = async (accessToken: string) => {
    const userInfoUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
    const { data } = await axios.get(userInfoUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    
    if (data?.errorMessage) {
        return { error: true, ...data };
    }
    
    return data;
};