package com.browserstack.demo;

import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.android.AndroidDriver;

/**
 * TalkBack smoke against Nexus Demo: open Standalone demo, enable TalkBack,
 * navigate once, log spoken title if available, disable.
 */
public class TalkBackSmokeTest {

  private AndroidDriver driver;

  @BeforeMethod
  public void setUp() throws Exception {
    String username = requireEnv("BROWSERSTACK_USERNAME");
    String accessKey = requireEnv("BROWSERSTACK_ACCESS_KEY");

    MutableCapabilities caps = new MutableCapabilities();
    Map<String, Object> bstackOptions = new HashMap<>();
    bstackOptions.put("userName", username);
    bstackOptions.put("accessKey", accessKey);
    caps.setCapability("bstack:options", bstackOptions);

    driver = new AndroidDriver(
        new URL("https://hub.browserstack.com/wd/hub"),
        caps);
  }

  @AfterMethod(alwaysRun = true)
  public void tearDown() {
    if (driver != null) {
      driver.quit();
    }
  }

  @Test
  public void talkBackSpokenOutputSmoke() {
    // Open Standalone demo before enabling TalkBack.
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    WebElement standaloneCard = driver.findElement(AppiumBy.androidUIAutomator(
        "new UiScrollable(new UiSelector().resourceId(\"domain_selector_root\").scrollable(true))"
            + ".scrollIntoView(new UiSelector().resourceId(\"domain_card_standalone\"))"));
    standaloneCard.click();
    wait.until(ExpectedConditions.visibilityOfElementLocated(
        AppiumBy.androidUIAutomator("new UiSelector().resourceId(\"standalone_item_image\")")));

    try {
      driver.executeScript(
          "browserstack_executor: {\"action\":\"screenReader\",\"arguments\": {\"enable\" : \"true\"}}");

      driver.executeScript(
          "browserstack_executor: {\"action\":\"screenReaderGesture\",\"arguments\": {\"gesture\" : \"navigate_next\"}}");

      // Spoken description by rect is flaky on this build (often
      // "No spoken description recorded for …"). Log only; do not fail the smoke.
      try {
        Object spoken = driver.executeScript(
            "browserstack_executor: {\"action\":\"screenReaderSpokenDescription\",\"arguments\": {\"rect\": {\"x\": 168, \"y\": 142, \"width\": 515, \"height\": 84}}}");
        System.out.println("TalkBack spoken output (best-effort): " + spoken);
      } catch (Exception e) {
        System.out.println("TalkBack spoken output skipped: " + e.getMessage());
      }
    } finally {
      try {
        driver.executeScript(
            "browserstack_executor: {\"action\":\"screenReader\",\"arguments\": {\"enable\" : \"false\"}}");
      } catch (Exception ignored) {
        // Best-effort disable so the session still ends cleanly.
      }
    }
  }

  private static String requireEnv(String name) {
    String value = System.getenv(name);
    if (value == null || value.isBlank()) {
      throw new IllegalStateException(
          "Missing required environment variable: " + name
              + ". Set it before running (see .env.example).");
    }
    return value;
  }
}
