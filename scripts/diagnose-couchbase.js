import { config } from 'dotenv';
import { connect } from 'couchbase';

// Load environment variables
config({ path: '.env.local' });

async function diagnoseCouchbase() {
  console.log('🔍 Diagnosing Couchbase connection...\n');
  
  const connectionString = process.env.COUCHBASE_CONNECTION_STRING;
  const username = process.env.COUCHBASE_USERNAME;
  const password = process.env.COUCHBASE_PASSWORD;
  const bucketName = process.env.COUCHBASE_BUCKET || 'beer_olympics';
  
  console.log('📋 Configuration:');
  console.log(`   Connection String: ${connectionString}`);
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password ? '[SET]' : '[NOT SET]'}`);
  console.log(`   Bucket: ${bucketName}\n`);
  
  if (!connectionString || !username || !password) {
    console.log('❌ Missing required environment variables');
    return;
  }
  
  // Parse connection string
  try {
    const url = new URL(connectionString.replace('couchbases://', 'https://'));
    console.log('🌐 Parsed connection details:');
    console.log(`   Protocol: couchbases (secure)`);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || 'default (11207)'}\n`);
  } catch (error) {
    console.log('❌ Invalid connection string format');
    return;
  }
  
  // Test basic network connectivity
  console.log('🌍 Testing network connectivity...');
  try {
    const hostname = connectionString.replace('couchbases://', '').split(':')[0];
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Try to ping the host (this might not work on all systems)
    try {
      await execAsync(`ping -c 1 ${hostname}`, { timeout: 5000 });
      console.log('✅ Host is reachable via ping');
    } catch (error) {
      console.log('⚠️  Ping failed (this is normal for cloud services)');
    }
  } catch (error) {
    console.log('⚠️  Could not test network connectivity');
  }
  
  // Test Couchbase connection with minimal timeout
  console.log('\n🔌 Testing Couchbase connection...');
  try {
    const cluster = await connect(connectionString, {
      username,
      password,
      timeouts: {
        connectTimeout: 5000,  // 5 second timeout for quick test
        kvTimeout: 3000,
      },
    });
    
    console.log('✅ Successfully connected to Couchbase!');
    
    // Test bucket access
    const bucket = cluster.bucket(bucketName);
    console.log(`✅ Bucket "${bucketName}" accessible`);
    
    // Test collection access
    const collection = bucket.defaultCollection();
    
    // Try a simple operation
    try {
      await collection.exists('test-connection-check');
      console.log('✅ Collection operations working');
    } catch (error) {
      console.log('⚠️  Collection test failed:', error.message);
    }
    
    await cluster.close();
    console.log('✅ Connection closed cleanly');
    
  } catch (error) {
    console.log('❌ Couchbase connection failed:');
    console.log(`   Error: ${error.message}`);
    console.log(`   Code: ${error.code || 'Unknown'}`);
    
    // Provide troubleshooting suggestions
    console.log('\n🔧 Troubleshooting suggestions:');
    
    if (error.message.includes('timeout') || error.code === 14) {
      console.log('   • Check if your IP is allowlisted in Couchbase Capella');
      console.log('   • Verify firewall/VPN is not blocking the connection');
      console.log('   • Try connecting from a different network');
    }
    
    if (error.message.includes('authentication') || error.code === 2) {
      console.log('   • Verify username and password are correct');
      console.log('   • Check if the user has access to the bucket');
    }
    
    if (error.message.includes('bucket') || error.code === 3) {
      console.log('   • Verify the bucket name is correct');
      console.log('   • Check if the bucket exists in your cluster');
    }
    
    console.log('\n📖 Check Couchbase Capella console:');
    console.log('   • Go to https://cloud.couchbase.com');
    console.log('   • Check "Security" → "Database Access" for IP allowlist');
    console.log('   • Check "Data Tools" → "Buckets" to verify bucket exists');
  }
}

diagnoseCouchbase().catch(console.error);