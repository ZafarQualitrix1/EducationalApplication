const http = require('http');

const payload = JSON.stringify({
  fullName: "Test User",
  email: "test@example.com",
  mobile: "9876543210",
  dob: "2005-01-15",
  gender: "Male",
  address: "123 Test St",
  city: "Test City",
  state: "Test State",
  pinCode: "123456",
  password: "Test@123",
  profileImage: null
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': payload.length
  }
};

const req = http.request(options, (res) => {
  console.log(`\nSTATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}\n`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('RESPONSE BODY:');
    console.log(data);
  });
});

req.on('error', (error) => {
  console.error('REQUEST ERROR:', error);
});

console.log('Sending signup request...');
req.write(payload);
req.end();
