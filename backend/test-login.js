const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'a3523110279@alumno.uttehuacan.edu.mx',
      password: 'Martinez24'
    });
    
    const token = res.data.access_token;
    
    // get restaurant info
    const infoRes = await axios.get('http://localhost:4000/api/restaurants/info', {
       headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Rest info:", infoRes.data);
    
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
run();
