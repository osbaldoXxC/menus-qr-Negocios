const fetch = require('node-fetch');

async function test() {
  const token = 'FAKE_OR_IGNORE'; // I don't need a valid token to get info? Wait, yes I do if it's protected.
  // Actually, public endpoint for menu info is unprotected!
  const res = await fetch('http://localhost:3000/api/v1/restaurantes/51ad632a-403d-426e-bfb4-2d32a448bb7b/tema');
  const text = await res.text();
  console.log(text);
}
test();
