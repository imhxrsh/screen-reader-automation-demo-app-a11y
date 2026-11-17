const path = require("path");
const fs = require("fs");
const https = require("https");
const { remote } = require("webdriverio");
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

const auth = Buffer.from(`${username}:${accessKey}`).toString("base64");

// Upload the local APK to App Automate (or reuse a bs:// id from ANDROID_APP).
function uploadApp(filePath) {
  if (filePath.startsWith("bs://")) {
    return Promise.resolve(filePath);
  }
  return new Promise((resolve, reject) => {
    const boundary = `----bs${Date.now()}`;
    const head = Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${path.basename(
        filePath
      )}"\r\nContent-Type: application/octet-stream\r\n\r\n`
    );
    const tail = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body = Buffer.concat([head, fs.readFileSync(filePath), tail]);
    const req = https.request(
      "https://api-cloud.browserstack.com/app-automate/upload",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": `multipart/form-data; boundary=${boundary}`,
          "Content-Length": body.length,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (!json.app_url) {
              return reject(new Error(`Upload failed: ${data}`));
            }
            resolve(json.app_url);
          } catch (e) {
            reject(new Error(`Upload failed: ${data}`));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Capabilities per BrowserStack "Auto-generate screen reader accessibility reports"
// (plain Node.js / Appium session, no WDIO runner or browserstack service).
function buildCapabilities(appUrl) {
  return {
    platformName: "Android",
    "appium:automationName": "UiAutomator2",
    "appium:app": appUrl,
    "bstack:options": {
      userName: username,
      accessKey,
      deviceName: "Samsung Galaxy S24",
      osVersion: "14.0",
      projectName: "sca-nexus-app-javascript-android",
      buildName: "browserstack-build-1",
      sessionName: "talkback-smoke",
      debug: true,
      networkLogs: true,
      source: "nodejs:appium-sample-sdk:v1.0",
      accessibility: true,
      accessibilityOptions: {
        screenReaderAutomation: {
          autoReport: true,
          // Standard mode (viewport only); linear navigation can exceed timeouts.
          linearNavigation: false,
        },
        wcagVersion: "wcag22aa",
        scannerProcessingTimeout: 10,
        includeIssueType: { bestPractice: false },
      },
    },
  };
}

async function exec(driver, payload) {
  return driver.execute(`browserstack_executor: ${JSON.stringify(payload)}`);
}

async function main() {
  const appUrl = await uploadApp(androidApp);
  console.log("App:", appUrl);

  const driver = await remote({
    protocol: "https",
    hostname: "hub.browserstack.com",
    port: 443,
    path: "/wd/hub",
    user: username,
    key: accessKey,
    logLevel: "warn",
    connectionRetryTimeout: 240000,
    connectionRetryCount: 2,
    capabilities: buildCapabilities(appUrl),
  });

  console.log("Session ID:", driver.sessionId);
  let status = "passed";
  let reason = "TalkBack smoke passed";

  try {
    // Navigate to the Standalone demo screen before enabling TalkBack.
    const standaloneCard = await driver.$(
      'android=new UiScrollable(new UiSelector().resourceId("domain_selector_root").scrollable(true)).scrollIntoView(new UiSelector().resourceId("domain_card_standalone"))'
    );
    await standaloneCard.waitForDisplayed({ timeout: 30000 });
    await standaloneCard.click();
    await driver
      .$('android=new UiSelector().resourceId("standalone_item_image")')
      .waitForDisplayed({ timeout: 30000 });

    try {
      await exec(driver, { action: "screenReader", arguments: { enable: "true" } });
      await exec(driver, {
        action: "screenReaderGesture",
        arguments: { gesture: "navigate_next" },
      });

      // Spoken description by rect is best-effort (often empty on this build).
      try {
        const spoken = await exec(driver, {
          action: "screenReaderSpokenDescription",
          arguments: { rect: { x: 168, y: 141, width: 515, height: 84 } },
        });
        console.log("TalkBack spoken output (best-effort):", spoken);
      } catch (e) {
        console.log("TalkBack spoken output skipped:", e && e.message ? e.message : e);
      }
    } finally {
      try {
        await exec(driver, { action: "screenReader", arguments: { enable: "false" } });
      } catch (_) {
        // Best-effort disable so the session still ends cleanly.
      }
    }
  } catch (err) {
    status = "failed";
    reason = err && err.message ? err.message : String(err);
    process.exitCode = 1;
    console.error("TalkBack smoke failed:", reason);
  } finally {
    try {
      await exec(driver, {
        action: "setSessionStatus",
        arguments: { status, reason: reason.slice(0, 250) },
      });
    } catch (_) {
      // Status marking is best-effort.
    }
    await driver.deleteSession();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
