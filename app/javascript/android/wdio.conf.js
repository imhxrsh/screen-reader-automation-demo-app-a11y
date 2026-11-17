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

// Mirror BrowserStack's WDIO App Accessibility sample + Screen Reader report flags.
// Docs: integrate-with-app-automate (WDIO) requires screenReaderAutomationReport under
// accessibilityOptions; generate-screen-reader-report also documents screenReaderAutomation.
// Do not place a cwd browserstack.yml here — the CLI path left App sessions at
// srAutomation:false so projects never appeared on Screen Reader Automation.
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
  mochaOpts: {
    ui: "bdd",
    timeout: 600000,
  },

  // Cloud Appium on BrowserStack needs no local display. Leaving autoXvfb on
  // wraps workers in xvfb-run and crashes on ubuntu-latest (write EINVAL).
  autoXvfb: false,

  services: [
    [
      "browserstack",
      {
        // Same shape as BrowserStack's webdriverio-appium-app-browserstack sample.
        app: androidApp,
        accessibility: true,
        accessibilityOptions,
      },
    ],
  ],
};
