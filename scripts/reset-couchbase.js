import { config } from 'dotenv';
import { getCouchbaseConnection } from '../src/services/couchbase.ts';

// Load environment variables
config();

async function resetCouchbase() {
  console.log('🔄 Resetting Couchbase database...\n');
  
  try {
    const { cluster, bucket } = await getCouchbaseConnection();
    const bucketName = process.env.COUCHBASE_BUCKET || 'beer_olympics';
    
    console.log('⚠️  WARNING: This will delete ALL data in the bucket!');
    console.log(`   Bucket: ${bucketName}`);
    
    // In a real scenario, you might want to add confirmation
    // For development, we'll proceed
    
    // Get all document types to delete
    const documentTypes = [
      'tournament',
      'team', 
      'event',
      'match',
      'score_submission',
      'score_entry',
      'media',
      'user',
      'login'
    ];
    
    let totalDeleted = 0;
    
    for (const type of documentTypes) {
      console.log(`🗑️  Deleting ${type} documents...`);
      
      try {
        const query = `
          DELETE FROM \`${bucketName}\`._default._default
          WHERE META().id LIKE "${type}::%"
        `;
        
        const result = await cluster.query(query);
        const deletedCount = result.metaData.metrics?.mutationCount || 0;
        totalDeleted += deletedCount;
        
        console.log(`   ✅ Deleted ${deletedCount} ${type} documents`);
      } catch (error) {
        console.log(`   ⚠️  No ${type} documents found or error: ${error.message}`);
      }
    }
    
    console.log(`\n🧹 Database reset complete!`);
    console.log(`   Total documents deleted: ${totalDeleted}`);
    
    // Close connection
    await cluster.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database reset failed:', error);
    process.exit(1);
  }
}

// Confirmation prompt for safety
const args = process.argv.slice(2);
if (!args.includes('--confirm')) {
  console.log('⚠️  This will delete ALL data in your Couchbase bucket!');
  console.log('   To proceed, run: npm run reset:couchbase -- --confirm');
  process.exit(1);
}

resetCouchbase();