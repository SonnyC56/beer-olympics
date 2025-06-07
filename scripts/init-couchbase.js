const { getCouchbaseConnection } = require('../dist/services/couchbase');

async function createIndexes() {
  try {
    const { cluster, bucket } = await getCouchbaseConnection();
    const bucketName = process.env.COUCHBASE_BUCKET || 'beer_olympics';
    
    console.log('Creating indexes for Beer Olympics...');
    
    // Primary index for development (remove in production)
    await cluster.query(
      `CREATE PRIMARY INDEX ON \`${bucketName}\`._default._default`
    ).catch(() => console.log('Primary index already exists'));
    
    // Index for tournaments by slug
    await cluster.query(
      `CREATE INDEX idx_tournament_slug ON \`${bucketName}\`._default._default(slug) 
       WHERE _type = 'tournament'`
    ).catch(() => console.log('Tournament slug index already exists'));
    
    // Index for teams by tournament
    await cluster.query(
      `CREATE INDEX idx_team_tournament ON \`${bucketName}\`._default._default(tournamentId, name) 
       WHERE _type = 'team'`
    ).catch(() => console.log('Team tournament index already exists'));
    
    // Index for matches by tournament and status
    await cluster.query(
      `CREATE INDEX idx_match_tournament_status ON \`${bucketName}\`._default._default(tournamentId, isComplete, round, startTime) 
       WHERE _type = 'match'`
    ).catch(() => console.log('Match tournament status index already exists'));
    
    // Index for score entries by tournament and team
    await cluster.query(
      `CREATE INDEX idx_score_entry_tournament_team ON \`${bucketName}\`._default._default(tournamentId, teamId, points) 
       WHERE _type = 'score_entry'`
    ).catch(() => console.log('Score entry index already exists'));
    
    // Index for score submissions by match and status
    await cluster.query(
      `CREATE INDEX idx_score_submission_match_status ON \`${bucketName}\`._default._default(matchId, status) 
       WHERE _type = 'score_submission'`
    ).catch(() => console.log('Score submission index already exists'));
    
    // Index for events by tournament
    await cluster.query(
      `CREATE INDEX idx_event_tournament ON \`${bucketName}\`._default._default(tournamentId) 
       WHERE _type = 'event'`
    ).catch(() => console.log('Event tournament index already exists'));
    
    // Index for media by match
    await cluster.query(
      `CREATE INDEX idx_media_match ON \`${bucketName}\`._default._default(matchId) 
       WHERE _type = 'media'`
    ).catch(() => console.log('Media match index already exists'));
    
    console.log('All indexes created successfully!');
    
    // Create sample tournament for testing
    if (process.env.CREATE_SAMPLE_DATA === 'true') {
      console.log('Creating sample data...');
      
      const collection = bucket.defaultScope().collection('_default');
      
      // Sample tournament
      await collection.upsert('tournament::test-tournament', {
        _type: 'tournament',
        slug: 'test-tournament',
        name: 'Test Beer Olympics',
        date: '2024-06-15',
        ownerId: 'test-user-123',
        isOpen: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      // Sample teams
      const teamColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
      const teamNames = ['Red Devils', 'Blue Waves', 'Green Machine', 'Yellow Lightning'];
      
      for (let i = 0; i < 4; i++) {
        await collection.upsert(`team::test-team-${i + 1}`, {
          _type: 'team',
          id: `test-team-${i + 1}`,
          tournamentId: 'test-tournament',
          name: teamNames[i],
          colorHex: teamColors[i],
          flagCode: '🏁',
          memberIds: [`test-user-${i + 1}`],
          captainId: `test-user-${i + 1}`,
          createdAt: new Date().toISOString(),
        });
      }
      
      // Sample event
      await collection.upsert('event::test-event-1', {
        _type: 'event',
        id: 'test-event-1',
        tournamentId: 'test-tournament',
        name: 'Beer Pong',
        type: 'SINGLE_ELIM',
        pointMatrix: {
          1: 10,
          2: 7,
          3: 5,
          4: 3,
        },
        scoring: {
          win: 10,
          loss: 5,
        },
        createdAt: new Date().toISOString(),
      });
      
      console.log('Sample data created!');
    }
    
    await cluster.close();
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
}

createIndexes();