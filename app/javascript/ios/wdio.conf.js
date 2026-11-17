const path = require("path");
const { loadEnv } = require("../loadEnv");

loadEnv();

const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
const iosApp = path.resolve(
  process.cwd(),
  process.env.IOS_APP || path.join(__dirname, "../apps/NexusDemo.ipa")
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

  specs: [path.join(__dirname, "../test/ios/voiceover.smoke.js")],
  maxInstances: 1,

  capabilities: [
    {
      platformName: "iOS",
      "appium:deviceName": "iPhone 16",
      "appium:platformVersion": "18",
      "appium:automationName": "XCUITest",
      "bstack:options": {
        projectName: "sca-nexus-app-javascript-ios",
        buildName: "browserstack-build-1",
        sessionName: "voiceover-smoke",
        debug: true,
        networkLogs: true,
        // Required so VoiceOver executors work.
        voiceOver: true,
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
        app: { path: iosApp },
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
