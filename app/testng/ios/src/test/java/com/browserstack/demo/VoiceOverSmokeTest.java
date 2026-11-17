package com.browserstack.demo;

import java.net.URL;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.ios.IOSDriver;

/**
 * VoiceOver smoke against Nexus Demo: open Standalone demo, enable VoiceOver,
 * navigate once, assert focused element, disable. One VoiceOver executor at a time.
 */
public class VoiceOverSmokeTest {

  private IOSDriver driver;

  @BeforeMethod
  public void setUp() throws Exception {
    String username = requireEnv("BROWSERSTACK_USERNAME");
    String accessKey = requireEnv("BROWSERSTACK_ACCESS_KEY");

    MutableCapabilities caps = new MutableCapabilities();
    Map<String, Object> bstackOptions = new HashMap<>();
    bstackOptions.put("userName", username);
    bstackOptions.put("accessKey", accessKey);
    // Required so VoiceOver executors work (docs: iPhone 16 / OS 18).
    bstackOptions.put("deviceName", "iPhone 16");
    bstackOptions.put("osVersion", "18");
    bstackOptions.put("voiceOver", true);
    caps.setCapability("bstack:options", bstackOptions);

    driver = new IOSDriver(
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
  @SuppressWarnings("unchecked")
  public void voiceOverSpokenOutputSmoke() {
    // Open Standalone demo before enabling VoiceOver.
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(30));
    wait.until(ExpectedConditions.elementToBeClickable(
        AppiumBy.accessibilityId("Standalone demo, Test features without the full flow"))).click();
    wait.until(ExpectedConditions.visibilityOfElementLocated(
        AppiumBy.accessibilityId("1, Image injection, Camera still capture")));

    try {
      // First voiceOverToggle on can take longer than later calls.
      driver.executeScript(
          "browserstack_executor: {\"action\": \"voiceOverToggle\", \"arguments\": {\"state\": \"on\"}}");

      driver.executeScript(
          "browserstack_executor: {\"action\": \"voiceOverGesture\", \"arguments\": {\"gesture\": \"navigate_next\"}}");

      Object result = driver.executeScript(
          "browserstack_executor: {\"action\": \"getVoiceOverElement\", \"arguments\": {}}");

      System.out.println("VoiceOver element result: " + result);
      Assert.assertNotNull(result, "Expected getVoiceOverElement to return a value");

      String spokenDescription = null;
      if (result instanceof Map) {
        Object spoken = ((Map<String, Object>) result).get("spokenDescription");
        if (spoken != null) {
          spokenDescription = String.valueOf(spoken);
        }
      }
      System.out.println("VoiceOver spokenDescription: " + spokenDescription);

      Assert.assertNotNull(spokenDescription, "Expected spokenDescription in getVoiceOverElement result");
      Assert.assertFalse(spokenDescription.isBlank(), "Expected a non-empty spokenDescription");

      // navigate_next from Standalone demo focuses its first element (observed label).
      Object element = ((Map<String, Object>) result).get("element");
      Assert.assertTrue(element instanceof Map, "Expected element map in getVoiceOverElement result");
      Assert.assertEquals(String.valueOf(((Map<String, Object>) element).get("label")), "Network Status",
          "Unexpected focused element: " + element);
    } finally {
      try {
        driver.executeScript(
            "browserstack_executor: {\"action\": \"voiceOverToggle\", \"arguments\": {\"state\": \"off\"}}");
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
