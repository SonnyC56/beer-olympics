import { config } from 'dotenv';
import { connect } from 'couchbase';

// Load environment variables
config({ path: '.env.local' });

async function viewLabeledDocuments() {
  console.log('🏷️  Viewing labeled documents in Couchbase...\n');
  
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
    
    console.log('✅ Connected successfully\n');
    
    // Get document count by type
    console.log('📊 Document Count by Type:');
    const typeCountQuery = `
      SELECT _type, COUNT(*) as count
      FROM \`${bucketName}\`._default._default
      WHERE _type IS NOT NULL
      GROUP BY _type
      ORDER BY count DESC
    `;
    
    const typeCountResult = await cluster.query(typeCountQuery);
    
    if (typeCountResult.rows.length > 0) {
      typeCountResult.rows.forEach(row => {
        console.log(`   📄 ${row._type}: ${row.count} documents`);
      });
    } else {
      console.log('   No typed documents found');
    }
    
    // Get document count by key pattern
    console.log('\n🔑 Document Count by Key Pattern:');
    const keyPatterns = ['user::', 'tournament::', 'team::', 'match::', 'login::', 'score::', 'media::'];
    
    for (const pattern of keyPatterns) {
      const patternQuery = `
        SELECT COUNT(*) as count
        FROM \`${bucketName}\`._default._default
        WHERE META().id LIKE "${pattern}%"
      `;
      
      const patternResult = await cluster.query(patternQuery);
      const count = patternResult.rows[0]?.count || 0;
      
      if (count > 0) {
        console.log(`   🔗 ${pattern}*: ${count} documents`);
      }
    }
    
    // Show sample documents by type
    console.log('\n📋 Sample Documents by Type:');
    
    const sampleQuery = `
      SELECT _type, META().id as documentId, *
      FROM \`${bucketName}\`._default._default
      WHERE _type IS NOT NULL
      ORDER BY _type, updatedAt DESC
      LIMIT 10
    `;
    
    const sampleResult = await cluster.query(sampleQuery);
    
    if (sampleResult.rows.length > 0) {
      let currentType = '';
      
      sampleResult.rows.forEach(row => {
        if (row._type !== currentType) {
          currentType = row._type;
          console.log(`\n   📁 ${currentType.toUpperCase()} Documents:`);
        }
        
        console.log(`      🆔 ${row.documentId}`);
        
        // Show relevant fields based on type
        if (row._type === 'user') {
          console.log(`         👤 ${row.name} (${row.email})`);
          console.log(`         📅 Created: ${row.createdAt}`);
          if (row.stats) {
            console.log(`         📊 Tournaments: ${row.stats.tournamentsJoined}, Matches: ${row.stats.totalMatches}`);
          }
        } else if (row._type === 'login_event') {
          console.log(`         👤 User: ${row.name} (${row.email})`);
          console.log(`         ⏰ Time: ${row.timestamp}`);
          console.log(`         🌐 IP: ${row.ip}, Success: ${row.successful}`);
        } else if (row._type === 'tournament') {
          console.log(`         🏆 ${row.name}`);
          console.log(`         🔗 Slug: ${row.slug}`);
          console.log(`         📊 Status: ${row.status}`);
        }
      });
    } else {
      console.log('   No documents with _type field found');
    }
    
    // Show documents without type labels
    console.log('\n⚠️  Documents Without Type Labels:');
    const untypedQuery = `
      SELECT META().id as documentId, *
      FROM \`${bucketName}\`._default._default
      WHERE _type IS MISSING OR _type IS NULL
      LIMIT 5
    `;
    
    const untypedResult = await cluster.query(untypedQuery);
    
    if (untypedResult.rows.length > 0) {
      console.log('   Found unlabeled documents:');
      untypedResult.rows.forEach(row => {
        console.log(`      🆔 ${row.documentId}`);
        // Try to guess type from key pattern
        const key = row.documentId;
        if (key.startsWith('user::')) {
          console.log('         💡 Likely type: user (based on key pattern)');
        } else if (key.startsWith('login::')) {
          console.log('         💡 Likely type: login_event (based on key pattern)');
        } else if (key.startsWith('tournament::')) {
          console.log('         💡 Likely type: tournament (based on key pattern)');
        }
      });
    } else {
      console.log('   ✅ All documents are properly labeled!');
    }
    
    // Database organization summary
    console.log('\n📈 Database Organization Summary:');
    
    const totalQuery = `
      SELECT COUNT(*) as total
      FROM \`${bucketName}\`._default._default
    `;
    
    const totalResult = await cluster.query(totalQuery);
    const totalDocs = totalResult.rows[0]?.total || 0;
    
    const typedQuery = `
      SELECT COUNT(*) as typed
      FROM \`${bucketName}\`._default._default
      WHERE _type IS NOT NULL
    `;
    
    const typedResult = await cluster.query(typedQuery);
    const typedDocs = typedResult.rows[0]?.typed || 0;
    
    console.log(`   📊 Total documents: ${totalDocs}`);
    console.log(`   🏷️  Labeled documents: ${typedDocs}`);
    console.log(`   📈 Organization level: ${totalDocs > 0 ? Math.round((typedDocs / totalDocs) * 100) : 0}%`);
    
    if (typedDocs === totalDocs && totalDocs > 0) {
      console.log('   ✅ Perfect! All documents are properly labeled');
    } else if (typedDocs > 0) {
      console.log('   🔧 Good start! Consider labeling remaining documents');
    } else {
      console.log('   ⚠️  No labeled documents found. Consider adding _type fields');
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('   • Create indexes on _type field for better performance');
    console.log('   • Add _type field to any unlabeled documents');
    console.log('   • Use consistent key patterns for related documents');
    console.log('   • Consider using scopes/collections for larger datasets');
    
    // Close connection
    await cluster.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Failed to view documents:', error);
    process.exit(1);
  }
}

viewLabeledDocuments();