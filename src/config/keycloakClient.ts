import KcAdminClient from 'keycloak-admin';

const kcAdminClient = new KcAdminClient({
  baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
  realmName: process.env.KEYCLOAK_REALM || 'tests-dev',
});

export default kcAdminClient;
