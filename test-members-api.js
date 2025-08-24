const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/members';

// Test data
const testMember = {
  firstName: 'John',
  lastName: 'Doe',
  studentNumber: 'STU001',
  email: 'john.doe@example.com',
  password: 'password123',
  gender: 'Male',
  yearInSchool: 'Second',
  phone: '+1234567890',
  dateOfBirth: '2000-01-01',
  address: '123 Main St, City, Country'
};

const updateData = {
  phone: '+0987654321',
  address: '456 Oak Ave, Town, Country'
};

let createdMemberId;

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test all endpoints
async function testMembersAPI() {
  console.log('🧪 Testing Members API...\n');

  try {
    // 1️⃣ Test Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3000/health');
    console.log('✅ Health check:', healthResponse.data.message);
    console.log('');

    // 2️⃣ Test Get All Members (should be empty initially)
    console.log('2️⃣ Testing Get All Members...');
    const getAllResponse = await axios.get(BASE_URL);
    console.log('✅ Get all members:', getAllResponse.data.message);
    console.log(`   Count: ${getAllResponse.data.count}`);
    console.log('');

    // 3️⃣ Test Get Member Stats
    console.log('3️⃣ Testing Get Member Stats...');
    const statsResponse = await axios.get(`${BASE_URL}/stats`);
    console.log('✅ Member stats:', statsResponse.data.message);
    console.log('   Stats:', statsResponse.data.data);
    console.log('');

    // 4️⃣ Test Create Member
    console.log('4️⃣ Testing Create Member...');
    const createResponse = await axios.post(BASE_URL, testMember);
    console.log('✅ Member created:', createResponse.data.message);
    createdMemberId = createResponse.data.data.id;
    console.log(`   Member ID: ${createdMemberId}`);
    console.log('');

    // 5️⃣ Test Get Member by ID
    console.log('5️⃣ Testing Get Member by ID...');
    const getByIdResponse = await axios.get(`${BASE_URL}/${createdMemberId}`);
    console.log('✅ Member retrieved:', getByIdResponse.data.message);
    console.log(`   Name: ${getByIdResponse.data.data.firstName} ${getByIdResponse.data.data.lastName}`);
    console.log(`   Status: ${getByIdResponse.data.data.status}`);
    console.log('');

    // 6️⃣ Test Get Pending Members
    console.log('6️⃣ Testing Get Pending Members...');
    const pendingResponse = await axios.get(`${BASE_URL}/pending`);
    console.log('✅ Pending members:', pendingResponse.data.message);
    console.log(`   Count: ${pendingResponse.data.count}`);
    console.log('');

    // 7️⃣ Test Approve Member
    console.log('7️⃣ Testing Approve Member...');
    const approveResponse = await axios.post(`${BASE_URL}/${createdMemberId}/approve`, {
      approvedBy: 'admin@example.com'
    });
    console.log('✅ Member approved:', approveResponse.data.message);
    console.log(`   New status: ${approveResponse.data.data.status}`);
    console.log('');

    // 8️⃣ Test Get Active Members
    console.log('8️⃣ Testing Get Active Members...');
    const activeResponse = await axios.get(`${BASE_URL}/active`);
    console.log('✅ Active members:', activeResponse.data.message);
    console.log(`   Count: ${activeResponse.data.count}`);
    console.log('');

    // 9️⃣ Test Update Member
    console.log('9️⃣ Testing Update Member...');
    const updateResponse = await axios.put(`${BASE_URL}/${createdMemberId}`, updateData);
    console.log('✅ Member updated:', updateResponse.data.message);
    console.log(`   New phone: ${updateResponse.data.data.phone}`);
    console.log(`   New address: ${updateResponse.data.data.address}`);
    console.log('');

    // 🔟 Test Get Members with Filtering
    console.log('🔟 Testing Get Members with Filtering...');
    const filterResponse = await axios.get(`${BASE_URL}?status=active&limit=10&sortBy=firstName&sortOrder=asc`);
    console.log('✅ Filtered members:', filterResponse.data.message);
    console.log(`   Count: ${filterResponse.data.count}`);
    console.log(`   Has more: ${filterResponse.data.hasMore}`);
    console.log('');

    // 1️⃣1️⃣ Test Deactivate Member
    console.log('1️⃣1️⃣ Testing Deactivate Member...');
    const deactivateResponse = await axios.post(`${BASE_URL}/${createdMemberId}/deactivate`);
    console.log('✅ Member deactivated:', deactivateResponse.data.message);
    console.log(`   New status: ${deactivateResponse.data.data.status}`);
    console.log('');

    // 1️⃣2️⃣ Test Get Inactive Members
    console.log('1️⃣2️⃣ Testing Get Inactive Members...');
    const inactiveResponse = await axios.get(`${BASE_URL}/inactive`);
    console.log('✅ Inactive members:', inactiveResponse.data.message);
    console.log(`   Count: ${inactiveResponse.data.count}`);
    console.log('');

    // 1️⃣3️⃣ Test Activate Member
    console.log('1️⃣3️⃣ Testing Activate Member...');
    const activateResponse = await axios.post(`${BASE_URL}/${createdMemberId}/activate`);
    console.log('✅ Member activated:', activateResponse.data.message);
    console.log(`   New status: ${activateResponse.data.data.status}`);
    console.log('');

    // 1️⃣4️⃣ Test Bulk Update Members
    console.log('1️⃣4️⃣ Testing Bulk Update Members...');
    const bulkUpdateResponse = await axios.post(`${BASE_URL}/bulk-update`, {
      memberIds: [createdMemberId],
      updateData: {
        yearInSchool: 'Third'
      }
    });
    console.log('✅ Bulk update:', bulkUpdateResponse.data.message);
    console.log(`   Summary: ${bulkUpdateResponse.data.summary.successful} successful, ${bulkUpdateResponse.data.summary.failed} failed`);
    console.log('');

    // 1️⃣5️⃣ Test Create Another Member for Rejection Test
    console.log('1️⃣5️⃣ Testing Create Another Member for Rejection...');
    const testMember2 = { ...testMember, email: 'jane.smith@example.com', studentNumber: 'STU002' };
    const create2Response = await axios.post(BASE_URL, testMember2);
    const member2Id = create2Response.data.data.id;
    console.log('✅ Second member created:', create2Response.data.message);
    console.log(`   Member ID: ${member2Id}`);
    console.log('');

    // 1️⃣6️⃣ Test Reject Member
    console.log('1️⃣6️⃣ Testing Reject Member...');
    const rejectResponse = await axios.post(`${BASE_URL}/${member2Id}/reject`, {
      rejectedBy: 'admin@example.com'
    });
    console.log('✅ Member rejected:', rejectResponse.data.message);
    console.log(`   New status: ${rejectResponse.data.data.status}`);
    console.log('');

    // 1️⃣7️⃣ Test Delete Member
    console.log('1️⃣7️⃣ Testing Delete Member...');
    const deleteResponse = await axios.delete(`${BASE_URL}/${member2Id}`);
    console.log('✅ Member deleted:', deleteResponse.data.message);
    console.log('');

    // 1️⃣8️⃣ Test Final Stats
    console.log('1️⃣8️⃣ Testing Final Stats...');
    const finalStatsResponse = await axios.get(`${BASE_URL}/stats`);
    console.log('✅ Final stats:', finalStatsResponse.data.message);
    console.log('   Final stats:', finalStatsResponse.data.data);
    console.log('');

    // 1️⃣9️⃣ Test Get All Members (final state)
    console.log('1️⃣9️⃣ Testing Get All Members (final state)...');
    const finalGetAllResponse = await axios.get(BASE_URL);
    console.log('✅ Final get all members:', finalGetAllResponse.data.message);
    console.log(`   Final count: ${finalGetAllResponse.data.count}`);
    console.log('');

    // 2️⃣0️⃣ Test Error Handling - Invalid ID
    console.log('2️⃣0️⃣ Testing Error Handling - Invalid ID...');
    try {
      await axios.get(`${BASE_URL}/invalid-id`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Error handling works for invalid ID');
      } else {
        console.log('❌ Unexpected error response for invalid ID');
      }
    }
    console.log('');

    // 2️⃣1️⃣ Test Error Handling - Member Not Found
    console.log('2️⃣1️⃣ Testing Error Handling - Member Not Found...');
    try {
      await axios.get(`${BASE_URL}/nonexistent123456789`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Error handling works for non-existent member');
      } else {
        console.log('❌ Unexpected error response for non-existent member');
      }
    }
    console.log('');

    console.log('🎉 All Members API tests completed successfully!');
    console.log(`📊 Final member count: ${finalGetAllResponse.data.count}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
testMembersAPI();
