# Screen Reader Automation Demo - App A11y - Nexus Demo (WebdriverIO)

TalkBack / VoiceOver smokes for **Nexus Demo** via WebdriverIO + Appium.

```bash
cp .env.example .env
# set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY
npm install
npm run test:android   # TalkBack
npm run test:ios       # VoiceOver
```

Apps: `./apps/NexusDemo.apk` / `./apps/NexusDemo.ipa`. Prefer the repo GitHub Actions workflow for a no-setup run.
