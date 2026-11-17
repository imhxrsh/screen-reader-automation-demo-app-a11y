# Screen Reader Automation Demo - App A11y - Nexus Demo (JavaScript)

TalkBack / VoiceOver smokes for **Nexus Demo**.

- **Android:** plain Node.js script (`android/run.js`) — Appium session via the `webdriverio` client, no WDIO runner / BrowserStack service.
- **iOS:** WebdriverIO + Appium (VoiceOver executors).

```bash
cp .env.example .env
# set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY
npm install
npm run test:android   # TalkBack
npm run test:ios       # VoiceOver
```

Apps: `./apps/NexusDemo.apk` / `./apps/NexusDemo.ipa`. Prefer the repo GitHub Actions workflow for a no-setup run.
