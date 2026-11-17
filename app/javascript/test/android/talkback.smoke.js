const assert = require("assert");

/**
 * TalkBack smoke: enable reader, navigate once, capture spoken output, disable.
 * Replace COMPANION blocks only. Do not change executor action names.
 */
describe("TalkBack screen reader smoke", () => {
  it("captures spoken output after navigate_next", async () => {
    // Navigate to the Standalone demo screen before enabling TalkBack.
    const standaloneCard = await $(
      'android=new UiScrollable(new UiSelector().resourceId("domain_selector_root").scrollable(true)).scrollIntoView(new UiSelector().resourceId("domain_card_standalone"))'
    );
    await standaloneCard.waitForDisplayed({ timeout: 30000 });
    await standaloneCard.click();
    await $('android=new UiSelector().resourceId("standalone_item_image")').waitForDisplayed({
      timeout: 30000,
    });

    try {
      await driver.execute(
        'browserstack_executor: {"action":"screenReader","arguments": {"enable" : "true"}}'
      );

      await driver.execute(
        'browserstack_executor: {"action":"screenReaderGesture","arguments": {"gesture" : "navigate_next"}}'
      );

      // Capture speech for the screen title by rect (it has no resourceId). Never XPath.
      const spoken = await driver.execute(
        'browserstack_executor: {"action":"screenReaderSpokenDescription","arguments": {"rect": {"x": 168, "y": 141, "width": 515, "height": 84}}}'
      );

      console.log("TalkBack spoken output:", spoken);
      assert.ok(spoken != null, "Expected screenReaderSpokenDescription to return a value");

      const spokenText = typeof spoken === "string" ? spoken : JSON.stringify(spoken);
      assert.ok(
        spokenText.includes("Standalone demo"),
        `Expected title "Standalone demo" in announcement, got: ${spokenText}`
      );
    } finally {
      try {
        await driver.execute(
          'browserstack_executor: {"action":"screenReader","arguments": {"enable" : "false"}}'
        );
      } catch (_) {
        // Best-effort disable so the session still ends cleanly.
      }
    }
  });
});
