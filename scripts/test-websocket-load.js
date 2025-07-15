#!/usr/bin/env node

/**
 * WebSocket Load Testing Script
 * Tests the scalability of WebSocket connections for the Beer Olympics app
 */

const WebSocket = require('ws');
const chalk = require('chalk');

const TARGET_URL = process.env.WS_URL || 'ws://localhost:3000';
const NUM_CLIENTS = parseInt(process.env.NUM_CLIENTS) || 100;
const RAMP_UP_TIME = parseInt(process.env.RAMP_UP_TIME) || 10000; // 10 seconds
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 60000; // 60 seconds
const MESSAGE_INTERVAL = parseInt(process.env.MESSAGE_INTERVAL) || 5000; // 5 seconds

class LoadTester {
  constructor() {
    this.clients = [];
    this.stats = {
      connected: 0,
      disconnected: 0,
      messagesSent: 0,
      messagesReceived: 0,
      errors: 0,
      latencies: []
    };
    this.startTime = Date.now();
  }

  async run() {
    console.log(chalk.blue.bold('\n🚀 WebSocket Load Test Starting...\n'));
    console.log(chalk.yellow(`Target URL: ${TARGET_URL}`));
    console.log(chalk.yellow(`Number of clients: ${NUM_CLIENTS}`));
    console.log(chalk.yellow(`Ramp-up time: ${RAMP_UP_TIME}ms`));
    console.log(chalk.yellow(`Test duration: ${TEST_DURATION}ms`));
    console.log(chalk.yellow(`Message interval: ${MESSAGE_INTERVAL}ms\n`));

    // Start progress monitoring
    this.progressInterval = setInterval(() => this.printProgress(), 1000);

    // Ramp up clients
    await this.rampUpClients();

    // Run test
    await this.runTest();

    // Clean up
    await this.cleanup();

    // Print results
    this.printResults();
  }

  async rampUpClients() {
    const delay = RAMP_UP_TIME / NUM_CLIENTS;
    
    for (let i = 0; i < NUM_CLIENTS; i++) {
      this.createClient(i);
      await this.sleep(delay);
    }

    console.log(chalk.green(`\n✓ All ${NUM_CLIENTS} clients created\n`));
  }

  createClient(id) {
    const ws = new WebSocket(TARGET_URL);
    const client = {
      id,
      ws,
      connected: false,
      messageCount: 0,
      lastPing: null
    };

    ws.on('open', () => {
      client.connected = true;
      this.stats.connected++;
      
      // Join a tournament room
      ws.send(JSON.stringify({
        type: 'join',
        room: `tournament-${Math.floor(id / 10)}`,
        userId: `user-${id}`
      }));
    });

    ws.on('message', (data) => {
      this.stats.messagesReceived++;
      client.messageCount++;

      // Calculate latency if this is a pong
      try {
        const message = JSON.parse(data);
        if (message.type === 'pong' && client.lastPing) {
          const latency = Date.now() - client.lastPing;
          this.stats.latencies.push(latency);
          client.lastPing = null;
        }
      } catch (e) {
        // Not JSON, ignore
      }
    });

    ws.on('error', (err) => {
      this.stats.errors++;
      console.error(chalk.red(`Client ${id} error: ${err.message}`));
    });

    ws.on('close', () => {
      client.connected = false;
      this.stats.disconnected++;
    });

    this.clients.push(client);
  }

  async runTest() {
    const testEndTime = Date.now() + TEST_DURATION;
    
    // Set up message sending interval
    const messageInterval = setInterval(() => {
      this.clients.forEach(client => {
        if (client.connected && client.ws.readyState === WebSocket.OPEN) {
          // Send different types of messages
          const messageType = Math.random();
          let message;

          if (messageType < 0.3) {
            // Score update
            message = {
              type: 'score_update',
              matchId: `match-${Math.floor(Math.random() * 20)}`,
              team1Score: Math.floor(Math.random() * 20),
              team2Score: Math.floor(Math.random() * 20)
            };
          } else if (messageType < 0.6) {
            // Leaderboard request
            message = {
              type: 'leaderboard_request',
              tournamentId: `tournament-${Math.floor(client.id / 10)}`
            };
          } else if (messageType < 0.9) {
            // Chat message
            message = {
              type: 'chat',
              room: `tournament-${Math.floor(client.id / 10)}`,
              text: `Test message from client ${client.id}`
            };
          } else {
            // Ping for latency measurement
            message = {
              type: 'ping',
              timestamp: Date.now()
            };
            client.lastPing = Date.now();
          }

          try {
            client.ws.send(JSON.stringify(message));
            this.stats.messagesSent++;
          } catch (err) {
            // Connection might be closing
          }
        }
      });
    }, MESSAGE_INTERVAL);

    // Wait for test duration
    while (Date.now() < testEndTime) {
      await this.sleep(1000);
    }

    clearInterval(messageInterval);
  }

  async cleanup() {
    console.log(chalk.yellow('\n🧹 Cleaning up connections...\n'));
    
    clearInterval(this.progressInterval);
    
    // Close all connections
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    });

    // Wait for all to close
    await this.sleep(2000);
  }

  printProgress() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const connected = this.stats.connected - this.stats.disconnected;
    const avgLatency = this.calculateAverageLatency();
    
    process.stdout.write(
      `\r${chalk.cyan('Progress:')} ` +
      `Time: ${elapsed}s | ` +
      `Connected: ${connected}/${NUM_CLIENTS} | ` +
      `Messages: ${this.stats.messagesSent}/${this.stats.messagesReceived} | ` +
      `Errors: ${this.stats.errors} | ` +
      `Avg Latency: ${avgLatency}ms`
    );
  }

  calculateAverageLatency() {
    if (this.stats.latencies.length === 0) return 0;
    const sum = this.stats.latencies.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.stats.latencies.length);
  }

  calculatePercentile(percentile) {
    if (this.stats.latencies.length === 0) return 0;
    const sorted = [...this.stats.latencies].sort((a, b) => a - b);
    const index = Math.floor((percentile / 100) * sorted.length);
    return sorted[index];
  }

  printResults() {
    const duration = (Date.now() - this.startTime) / 1000;
    const messagesPerSecond = Math.round(this.stats.messagesSent / duration);
    const successRate = ((this.stats.connected - this.stats.errors) / NUM_CLIENTS * 100).toFixed(2);

    console.log(chalk.blue.bold('\n\n📊 Load Test Results\n'));
    console.log(chalk.white('═'.repeat(50)));
    
    console.log(chalk.green('Connection Stats:'));
    console.log(`  Total Attempted: ${NUM_CLIENTS}`);
    console.log(`  Successfully Connected: ${this.stats.connected}`);
    console.log(`  Disconnected: ${this.stats.disconnected}`);
    console.log(`  Connection Errors: ${this.stats.errors}`);
    console.log(`  Success Rate: ${successRate}%`);
    
    console.log(chalk.green('\nMessage Stats:'));
    console.log(`  Messages Sent: ${this.stats.messagesSent}`);
    console.log(`  Messages Received: ${this.stats.messagesReceived}`);
    console.log(`  Messages/Second: ${messagesPerSecond}`);
    
    if (this.stats.latencies.length > 0) {
      console.log(chalk.green('\nLatency Stats:'));
      console.log(`  Average: ${this.calculateAverageLatency()}ms`);
      console.log(`  Min: ${Math.min(...this.stats.latencies)}ms`);
      console.log(`  Max: ${Math.max(...this.stats.latencies)}ms`);
      console.log(`  P50: ${this.calculatePercentile(50)}ms`);
      console.log(`  P95: ${this.calculatePercentile(95)}ms`);
      console.log(`  P99: ${this.calculatePercentile(99)}ms`);
    }
    
    console.log(chalk.white('\n' + '═'.repeat(50)));
    
    // Performance assessment
    console.log(chalk.yellow.bold('\n🎯 Performance Assessment:'));
    
    if (successRate >= 99 && this.calculateAverageLatency() < 100) {
      console.log(chalk.green.bold('  ✓ EXCELLENT - System handled load very well'));
    } else if (successRate >= 95 && this.calculateAverageLatency() < 200) {
      console.log(chalk.green('  ✓ GOOD - System performed well under load'));
    } else if (successRate >= 90 && this.calculateAverageLatency() < 500) {
      console.log(chalk.yellow('  ⚠ ACCEPTABLE - Some performance degradation'));
    } else {
      console.log(chalk.red('  ✗ POOR - Significant performance issues'));
    }
    
    console.log('\n');
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Check if ws module is installed
try {
  require('ws');
} catch (e) {
  console.error(chalk.red('Please install the ws module: npm install ws'));
  process.exit(1);
}

// Run the test
const tester = new LoadTester();
tester.run().catch(err => {
  console.error(chalk.red('Test failed:', err));
  process.exit(1);
});