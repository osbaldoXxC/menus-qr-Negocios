const http = require('http');

function request(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 4000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let response = '';
        res.on('data', (chunk) => (response += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body: response }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  try {
    const register = await request('/api/auth/register', {
      nombre_negocio: 'TestRestLogin',
      email: 'testrestlogin@example.com',
      password: 'Secret123',
      plan: 'basico',
    });
    console.log('REGISTER', register);
    const login = await request('/api/auth/login', {
      email: 'testrestlogin@example.com',
      password: 'Secret123',
    });
    console.log('LOGIN', login);
  } catch (err) {
    console.error('ERR', err);
  }
})();