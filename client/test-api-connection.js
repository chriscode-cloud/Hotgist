/**
 * Simple API Connection Test
 * 
 * This script tests the connection to the HotGist API server
 * to help diagnose issues with web vs. mobile connectivity.
 */

// Simple function to test API connection
async function testApiConnection() {
  try {
    console.log('🔍 Testing API connection...');
    
    // Import config to get the API URL
    const config = require('./config');
    console.log('🔧 API Base URL:', config.default.API_BASE_URL);
    
    // Test a simple endpoint
    const testUrl = `${config.default.API_BASE_URL}/health`;
    console.log('📡 Testing URL:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📊 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Connection successful!');
      console.log('📄 Response data:', data);
      return true;
    } else {
      console.error('❌ API Connection failed with status:', response.status);
      const errorText = await response.text();
      console.error('📄 Error response:', errorText);
      return false;
    }
  } catch (error) {
    console.error('💥 API Connection error:', error.message);
    console.error('🔧 Error details:', error);
    return false;
  }
}

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.testApiConnection = testApiConnection;
  console.log('🧪 API connection test function is available as window.testApiConnection()');
} else if (require.main === module) {
  // Node.js environment
  testApiConnection();
}

module.exports = { testApiConnection };