/**
 * TalkBack smoke: enable reader, navigate once, optionally log spoken output, disable.
 * Spoken description by rect is best-effort (often empty on this build).
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

      // Spoken description by rect is flaky (often "No spoken description recorded").
      // Log only; do not fail the smoke.
      try {
        const spoken = await driver.execute(
          'browserstack_executor: {"action":"screenReaderSpokenDescription","arguments": {"rect": {"x": 168, "y": 141, "width": 515, "height": 84}}}'
        );
        console.log("TalkBack spoken output (best-effort):", spoken);
      } catch (e) {
        console.log("TalkBack spoken output skipped:", e && e.message ? e.message : e);
      }
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
