const path = require("path");
const { loadEnv } = require("../loadEnv");

loadEnv();

const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
const iosApp = process.env.IOS_APP || "./apps/NexusDemo.ipa";

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
      "appium:app": iosApp,
      "appium:automationName": "XCUITest",
      "bstack:options": {
        projectName: "sca-nexus-app-wdio-ios",
        buildName: "browserstack-build-1",
        sessionName: "voiceover-smoke",
        debug: true,
        networkLogs: true,
        // Required so VoiceOver executors work.
        voiceOver: true,
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

  // Matches BrowserStack docs JavaScript tab for screenReaderAutomation.
  services: [
    [
      "browserstack",
      {
        accessibility: true,
        accessibilityOptions: {
          screenReaderAutomation: {
            autoReport: true,
            linearNavigation: true,
            linearNavigationTimeout: 300000,
          },
        },
      },
    ],
  ],
};
