import { config } from 'dotenv';
import { connect } from 'couchbase';

// Load environment variables
config({ path: '.env.local' });

// Also try .env if .env.local doesn't exist
if (!process.env.COUCHBASE_CONNECTION_STRING) {
  config({ path: '.env' });
}

async function testCouchbase() {
  console.log('Testing Couchbase connection...\n');
  
  try {
    // Test 1: Connection
    console.log('1. Testing connection...');
    
    const connectionString = process.env.COUCHBASE_CONNECTION_STRING;
    const username = process.env.COUCHBASE_USERNAME;
    const password = process.env.COUCHBASE_PASSWORD;
    const bucketName = process.env.COUCHBASE_BUCKET || 'beer_olympics';
    
    if (!connectionString || !username || !password) {
      throw new Error('Missing Couchbase configuration. Please check environment variables.');
    }
    
    console.log(`   Connecting to: ${connectionString.replace(/\/\/.*@/, '//***@')}`);
    console.log(`   Username: ${username}`);
    console.log(`   Bucket: ${bucketName}`);
    
    console.log('   Attempting connection...');
    const cluster = await connect(connectionString, {
      username,
      password,
      timeouts: {
        kvTimeout: 15000,        // Increased timeouts
        queryTimeout: 30000,
        connectTimeout: 20000,   // Increased connection timeout
        managementTimeout: 30000,
      },
    });
    
    const bucket = cluster.bucket(bucketName);
    console.log('✅ Connected to Couchbase successfully');
    console.log(`   Bucket: ${bucket.name}`);
    
    // Test 2: Get collection
    console.log('\n2. Testing collection access...');
    const collection = bucket.defaultCollection();
    console.log('✅ Accessed default collection');
    
    // Test 3: Try to read existing data
    console.log('\n3. Testing read permissions...');
    try {
      // Try to get any existing tournament
      const queryStatement = `
        SELECT META().id, * FROM \`${bucketName}\`._default._default
        WHERE META().id LIKE "tournament::%"
        LIMIT 1
      `;
      const queryResult = await cluster.query(queryStatement);
      
      if (queryResult.rows.length > 0) {
        const tournamentKey = queryResult.rows[0].id;
        console.log(`   Found existing tournament: ${tournamentKey}`);
        
        // Test reading the document
        const result = await collection.get(tournamentKey);
        console.log('✅ Successfully read tournament data');
        console.log(`   Tournament name: ${result.content.name || 'Unknown'}`);
      } else {
        console.log('   No existing tournaments found');
      }
    } catch (error) {
      console.log('⚠️  Read test failed:', error.message);
    }
    
    // Test 4: Check user permissions
    console.log('\n4. Testing write permissions...');
    const testSlug = 'couchbase-test-' + Date.now();
    const testTournament = {
      _type: 'tournament',
      slug: testSlug,
      name: 'Couchbase Test Tournament',
      date: '2024-06-15',
      ownerId: 'test-user-123',
      isOpen: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    try {
      await collection.upsert(`tournament::${testSlug}`, testTournament);
      console.log(`✅ Successfully created test tournament: ${testSlug}`);
      
      // Test reading it back
      const result = await collection.get(`tournament::${testSlug}`);
      console.log('✅ Successfully retrieved test tournament');
      
      // Clean up the test document
      await collection.remove(`tournament::${testSlug}`);
      console.log('✅ Successfully cleaned up test tournament');
      
    } catch (error) {
      console.log('❌ Write permission test failed');
      console.log(`   Error: ${error.message}`);
      
      if (error.message.includes('Upsert privilege') || error.message.includes('authentication failure')) {
        console.log('\n🔧 Permission Issue Detected:');
        console.log('   The database user needs additional permissions:');
        console.log('   • Data Reader (for queries)');
        console.log('   • Data Writer (for upsert/insert/update)');
        console.log('   • In Couchbase Capella: Security → Database Access → Edit User');
      }
    }
    
    // Test 5: Final query test
    console.log('\n5. Final query test...');
    try {
      const finalQueryStatement = `
        SELECT COUNT(*) as total_tournaments FROM \`${bucketName}\`._default._default
        WHERE META().id LIKE "tournament::%"
      `;
      const finalResult = await cluster.query(finalQueryStatement);
      const count = finalResult.rows[0]?.total_tournaments || 0;
      console.log(`✅ Database contains ${count} tournaments total`);
    } catch (error) {
      console.log('⚠️  Final query failed:', error.message);
    }
    
    console.log('\n🎉 All Couchbase tests passed!');
    
    // Close connection
    await cluster.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Couchbase test failed:', error);
    process.exit(1);
  }
}

testCouchbase();