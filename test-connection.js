// Test API Connection Script
// Run with: node test-connection.js

const axios = require('axios');

const API_URL = 'http://localhost:8080';

async function testConnection() {
  console.log('🔍 Testing API Connection...\n');

  // Test 1: Check if API is reachable
  console.log('Test 1: Checking if API server is running...');
  try {
    const response = await axios.get(`${API_URL}/api/client`);
    console.log('✅ API server is running!');
    console.log('📊 Response Status:', response.status);
    console.log('📦 Response Structure:', {
      success: response.data.success,
      hasData: !!response.data.data,
      dataType: Array.isArray(response.data.data) ? 'array' : typeof response.data.data,
      dataLength: Array.isArray(response.data.data) ? response.data.data.length : 'N/A'
    });
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('✅ Found', response.data.data.length, 'client(s)');
      console.log('📝 Sample Client:', {
        name: response.data.data[0].name,
        email: response.data.data[0].email,
        hasLicense: !!response.data.data[0].license,
        isActive: response.data.data[0].isLicenseActive
      });
    } else {
      console.log('⚠️  No clients found in database');
      console.log('💡 Tip: Add a test client using the form or API');
    }
  } catch (error) {
    console.error('❌ Failed to connect to API');
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 Make sure the API server is running on port 8080');
      console.error('   Run: cd real-estate-apis && npm run dev');
    } else if (error.response) {
      console.error('📛 Error Response:', error.response.status, error.response.data);
    } else {
      console.error('📛 Error:', error.message);
    }
    return;
  }

  console.log('\n---\n');

  // Test 2: Create a test client
  console.log('Test 2: Testing client creation...');
  const testClient = {
    name: 'Test Client ' + Date.now(),
    email: `test${Date.now()}@example.com`,
    phoneNumber: 9876543210,
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '123 Test Street',
    licenseDays: 365
  };

  try {
    const response = await axios.post(`${API_URL}/api/client`, testClient);
    console.log('✅ Client created successfully!');
    console.log('📝 Created Client ID:', response.data.data._id);
    console.log('📧 Email:', response.data.data.email);
    
    // Clean up - delete the test client
    console.log('\n🧹 Cleaning up test data...');
    await axios.delete(`${API_URL}/api/client?id=${response.data.data._id}`);
    console.log('✅ Test client deleted');
  } catch (error) {
    console.error('❌ Failed to create test client');
    if (error.response) {
      console.error('📛 Error:', error.response.data);
    } else {
      console.error('📛 Error:', error.message);
    }
  }

  console.log('\n---\n');
  console.log('✅ Connection test complete!');
  console.log('\n💡 Next steps:');
  console.log('   1. Make sure both servers are running');
  console.log('   2. Open http://localhost:8000 in your browser');
  console.log('   3. Check browser console for any errors');
}

testConnection();
