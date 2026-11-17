const path = require("path");
const { loadEnv } = require("../loadEnv");

loadEnv();

const username = process.env.BROWSERSTACK_USERNAME;
const accessKey = process.env.BROWSERSTACK_ACCESS_KEY;
const androidApp = process.env.ANDROID_APP || "./apps/NexusDemo.apk";

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
      "appium:app": androidApp,
      "appium:automationName": "UiAutomator2",
      "bstack:options": {
        projectName: "sca-nexus-app-wdio-android",
        buildName: "browserstack-build-1",
        sessionName: "talkback-smoke",
        debug: true,
        networkLogs: true,
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
