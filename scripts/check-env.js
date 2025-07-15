#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Validates that all required environment variables are set before deployment
 */

const chalk = require('chalk');

const requiredEnvVars = {
  // Authentication
  GOOGLE_CLIENT_ID: 'Google OAuth Client ID',
  GOOGLE_CLIENT_SECRET: 'Google OAuth Client Secret',
  AUTH_SECRET: 'Authentication secret (generate with: openssl rand -base64 32)',
  
  // Database
  COUCHBASE_URL: 'Couchbase server URL',
  COUCHBASE_BUCKET: 'Couchbase bucket name',
  COUCHBASE_USERNAME: 'Couchbase username',
  COUCHBASE_PASSWORD: 'Couchbase password',
  
  // Redis
  REDIS_URL: 'Redis connection URL',
  
  // Real-time
  PUSHER_APP_ID: 'Pusher App ID',
  PUSHER_KEY: 'Pusher Key',
  PUSHER_SECRET: 'Pusher Secret',
  PUSHER_CLUSTER: 'Pusher Cluster',
  
  // Media Storage
  CLOUDINARY_CLOUD_NAME: 'Cloudinary Cloud Name',
  CLOUDINARY_API_KEY: 'Cloudinary API Key',
  CLOUDINARY_API_SECRET: 'Cloudinary API Secret'
};

const optionalEnvVars = {
  // Redis
  REDIS_PASSWORD: 'Redis password (if required)',
  
  // Features
  VITE_ENABLE_SCALABLE_WS: 'Enable scalable WebSocket (true/false)',
  VITE_ENABLE_OFFLINE_MODE: 'Enable offline mode (true/false)',
  
  // Monitoring
  SENTRY_DSN: 'Sentry error tracking DSN',
  LOGFLARE_API_KEY: 'LogFlare API key for logging',
  
  // Analytics
  GA_TRACKING_ID: 'Google Analytics tracking ID',
  
  // Email
  SENDGRID_API_KEY: 'SendGrid API key for emails',
  EMAIL_FROM: 'From email address'
};

console.log(chalk.blue.bold('\n🔍 Checking Environment Variables...\n'));

let hasErrors = false;
let hasWarnings = false;

// Check required variables
console.log(chalk.yellow.bold('Required Variables:'));
Object.entries(requiredEnvVars).forEach(([key, description]) => {
  if (process.env[key]) {
    // Don't show the actual value for security
    const maskedValue = key.includes('SECRET') || key.includes('PASSWORD') 
      ? '********' 
      : process.env[key].substring(0, 4) + '****';
    console.log(chalk.green(`  ✓ ${key}: ${maskedValue} (${description})`));
  } else {
    console.log(chalk.red(`  ✗ ${key}: NOT SET (${description})`));
    hasErrors = true;
  }
});

console.log('\n' + chalk.yellow.bold('Optional Variables:'));
Object.entries(optionalEnvVars).forEach(([key, description]) => {
  if (process.env[key]) {
    const maskedValue = key.includes('SECRET') || key.includes('PASSWORD') || key.includes('KEY')
      ? '********' 
      : process.env[key].substring(0, 4) + '****';
    console.log(chalk.green(`  ✓ ${key}: ${maskedValue} (${description})`));
  } else {
    console.log(chalk.gray(`  - ${key}: not set (${description})`));
    hasWarnings = true;
  }
});

// Check for common issues
console.log('\n' + chalk.yellow.bold('Configuration Checks:'));

// Check AUTH_SECRET length
if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length < 32) {
  console.log(chalk.red('  ✗ AUTH_SECRET should be at least 32 characters'));
  hasErrors = true;
} else if (process.env.AUTH_SECRET) {
  console.log(chalk.green('  ✓ AUTH_SECRET length is sufficient'));
}

// Check Pusher cluster format
if (process.env.PUSHER_CLUSTER && !process.env.PUSHER_CLUSTER.match(/^[a-z]{2}\d$/)) {
  console.log(chalk.red('  ✗ PUSHER_CLUSTER format should be like "us2" or "eu1"'));
  hasErrors = true;
} else if (process.env.PUSHER_CLUSTER) {
  console.log(chalk.green('  ✓ PUSHER_CLUSTER format is valid'));
}

// Check Redis URL format
if (process.env.REDIS_URL && !process.env.REDIS_URL.startsWith('redis://')) {
  console.log(chalk.red('  ✗ REDIS_URL should start with redis://'));
  hasErrors = true;
} else if (process.env.REDIS_URL) {
  console.log(chalk.green('  ✓ REDIS_URL format is valid'));
}

// Check OAuth redirect URI
if (process.env.VITE_APP_URL || process.env.VERCEL_URL) {
  const appUrl = process.env.VITE_APP_URL || `https://${process.env.VERCEL_URL}`;
  console.log(chalk.blue(`\n  ℹ OAuth Redirect URI should be: ${appUrl}/api/auth/callback/google`));
}

// Summary
console.log('\n' + chalk.blue.bold('Summary:'));
if (hasErrors) {
  console.log(chalk.red.bold('  ✗ Environment check FAILED - Missing required variables'));
  console.log(chalk.red('  Please set all required environment variables before deployment.\n'));
  process.exit(1);
} else if (hasWarnings) {
  console.log(chalk.yellow.bold('  ⚠ Environment check PASSED with warnings'));
  console.log(chalk.yellow('  Some optional features may not be available.\n'));
} else {
  console.log(chalk.green.bold('  ✓ Environment check PASSED'));
  console.log(chalk.green('  All environment variables are properly configured!\n'));
}

// Additional tips
console.log(chalk.cyan.bold('💡 Tips:'));
console.log(chalk.cyan('  - Use "vercel env add [KEY] production" to add variables to Vercel'));
console.log(chalk.cyan('  - Generate AUTH_SECRET with: openssl rand -base64 32'));
console.log(chalk.cyan('  - Keep .env files out of version control'));
console.log(chalk.cyan('  - Use different values for development and production\n'));