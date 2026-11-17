# Screen Reader Automation Demo - App A11y - Nexus Demo (WebdriverIO)

TalkBack / VoiceOver smokes for **Nexus Demo** via **WebdriverIO** + Appium + `@wdio/browserstack-service`.

```bash
cp .env.example .env
# set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY
npm install
npm run test:android   # TalkBack  → android/wdio.conf.js
npm run test:ios       # VoiceOver → ios/wdio.conf.js
```

Apps: `./apps/NexusDemo.apk` / `./apps/NexusDemo.ipa`. Prefer the repo GitHub Actions workflow for a no-setup run.

Results: [Screen Reader Automation](https://app-accessibility.browserstack.com/screen-reader-automation) → project `sca-nexus-app-javascript-android` / `sca-nexus-app-javascript-ios`.
