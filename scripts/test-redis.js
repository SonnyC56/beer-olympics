#!/usr/bin/env node
const { default: redisService } = require('../src/services/redis');
const { cacheWarmer } = require('../src/utils/cache-warmer');

async function testRedis() {
  console.log('🔴 Testing Redis Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const testKey = 'test:connection';
    await redisService.set(testKey, { message: 'Redis is working!' }, 10);
    const retrieved = await redisService.get(testKey);
    console.log('✅ Connection successful:', retrieved);
    
    // Test 2: TTL functionality
    console.log('\n2. Testing TTL functionality...');
    const ttlKey = 'test:ttl';
    await redisService.set(ttlKey, 'expires soon', 2);
    const ttl = await redisService.ttl(ttlKey);
    console.log(`✅ TTL set successfully: ${ttl} seconds`);
    
    // Test 3: Increment functionality
    console.log('\n3. Testing atomic increment...');
    const counterKey = 'test:counter';
    await redisService.delete(counterKey);
    const count1 = await redisService.increment(counterKey);
    const count2 = await redisService.increment(counterKey, 5);
    console.log(`✅ Increment working: ${count1} -> ${count2}`);
    
    // Test 4: Pattern deletion
    console.log('\n4. Testing pattern deletion...');
    await redisService.set('test:pattern:1', 'data1');
    await redisService.set('test:pattern:2', 'data2');
    await redisService.set('test:pattern:3', 'data3');
    const deleted = await redisService.deletePattern('test:pattern:*');
    console.log(`✅ Deleted ${deleted} keys matching pattern`);
    
    // Test 5: Multi-get functionality
    console.log('\n5. Testing multi-get...');
    await redisService.set('test:multi:1', { id: 1, name: 'Item 1' });
    await redisService.set('test:multi:2', { id: 2, name: 'Item 2' });
    await redisService.set('test:multi:3', { id: 3, name: 'Item 3' });
    const multiResults = await redisService.multiGet([
      'test:multi:1',
      'test:multi:2',
      'test:multi:3',
      'test:multi:nonexistent'
    ]);
    console.log('✅ Multi-get results:', multiResults);
    
    // Test 6: Cache warming
    console.log('\n6. Testing cache warming...');
    const warmKey = 'test:warm';
    let fetchCount = 0;
    const warmResult1 = await redisService.warm(warmKey, async () => {
      fetchCount++;
      return { data: 'expensive calculation', fetchCount };
    }, 5);
    const warmResult2 = await redisService.warm(warmKey, async () => {
      fetchCount++;
      return { data: 'expensive calculation', fetchCount };
    }, 5);
    console.log('✅ First call (miss):', warmResult1);
    console.log('✅ Second call (hit):', warmResult2);
    console.log(`✅ Fetch function called ${fetchCount} time(s)`);
    
    // Test 7: Performance test
    console.log('\n7. Testing performance...');
    const perfKey = 'test:performance';
    const iterations = 1000;
    
    // Write performance
    const writeStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      await redisService.set(`${perfKey}:${i}`, { index: i, data: 'test' }, 60);
    }
    const writeTime = Date.now() - writeStart;
    console.log(`✅ Write performance: ${iterations} operations in ${writeTime}ms (${(iterations / writeTime * 1000).toFixed(0)} ops/sec)`);
    
    // Read performance
    const readStart = Date.now();
    for (let i = 0; i < iterations; i++) {
      await redisService.get(`${perfKey}:${i}`);
    }
    const readTime = Date.now() - readStart;
    console.log(`✅ Read performance: ${iterations} operations in ${readTime}ms (${(iterations / readTime * 1000).toFixed(0)} ops/sec)`);
    
    // Cleanup performance test keys
    await redisService.deletePattern(`${perfKey}:*`);
    
    // Test 8: Get cache statistics
    console.log('\n8. Getting cache statistics...');
    const stats = await cacheWarmer.getCacheStats();
    console.log('✅ Cache stats:', stats);
    
    // Cleanup all test keys
    console.log('\n9. Cleaning up test keys...');
    await redisService.deletePattern('test:*');
    
    console.log('\n✅ All Redis tests passed!');
    
    // Close connection
    await redisService.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Redis test failed:', error);
    process.exit(1);
  }
}

// Run tests
testRedis();