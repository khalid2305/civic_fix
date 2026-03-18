import fetch from 'node-fetch';

async function testRegister() {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Duplicate Phone User',
      email: 'unique_email@example.com',
      password: 'password123',
      phone: '1234567890' // This is the duplicate phone
    })
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Body:', JSON.stringify(data, null, 2));
}

testRegister();
