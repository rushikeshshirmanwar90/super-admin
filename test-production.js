// Test Production API Connection
// Run with: node test-production.js

const https = require('https');

const API_URL = 'https://xsite.tech';

console.log('🔍 Testing Production API Connection...\n');
console.log('📍 API URL:', API_URL);
console.log('---\n');

// Test 1: Check if API is reachable
console.log('Test 1: Checking API accessibility...');

const options = {
  hostname: 'xsite.tech',
  port: 443,
  path: '/api/client',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
};

const req = https.request(options, (res) => {
  console.log('✅ API is reachable!');
  console.log('📊 Status Code:', res.statusCode);
  console.log('📋 Headers:', JSON.stringify(res.headers, null, 2));
  
  // Check CORS headers
  if (res.headers['access-control-allow-origin']) {
    console.log('✅ CORS headers present');
    console.log('   Allow-Origin:', res.headers['access-control-allow-origin']);
  } else {
    console.log('⚠️  CORS headers NOT found');
    console.log('   This may cause issues with cross-origin requests');
  }
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('\n📦 Response Structure:');
      console.log('   Success:', jsonData.success);
      console.log('   Has Data:', !!jsonData.data);
      console.log('   Data Type:', Array.isArray(jsonData.data) ? 'array' : typeof jsonData.data);
      
      if (Array.isArray(jsonData.data)) {
        console.log('   Data Length:', jsonData.data.length);
        
        if (jsonData.data.length > 0) {
          console.log('\n✅ Found', jsonData.data.length, 'client(s)');
          console.log('\n📝 Sample Client:');
          console.log('   Name:', jsonData.data[0].name);
          console.log('   Email:', jsonData.data[0].email);
          console.log('   City:', jsonData.data[0].city);
          console.log('   License Active:', jsonData.data[0].isLicenseActive);
        } else {
          console.log('\n⚠️  No clients found in database');
        }
      }
      
      console.log('\n✅ API is working correctly!');
      console.log('\n💡 Next steps:');
      console.log('   1. Update .env.local: NEXT_PUBLIC_API_URL=https://xsite.tech');
      console.log('   2. Restart super-admin dev server');
      console.log('   3. Open http://localhost:8000');
      
    } catch (error) {
      console.error('❌ Failed to parse JSON response');
      console.error('   Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Failed to connect to API');
  console.error('   Error:', error.message);
  
  if (error.code === 'ENOTFOUND') {
    console.error('\n💡 DNS resolution failed');
    console.error('   - Check if xsite.tech is accessible');
    console.error('   - Verify your internet connection');
  } else if (error.code === 'ECONNREFUSED') {
    console.error('\n💡 Connection refused');
    console.error('   - API server may be down');
    console.error('   - Check if the domain is correct');
  } else if (error.code === 'ETIMEDOUT') {
    console.error('\n💡 Connection timeout');
    console.error('   - Server is not responding');
    console.error('   - Check your internet connection');
  }
  
  console.error('\n📝 Troubleshooting:');
  console.error('   1. Test in browser: https://xsite.tech/api/client');
  console.error('   2. Check if API is deployed');
  console.error('   3. Verify SSL certificate is valid');
});

req.end();
