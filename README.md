Welcome to API-Integration-Keycloak

Because of i don't have the frond-end yet, please use keycloak theme front-end; that can be acces on: 
```
http://localhost:8080/realms/tests-dev/protocol/openid-connect/auth?response_type=code&client_id=<client_name>&redirect_uri=http://<web-origin-client>/callback&scope=openid%20profile%20email
```

When already log-in using url above, copy the code to on the redirect link and paste it on API Login request body.
example: 
``http://<web-origin-client>/callback?session_state=b7eb21de-f6b8-4a9a-ab69-e14eb711020a&iss=http%3A%2F%2Flocalhost%3A8080%2Frealms%2Ftests-dev&code=eb3e69b2-050e-438b-b5d2-0ecc146a7896.b7eb21de-f6b8-4a9a-ab69-e14eb711020a.034727a5-5f3f-4748-9419-fd171073558d``

``code=eb3e69b2-050e-438b-b5d2-0ecc146a7896.b7eb21de-f6b8-4a9a-ab69-e14eb711020a.034727a5-5f3f-4748-9419-fd171073558d``
