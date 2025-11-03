import { fetchRolesByID, insertRoleClientUser, insertRoleRealmUser } from "@models/keycloak/role_keycloak";
import axios, { AxiosRequestConfig } from "axios";

// Password Grant Flow
export const keycloakLogin = async (username: string, password: string) => {
  const tokenUrl = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const params = new URLSearchParams();
  params.append("client_id", process.env.KEYCLOAK_CLIENT_ID!);
  params.append("grant_type", "password");
  params.append("username", username);
  params.append("password", password);

  if (process.env.KEYCLOAK_CLIENT_SECRET) {
    params.append("client_secret", process.env.KEYCLOAK_CLIENT_SECRET);
  }

  const response = await axios.post(tokenUrl, params, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return response.data; // { access_token, refresh_token, expires_in, ... }
};

// Standart Flow
export const keycloakExchangeCode = async (code: string, redirectUri: string) => {
  const url = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.KEYCLOAK_CLIENT_ID_FRONT_END!,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET_FRONT_END!,
    code,
    redirect_uri: redirectUri,
  });

  const { data } = await axios.post(url, params);
  return data; // return { access_token, refresh_token, id_token, expires_in, ... }
};

// Introspect / Verify Token
export const keycloakVerifyToken = async (token: string) => {
  const url = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token/introspect`;
  const params = new URLSearchParams({
    token,
    client_id: process.env.KEYCLOAK_CLIENT_ID_FRONT_END!,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET_FRONT_END!,
  });

  const { data } = await axios.post(url, params);
  return data; // return introspection response
};

// Refresh Token
export const keycloakRefreshToken = async (refreshToken: string) => {
  const url = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: process.env.KEYCLOAK_CLIENT_ID_FRONT_END!,
    client_secret: process.env.KEYCLOAK_CLIENT_SECRET_FRONT_END!,
    refresh_token: refreshToken,
  });

  const { data } = await axios.post(url, params);
  return data; // return keycloak response (access_token, refresh_token, expires_in, etc)
};

let cachedToken: string | null = null;
let tokenExpiry = 0; // timestamp (ms)

// Get cached admin token for Keycloak admin operations
export const getCachedAdminToken = async () => {
  const now = Date.now();

  // Jika token masih valid, pakai yang lama
  console.log("Cached Token:", cachedToken, tokenExpiry, "Now:", now);
  if (cachedToken && now < tokenExpiry) {
    return cachedToken;
  }

  // Ambil token baru
  const url = `${process.env.KEYCLOAK_BASE_URL}/realms/${process.env.KEYCLOAK_REALM}/protocol/openid-connect/token`;
  const params = new URLSearchParams({
    client_id: process.env.KEYCLOAK_CLIENT_ID_BACK_END!,
    grant_type: "password",
    username: process.env.KEYCLOAK_ADMIN_USERNAME!,
    password: process.env.KEYCLOAK_ADMIN_PASSWORD!,
  });

  const { data } = await axios.post(url, params);

  cachedToken = data.access_token;
  tokenExpiry = now + (data.expires_in - 10) * 1000; // minus 10s buffer

  return cachedToken;
};


// Helper keycloak request function
export const keycloakRequest = async <T = any>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  endpoint: string,
  token: string,
  options: {
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
  } = {}
): Promise<T> => {
  const config: AxiosRequestConfig = {
    method,
    url: `${process.env.KEYCLOAK_BASE_URL}/admin/realms/${process.env.KEYCLOAK_REALM}${endpoint}`,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    params: options.params,
    data: options.data,
  };

  try {
    const response = await axios.request<T>(config);
    return response.data;
  } catch (error: any) {
    console.error("Axios Request Config:", error);
    console.error(`Keycloak API error [${method}] ${endpoint}:`, error.response?.data || error.message);
    return error.response?.data || error.message;
  }
};

export const assignRoleToUser = async (userId: string, roleId: string, token: string) => {
  const role = await fetchRolesByID(roleId, token);
  const isClientRole = role.clientRole;

  const result = isClientRole
    ? await insertRoleClientUser(userId, role.id, role.name, role.containerId, token)
    : await insertRoleRealmUser(userId, role.id, role.name, token);

  return result?.errorMessage ? result : role;
};