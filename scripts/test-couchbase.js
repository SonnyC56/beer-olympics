import { config } from 'dotenv';
import { getCouchbaseConnection, getCollection } from '../src/services/couchbase.ts';

// Load environment variables
config();

async function testCouchbase() {
  console.log('Testing Couchbase connection...\n');
  
  try {
    // Test 1: Connection
    console.log('1. Testing connection...');
    const { cluster, bucket } = await getCouchbaseConnection();
    console.log('✅ Connected to Couchbase successfully');
    console.log(`   Bucket: ${bucket.name}`);
    
    // Test 2: Get collection
    console.log('\n2. Testing collection access...');
    const collection = await getCollection();
    console.log('✅ Accessed default collection');
    
    // Test 3: Create a test tournament
    console.log('\n3. Creating test tournament...');
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
    
    await collection.insert(`tournament::${testSlug}`, testTournament);
    console.log(`✅ Created tournament with slug: ${testSlug}`);
    
    // Test 4: Retrieve the tournament
    console.log('\n4. Retrieving tournament...');
    const result = await collection.get(`tournament::${testSlug}`);
    console.log('✅ Retrieved tournament:', result.content);
    
    // Test 5: Query tournaments
    console.log('\n5. Querying all tournaments...');
    const query = `
      SELECT * FROM \`beer_olympics\`._default
      WHERE _type = 'tournament'
      LIMIT 5
    `;
    const queryResult = await cluster.query(query);
    console.log(`✅ Found ${queryResult.rows.length} tournaments`);
    queryResult.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.name} (${row.slug})`);
    });
    
    // Test 6: Clean up
    console.log('\n6. Cleaning up test data...');
    await collection.remove(`tournament::${testSlug}`);
    console.log('✅ Removed test tournament');
    
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