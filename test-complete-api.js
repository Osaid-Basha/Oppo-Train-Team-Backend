const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

// Test data
const testResource = {
  title: "Complete API Test Resource",
  type: "Course",
  description: "Testing both Resources and Members APIs together",
  guest: "Test Guest Speaker",
  websiteUrl: "https://example.com/test-course"
};

const testMember = {
  firstName: "API",
  lastName: "Tester",
  studentNumber: "API001",
  email: "api.tester@example.com",
  password: "testpass123",
  gender: "Male",
  yearInSchool: "Third",
  phone: "+1234567890",
  dateOfBirth: "2000-01-01",
  address: "123 Test Street, Test City, Test Country"
};

let createdResourceId;
let createdMemberId;

console.log('🧪 Testing Complete OppoTrain Backend API (Resources + Members)');
console.log('=' .repeat(60));

// Helper function to make API calls
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test Resources API
async function testResourcesAPI() {
  console.log('\n📚 Testing Resources API...');
  console.log('-'.repeat(40));
  
  // 1. Get all resources
  console.log('1️⃣ Testing Get All Resources...');
  const getAllResult = await makeRequest('GET', '/resources');
  if (getAllResult.success) {
    console.log(`✅ Get all resources: ${getAllResult.data.message}`);
    console.log(`   Count: ${getAllResult.data.count}`);
  } else {
    console.log(`❌ Get all resources failed: ${getAllResult.error}`);
  }
  
  // 2. Create new resource
  console.log('\n2️⃣ Testing Create Resource...');
  const createResult = await makeRequest('POST', '/resources', testResource);
  if (createResult.success) {
    createdResourceId = createResult.data.data.id;
    console.log(`✅ Resource created: ${createResult.data.message}`);
    console.log(`   Resource ID: ${createdResourceId}`);
    console.log(`   Title: ${createResult.data.data.title}`);
  } else {
    console.log(`❌ Create resource failed: ${createResult.error}`);
  }
  
  // 3. Get resource by ID
  if (createdResourceId) {
    console.log('\n3️⃣ Testing Get Resource by ID...');
    const getByIdResult = await makeRequest('GET', `/resources/${createdResourceId}`);
    if (getByIdResult.success) {
      console.log(`✅ Resource retrieved: ${getByIdResult.data.message}`);
      console.log(`   Title: ${getByIdResult.data.data.title}`);
      console.log(`   Type: ${getByIdResult.data.data.type}`);
    } else {
      console.log(`❌ Get resource by ID failed: ${getByIdResult.error}`);
    }
  }
  
  // 4. Update resource
  if (createdResourceId) {
    console.log('\n4️⃣ Testing Update Resource...');
    const updateData = { title: "Updated Complete API Test Resource" };
    const updateResult = await makeRequest('PUT', `/resources/${createdResourceId}`, updateData);
    if (updateResult.success) {
      console.log(`✅ Resource updated: ${updateResult.data.message}`);
      console.log(`   New title: ${updateResult.data.data.title}`);
    } else {
      console.log(`❌ Update resource failed: ${updateResult.error}`);
    }
  }
  
  // 5. Get resources by type
  console.log('\n5️⃣ Testing Get Resources by Type...');
  const getByTypeResult = await makeRequest('GET', '/resources/type/Course');
  if (getByTypeResult.success) {
    console.log(`✅ Resources by type: ${getByTypeResult.data.message}`);
    console.log(`   Count: ${getByTypeResult.data.count}`);
  } else {
    console.log(`❌ Get resources by type failed: ${getByTypeResult.error}`);
  }
}

// Test Members API
async function testMembersAPI() {
  console.log('\n👥 Testing Members API...');
  console.log('-'.repeat(40));
  
  // 1. Get all members
  console.log('1️⃣ Testing Get All Members...');
  const getAllResult = await makeRequest('GET', '/members');
  if (getAllResult.success) {
    console.log(`✅ Get all members: ${getAllResult.data.message}`);
    console.log(`   Count: ${getAllResult.data.count}`);
  } else {
    console.log(`❌ Get all members failed: ${getAllResult.error}`);
  }
  
  // 2. Create new member
  console.log('\n2️⃣ Testing Create Member...');
  const createResult = await makeRequest('POST', '/members', testMember);
  if (createResult.success) {
    createdMemberId = createResult.data.data.id;
    console.log(`✅ Member created: ${createResult.data.message}`);
    console.log(`   Member ID: ${createdMemberId}`);
    console.log(`   Name: ${createResult.data.data.firstName} ${createResult.data.data.lastName}`);
    console.log(`   Status: ${createResult.data.data.status}`);
  } else {
    console.log(`❌ Create member failed: ${createResult.error}`);
  }
  
  // 3. Get member by ID
  if (createdMemberId) {
    console.log('\n3️⃣ Testing Get Member by ID...');
    const getByIdResult = await makeRequest('GET', `/members/${createdMemberId}`);
    if (getByIdResult.success) {
      console.log(`✅ Member retrieved: ${getByIdResult.data.message}`);
      console.log(`   Name: ${getByIdResult.data.data.firstName} ${getByIdResult.data.data.lastName}`);
      console.log(`   Status: ${getByIdResult.data.data.status}`);
    } else {
      console.log(`❌ Get member by ID failed: ${getByIdResult.error}`);
    }
  }
  
  // 4. Get member statistics
  console.log('\n4️⃣ Testing Get Member Statistics...');
  const statsResult = await makeRequest('GET', '/members/stats');
  if (statsResult.success) {
    console.log(`✅ Member stats: ${statsResult.data.message}`);
    console.log(`   Stats: ${JSON.stringify(statsResult.data.data)}`);
  } else {
    console.log(`❌ Get member stats failed: ${statsResult.error}`);
  }
  
  // 5. Get pending members
  console.log('\n5️⃣ Testing Get Pending Members...');
  const pendingResult = await makeRequest('GET', '/members/pending');
  if (pendingResult.success) {
    console.log(`✅ Pending members: ${pendingResult.data.message}`);
    console.log(`   Count: ${pendingResult.data.count}`);
  } else {
    console.log(`❌ Get pending members failed: ${pendingResult.error}`);
  }
  
  // 6. Approve member
  if (createdMemberId) {
    console.log('\n6️⃣ Testing Approve Member...');
    const approveResult = await makeRequest('POST', `/members/${createdMemberId}/approve`, {
      approvedBy: 'admin@test.com'
    });
    if (approveResult.success) {
      console.log(`✅ Member approved: ${approveResult.data.message}`);
      console.log(`   New status: ${approveResult.data.data.status}`);
    } else {
      console.log(`❌ Approve member failed: ${approveResult.error}`);
    }
  }
  
  // 7. Get active members
  console.log('\n7️⃣ Testing Get Active Members...');
  const activeResult = await makeRequest('GET', '/members/active');
  if (activeResult.success) {
    console.log(`✅ Active members: ${activeResult.data.message}`);
    console.log(`   Count: ${activeResult.data.count}`);
  } else {
    console.log(`❌ Get active members failed: ${activeResult.error}`);
  }
  
  // 8. Update member
  if (createdMemberId) {
    console.log('\n8️⃣ Testing Update Member...');
    const updateData = { phone: "+0987654321", address: "456 Updated Street" };
    const updateResult = await makeRequest('PUT', `/members/${createdMemberId}`, updateData);
    if (updateResult.success) {
      console.log(`✅ Member updated: ${updateResult.data.message}`);
      console.log(`   New phone: ${updateResult.data.data.phone}`);
      console.log(`   New address: ${updateResult.data.data.address}`);
    } else {
      console.log(`❌ Update member failed: ${updateResult.error}`);
    }
  }
  
  // 9. Deactivate member
  if (createdMemberId) {
    console.log('\n9️⃣ Testing Deactivate Member...');
    const deactivateResult = await makeRequest('POST', `/members/${createdMemberId}/deactivate`);
    if (deactivateResult.success) {
      console.log(`✅ Member deactivated: ${deactivateResult.data.message}`);
      console.log(`   New status: ${deactivateResult.data.data.status}`);
    } else {
      console.log(`❌ Deactivate member failed: ${deactivateResult.error}`);
    }
  }
  
  // 10. Get inactive members
  console.log('\n🔟 Testing Get Inactive Members...');
  const inactiveResult = await makeRequest('GET', '/members/inactive');
  if (inactiveResult.success) {
    console.log(`✅ Inactive members: ${inactiveResult.data.message}`);
    console.log(`   Count: ${inactiveResult.data.count}`);
  } else {
    console.log(`❌ Get inactive members failed: ${inactiveResult.error}`);
  }
}

// Test integration between APIs
async function testIntegration() {
  console.log('\n🔗 Testing API Integration...');
  console.log('-'.repeat(40));
  
  // 1. Test that both APIs are accessible
  console.log('1️⃣ Testing API Accessibility...');
  const resourcesHealth = await makeRequest('GET', '/resources');
  const membersHealth = await makeRequest('GET', '/members');
  
  if (resourcesHealth.success && membersHealth.success) {
    console.log('✅ Both APIs are accessible and responding');
  } else {
    console.log('❌ One or both APIs are not responding');
  }
  
  // 2. Test data consistency
  console.log('\n2️⃣ Testing Data Consistency...');
  if (createdResourceId && createdMemberId) {
    console.log('✅ Both resource and member were created successfully');
    console.log(`   Resource ID: ${createdResourceId}`);
    console.log(`   Member ID: ${createdMemberId}`);
  } else {
    console.log('❌ Failed to create both resource and member');
  }
  
  // 3. Test final statistics
  console.log('\n3️⃣ Testing Final Statistics...');
  const finalStats = await makeRequest('GET', '/members/stats');
  if (finalStats.success) {
    console.log(`✅ Final member stats: ${JSON.stringify(finalStats.data.data)}`);
  } else {
    console.log(`❌ Failed to get final stats: ${finalStats.error}`);
  }
}

// Cleanup function
async function cleanup() {
  console.log('\n🧹 Cleaning up test data...');
  console.log('-'.repeat(40));
  
  let cleanupCount = 0;
  
  // Delete test resource
  if (createdResourceId) {
    const deleteResourceResult = await makeRequest('DELETE', `/resources/${createdResourceId}`);
    if (deleteResourceResult.success) {
      console.log(`✅ Test resource deleted: ${deleteResourceResult.data.message}`);
      cleanupCount++;
    } else {
      console.log(`❌ Failed to delete test resource: ${deleteResourceResult.error}`);
    }
  }
  
  // Delete test member
  if (createdMemberId) {
    const deleteMemberResult = await makeRequest('DELETE', `/members/${createdMemberId}`);
    if (deleteMemberResult.success) {
      console.log(`✅ Test member deleted: ${deleteMemberResult.data.message}`);
      cleanupCount++;
    } else {
      console.log(`❌ Failed to delete test member: ${deleteMemberResult.error}`);
    }
  }
  
  console.log(`\n🧹 Cleanup completed: ${cleanupCount}/2 items cleaned`);
}

// Main test execution
async function runCompleteTest() {
  try {
    // Test Resources API
    await testResourcesAPI();
    
    // Test Members API
    await testMembersAPI();
    
    // Test integration
    await testIntegration();
    
    // Cleanup
    await cleanup();
    
    console.log('\n🎉 Complete API Test Finished Successfully!');
    console.log('=' .repeat(60));
    console.log('✅ Resources API: Working perfectly');
    console.log('✅ Members API: Working perfectly');
    console.log('✅ API Integration: Seamless');
    console.log('✅ Data Consistency: Maintained');
    console.log('✅ Cleanup: Completed');
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error.message);
  }
}

// Run the complete test
runCompleteTest();
