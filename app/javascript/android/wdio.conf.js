const path = require("path");
const { loadEnv } = require("../loadEnv");

loadEnv();

const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
const androidApp = path.resolve(
  process.cwd(),
  process.env.ANDROID_APP || path.join(__dirname, "../apps/NexusDemo.apk")
);

if (!username || !accessKey) {
  throw new Error(
    "Missing BROWSERSTACK_USERNAME or BROWSERSTACK_ACCESS_KEY. Copy .env.example to .env and fill them in."
  );
}

// Same shape as TestNG browserstack.yml. linearNavigation:true is required for a
// full Screen Reader Automation report (autoReport alone can leave "Failed to
// generate report" on the dashboard).
const accessibilityOptions = {
  screenReaderAutomationReport: true,
  screenReaderAutomation: {
    autoReport: true,
    linearNavigation: true,
    linearNavigationTimeout: 300000,
  },
  wcagVersion: "wcag22aa",
  scannerProcessingTimeout: 10,
  includeIssueType: {
    bestPractice: false,
  },
};

exports.config = {
  user: username,
  key: accessKey,
  hostname: "hub.browserstack.com",

  specs: [path.join(__dirname, "../test/android/talkback.smoke.js")],
  maxInstances: 1,

  capabilities: [
    {
      platformName: "Android",
      "appium:automationName": "UiAutomator2",
      "bstack:options": {
        deviceName: "Samsung Galaxy S24",
        osVersion: "14.0",
        projectName: "sca-nexus-app-javascript-android",
        buildName: "browserstack-build-1",
        sessionName: "talkback-smoke",
        debug: true,
        networkLogs: true,
        source: "webdriverio:appium-sample-sdk:v1.0",
        accessibility: true,
        accessibilityOptions,
      },
    },
  ],

  logLevel: "info",
  framework: "mocha",
  reporters: ["spec"],
  // Must exceed linearNavigationTimeout so end-of-test appAllyScan can finish.
  connectionRetryTimeout: 600000,
  connectionRetryCount: 2,
  mochaOpts: {
    ui: "bdd",
    timeout: 900000,
  },

  // Cloud Appium on BrowserStack needs no local display.
  autoXvfb: false,

  services: [
    [
      "browserstack",
      {
        app: androidApp,
        accessibility: true,
        accessibilityOptions,
      },
    ],
  ],
};
