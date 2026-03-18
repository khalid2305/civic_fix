import fetch from 'node-fetch';

async function testRegisterUnique() {
  const uniqueTag = Date.now();
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Truly Unique User',
      email: `unique_${uniqueTag}@example.com`,
      password: 'password123',
      phone: `9${uniqueTag}`.slice(0, 10) // 10-digit unique phone
    })
  });

  const data = await response.json();
  console.log('Status:', response.status);
  console.log('Body:', JSON.stringify(data, null, 2));
}

testRegisterUnique();
