# Screen Reader Automation Demo - App A11y - Nexus Demo

BrowserStack **App Accessibility** sample for **Screen Reader Automation** on the **Nexus Demo** app (Android TalkBack + iOS VoiceOver).

Four runnable suites, same product flow:

| Suite | Language / framework | Platform | Screen reader |
| --- | --- | --- | --- |
| `testng-android` | Java + TestNG + Appium | Android | TalkBack |
| `testng-ios` | Java + TestNG + Appium | iOS | VoiceOver |
| `javascript-android` | JavaScript + WebdriverIO + Appium | Android | TalkBack |
| `javascript-ios` | JavaScript + WebdriverIO + Appium | iOS | VoiceOver |

Each run launches **Nexus Demo**, opens **Standalone demo**, drives the native screen reader, asserts spoken / focus output, and generates a Screen Reader report on BrowserStack.

**Requires BrowserStack Ultimate** (App Accessibility screen reader automation).

---

## Recommended: GitHub Actions

No local Java/Node setup needed. Use the repo on GitHub and run from Actions.

### 1. Add BrowserStack secrets (once)

Credentials must be **repository secrets**. Do not paste them into workflow inputs — GitHub prints `workflow_dispatch` input values in the step `env:` dump, so `::add-mask::` cannot hide them.

1. Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
2. Add:
   - `BROWSERSTACK_USERNAME`
   - `BROWSERSTACK_ACCESS_KEY`

### 2. Start a run

1. **Actions** → **Screen Reader Automation Demo - App A11y - Nexus Demo** → **Run workflow**
2. Pick a **Suite** from the table below → **Run workflow**

Workflow: [`.github/workflows/screen-reader.yml`](.github/workflows/screen-reader.yml)

| Suite value | Runs |
| --- | --- |
| `testng-android` | TestNG + Android (TalkBack) |
| `testng-ios` | TestNG + iOS (VoiceOver) |
| `javascript-android` | WebdriverIO + Android (TalkBack) |
| `javascript-ios` | WebdriverIO + iOS (VoiceOver) |

Nexus Demo binaries are already in the repo (`apps/NexusDemo.apk` / `apps/NexusDemo.ipa`).

### 3. View results

1. Open the finished workflow run → **Summary** (pass/fail + project name)  
2. Open [App Accessibility](https://app-accessibility.browserstack.com/)  
3. Select the project for your suite → build `browserstack-build-1` → **Screen Reader** report  

| Suite | BrowserStack project |
| --- | --- |
| `testng-android` | `sca-nexus-app-testng-android` |
| `testng-ios` | `sca-nexus-app-testng-ios` |
| `javascript-android` | `sca-nexus-app-wdio-android` |
| `javascript-ios` | `sca-nexus-app-wdio-ios` |

Repo secrets are auto-redacted in Actions logs (shown as `***`).

---

## Alternative: run locally

### Prerequisites

| Suite | Need |
| --- | --- |
| TestNG | Java 11+, Maven, BrowserStack username + access key |
| JavaScript | Node.js 18+, npm, BrowserStack username + access key |

```bash
git clone <this-repo-url>
cd sca-nexus
```

### TestNG - Android (TalkBack)

```bash
cd app/testng/android
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
mvn test
```

### TestNG - iOS (VoiceOver)

```bash
cd app/testng/ios
export BROWSERSTACK_USERNAME="your_username"
export BROWSERSTACK_ACCESS_KEY="your_access_key"
mvn test
```

### WebdriverIO - Android or iOS

```bash
cd app/javascript
cp .env.example .env
# set BROWSERSTACK_USERNAME and BROWSERSTACK_ACCESS_KEY in .env
npm install
npm run test:android   # TalkBack
npm run test:ios       # VoiceOver
```

Do not commit `.env` (gitignored).

---

## Repo layout

```text
.github/workflows/screen-reader.yml   # recommended CI entrypoint
app/testng/android/                   # Nexus Demo - TestNG - Android / TalkBack
app/testng/ios/                       # Nexus Demo - TestNG - iOS / VoiceOver
app/javascript/                       # Nexus Demo - WebdriverIO - Android + iOS
```

---

## Smoke flow

1. Launch **Nexus Demo** on a real BrowserStack device  
2. Open **Standalone demo**  
3. Enable TalkBack or VoiceOver  
4. `navigate_next` once  
5. Assert spoken output / focused element  
6. Disable the screen reader  

Devices: **Samsung Galaxy S24 / Android 14**, **iPhone 16 / iOS 18** (`voiceOver: true`).

---

## Docs

- [Auto-generate screen reader accessibility reports](https://www.browserstack.com/docs/app-accessibility/screen-reader-automation/generate-screen-reader-report)  
- [Use executors to test screen reader interactions](https://www.browserstack.com/docs/app-accessibility/screen-reader-automation/get-started-with-screen-reader-automation)  
