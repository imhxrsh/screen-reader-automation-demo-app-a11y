const assert = require("assert");

/**
 * VoiceOver smoke: toggle on, navigate once, capture spoken output, toggle off.
 * Only one VoiceOver executor at a time. Replace COMPANION blocks only.
 */
describe("VoiceOver screen reader smoke", () => {
  it("captures spokenDescription after navigate_next", async () => {
    // Navigate to the Standalone demo screen before enabling VoiceOver.
    const standaloneButton = await $("~Standalone demo, Test features without the full flow");
    await standaloneButton.waitForDisplayed({ timeout: 30000 });
    await standaloneButton.click();
    await $("~1, Image injection, Camera still capture").waitForDisplayed({ timeout: 30000 });

    try {
      // First voiceOverToggle on can take longer than later calls.
      await driver.execute(
        'browserstack_executor: {"action": "voiceOverToggle", "arguments": {"state": "on"}}'
      );

      await driver.execute(
        'browserstack_executor: {"action": "voiceOverGesture", "arguments": {"gesture": "navigate_next"}}'
      );

      const result = await driver.execute(
        'browserstack_executor: {"action": "getVoiceOverElement", "arguments": {}}'
      );

      console.log("VoiceOver element result:", result);
      assert.ok(result != null, "Expected getVoiceOverElement to return a value");

      const spokenDescription =
        result && typeof result === "object" ? result.spokenDescription : undefined;
      console.log("VoiceOver spokenDescription:", spokenDescription);

      assert.ok(spokenDescription, "Expected a non-empty spokenDescription");
      // navigate_next from the Standalone demo screen focuses its first element (observed label).
      assert.strictEqual(
        result.element && result.element.label,
        "Network Status",
        `Expected focused element label "Network Status", got: ${JSON.stringify(result.element)}`
      );
    } finally {
      try {
        await driver.execute(
          'browserstack_executor: {"action": "voiceOverToggle", "arguments": {"state": "off"}}'
        );
      } catch (_) {
        // Best-effort disable so the session still ends cleanly.
      }
    }
  });
});
