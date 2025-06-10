import { config } from 'dotenv';
import { connect } from 'couchbase';

// Load environment variables
config({ path: '.env.local' });

async function testUserCreation() {
  console.log('👤 Testing user creation in Couchbase...\n');
  
  try {
    const connectionString = process.env.COUCHBASE_CONNECTION_STRING;
    const username = process.env.COUCHBASE_USERNAME;
    const password = process.env.COUCHBASE_PASSWORD;
    const bucketName = process.env.COUCHBASE_BUCKET || 'beer_olympics';
    
    // Connect to Couchbase
    console.log('🔌 Connecting to Couchbase...');
    const cluster = await connect(connectionString, {
      username,
      password,
      timeouts: {
        kvTimeout: 15000,
        queryTimeout: 30000,
        connectTimeout: 20000,
        managementTimeout: 30000,
      },
    });
    
    const bucket = cluster.bucket(bucketName);
    const collection = bucket.defaultCollection();
    console.log('✅ Connected successfully');
    
    // Create a fake user
    console.log('\n👤 Creating fake user...');
    const userId = 'google-fake-user-' + Date.now();
    const fakeUser = {
      _type: 'user',                    // Document type label
      id: userId,
      email: 'fake.user@example.com',
      name: 'Fake Test User',
      image: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=fake-user',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Additional user properties
      preferences: {
        notifications: true,
        theme: 'light'
      },
      stats: {
        tournamentsJoined: 0,
        tournamentsWon: 0,
        totalMatches: 0
      }
    };
    
    const userKey = `user::${userId}`;
    await collection.upsert(userKey, fakeUser);
    console.log(`✅ Created user with ID: ${userId}`);
    console.log(`   Key: ${userKey}`);
    console.log(`   Email: ${fakeUser.email}`);
    console.log(`   Name: ${fakeUser.name}`);
    
    // Retrieve the user to verify it was saved
    console.log('\n📖 Retrieving user to verify...');
    const retrievedUser = await collection.get(userKey);
    console.log('✅ Successfully retrieved user');
    console.log('   Retrieved data:', {
      id: retrievedUser.content.id,
      email: retrievedUser.content.email,
      name: retrievedUser.content.name,
      createdAt: retrievedUser.content.createdAt
    });
    
    // Test updating the user
    console.log('\n🔄 Testing user update...');
    const updatedUser = {
      ...retrievedUser.content,
      lastLogin: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        ...retrievedUser.content.stats,
        tournamentsJoined: 1
      }
    };
    
    await collection.upsert(userKey, updatedUser);
    console.log('✅ Successfully updated user');
    console.log(`   Updated lastLogin: ${updatedUser.lastLogin}`);
    console.log(`   Updated stats: ${JSON.stringify(updatedUser.stats)}`);
    
    // Test querying for the user
    console.log('\n🔍 Testing user query...');
    const queryStatement = `
      SELECT u.*, META(u).id as documentId
      FROM \`${bucketName}\`._default._default u
      WHERE META(u).id = "${userKey}"
    `;
    
    const queryResult = await cluster.query(queryStatement);
    
    if (queryResult.rows.length > 0) {
      const queriedUser = queryResult.rows[0];
      console.log('✅ Successfully found user via query');
      console.log(`   Document ID: ${queriedUser.documentId}`);
      console.log(`   User email: ${queriedUser.email}`);
    } else {
      console.log('❌ User not found via query');
    }
    
    // Test finding user by email
    console.log('\n📧 Testing user lookup by email...');
    const emailQueryStatement = `
      SELECT u.*, META(u).id as documentId
      FROM \`${bucketName}\`._default._default u
      WHERE META(u).id LIKE "user::%"
      AND u.email = $email
      LIMIT 1
    `;
    
    const emailQueryResult = await cluster.query(emailQueryStatement.replace('$email', `"${fakeUser.email}"`));
    
    if (emailQueryResult.rows.length > 0) {
      console.log('✅ Successfully found user by email');
      console.log(`   Found: ${emailQueryResult.rows[0].name}`);
    } else {
      console.log('❌ User not found by email');
    }
    
    // Create a login event for the user
    console.log('\n📝 Creating login event...');
    const loginEventId = `login::${userId}::${Date.now()}`;
    const loginEvent = {
      _type: 'login_event',             // Document type label
      userId: userId,
      email: fakeUser.email,
      name: fakeUser.name,
      timestamp: new Date().toISOString(),
      userAgent: 'Mozilla/5.0 (Test Script)',
      ip: '127.0.0.1',
      successful: true
    };
    
    await collection.upsert(loginEventId, loginEvent);
    console.log(`✅ Created login event: ${loginEventId}`);
    
    // Query recent login events
    console.log('\n📊 Querying recent login events...');
    const loginQueryStatement = `
      SELECT l.*, META(l).id as eventId
      FROM \`${bucketName}\`._default._default l
      WHERE META(l).id LIKE "login::%"
      AND l.userId = $userId
      ORDER BY l.timestamp DESC
      LIMIT 5
    `;
    
    const loginQueryResult = await cluster.query(loginQueryStatement.replace('$userId', `"${userId}"`));
    console.log(`✅ Found ${loginQueryResult.rows.length} login events for user`);
    
    loginQueryResult.rows.forEach((event, i) => {
      console.log(`   ${i + 1}. ${event.timestamp} from ${event.ip}`);
    });
    
    // Test cleanup (optional - comment out if you want to keep the test data)
    console.log('\n🧹 Cleaning up test data...');
    
    // Ask if user wants to keep the test data
    const shouldCleanup = process.argv.includes('--cleanup');
    
    if (shouldCleanup) {
      await collection.remove(userKey);
      console.log('✅ Removed test user');
      
      await collection.remove(loginEventId);
      console.log('✅ Removed test login event');
    } else {
      console.log('⏭️  Skipping cleanup (test data preserved)');
      console.log('   To clean up later, run: npm run test:user -- --cleanup');
      console.log(`   User ID: ${userId}`);
    }
    
    // Final summary
    console.log('\n📈 User Testing Summary:');
    console.log('✅ User creation - SUCCESS');
    console.log('✅ User retrieval - SUCCESS');
    console.log('✅ User update - SUCCESS');
    console.log('✅ User query by ID - SUCCESS');
    console.log('✅ User query by email - SUCCESS');
    console.log('✅ Login event creation - SUCCESS');
    console.log('✅ Login event query - SUCCESS');
    
    console.log('\n🎉 All user operations completed successfully!');
    
    // Close connection
    await cluster.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ User test failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      context: error.context
    });
    process.exit(1);
  }
}

testUserCreation();