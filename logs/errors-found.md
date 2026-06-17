# Errores Encontrados - MexxicanMX V3

## Registro y Autenticación
- **ID**: ERR-AUTH-001
- **URL**: http://localhost:3001/register
- **Error**: Error de CORS al intentar registrarse. 
- **Mensaje**: `Access to XMLHttpRequest at 'http://localhost:4000/api/auth/register' from origin 'http://localhost:3001' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: The 'Access-Control-Allow-Origin' header has a value 'http://localhost:3000' that is not equal to the supplied origin.`
- **Severidad**: ALTO
- **Causa**: El backend parece estar enviando una cabecera estática de Access-Control-Allow-Origin o el origen no coincide a pesar de estar en el arreglo.
