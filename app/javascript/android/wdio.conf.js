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

exports.config = {
  user: username,
  key: accessKey,
  hostname: "hub.browserstack.com",

  specs: [path.join(__dirname, "../test/android/talkback.smoke.js")],
  maxInstances: 1,

  capabilities: [
    {
      platformName: "Android",
      "appium:deviceName": "Samsung Galaxy S24",
      "appium:platformVersion": "14.0",
      "appium:automationName": "UiAutomator2",
      "bstack:options": {
        projectName: "sca-nexus-app-javascript-android",
        buildName: "browserstack-build-1",
        sessionName: "talkback-smoke",
        debug: true,
        networkLogs: true,
        // WDIO App Accessibility sample pattern: also declare on caps.
        accessibility: true,
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

  // Matches BrowserStack WDIO App Accessibility + Screen Reader docs.
  // `app` on the service uploads the local binary and sets appium:app to bs://…
  // Keep screenReaderAutomationReport (WDIO docs) + screenReaderAutomation
  // (generate-report JS tab). Successful CI runs previously logged srAutomation:false
  // with only the nested object, so projects never appeared on the SR dashboard.
  services: [
    [
      "browserstack",
      {
        app: { path: androidApp },
        accessibility: true,
        accessibilityOptions: {
          // Legacy flag called out on the WDIO integrate page.
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
        },
      },
    ],
  ],
};
