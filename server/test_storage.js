import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000/api';

async function testStorage() {
  try {
    console.log('--- Logging in ---');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password123' })
    });
    const { token } = await loginRes.json();
    if (!token) throw new Error('Login failed, no token');
    console.log('Login successful');

    console.log('--- Submitting Issue ---');
    const form = new FormData();
    form.append('title', 'Storage Verification Test');
    form.append('description', 'Verified by automated script.');
    form.append('category', 'Roads & Potholes');
    form.append('latitude', '13.0827');
    form.append('longitude', '80.2707');
    
    // Use the generated dummy image
    const imagePath = 'C:\\Users\\get2k\\.gemini\\antigravity\\brain\\6b12ec8a-de28-4f21-a1ee-51dbfdfd8949\\dummy_issue_image_1773773796938.png';
    form.append('image', fs.createReadStream(imagePath));

    const submitRes = await fetch(`${BASE_URL}/issues`, {
      method: 'POST',
      headers: { ...form.getHeaders(), 'Authorization': `Bearer ${token}` },
      body: form
    });

    const issue = await submitRes.json();
    if (submitRes.ok) {
      console.log('Issue submitted successfully:', issue._id);
      
      console.log('--- Verifying Storage ---');
      const verifyRes = await fetch(`${BASE_URL}/issues/${issue._id}`);
      const verifiedIssue = await verifyRes.json();
      if (verifyRes.ok && verifiedIssue.title === 'Storage Verification Test') {
        console.log('STORAGE VERIFIED: Issue found in database with correct details.');
      } else {
        console.log('STORAGE VERIFICATION FAILED');
      }
    } else {
      console.log('Submission failed:', issue);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testStorage();
