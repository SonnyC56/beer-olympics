module.exports = {
  launch: {
    headless: process.env.CI !== undefined,
    slowMo: process.env.CI ? 0 : 50,
    devtools: !process.env.CI,
    defaultViewport: {
      width: 1280,
      height: 720
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  },
  server: {
    command: 'npm run dev',
    port: 5173,
    launchTimeout: 30000,
    debug: true
  }
};