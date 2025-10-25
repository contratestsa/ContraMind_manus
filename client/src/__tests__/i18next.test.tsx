/**
 * i18next Integration Tests
 * 
 * Tests to verify i18next is properly configured and working with RTL support.
 */

import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";

// Test component that uses i18next
function TestComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t("appName")}</h1>
      <p data-testid="language">{i18n.language}</p>
      <p data-testid="direction">{i18n.language?.startsWith("ar") ? "rtl" : "ltr"}</p>
    </div>
  );
}

describe("i18next Integration", () => {
  beforeEach(() => {
    // Reset to English before each test
    i18n.changeLanguage("en");
    localStorage.clear();
  });

  it("should initialize with English as default language", () => {
    expect(i18n.language).toBe("en");
  });

  it("should have translation resources loaded", () => {
    expect(i18n.hasResourceBundle("en", "translation")).toBe(true);
    expect(i18n.hasResourceBundle("ar", "translation")).toBe(true);
  });

  it("should translate English app name correctly", () => {
    const translation = i18n.t("appName");
    expect(translation).toBe("ContraMind.ai");
  });

  it("should translate Arabic app name correctly", async () => {
    await i18n.changeLanguage("ar");
    const translation = i18n.t("appName");
    expect(translation).toBe("كونترا مايند");
  });

  it("should change language from English to Arabic", async () => {
    expect(i18n.language).toBe("en");
    await i18n.changeLanguage("ar");
    expect(i18n.language).toBe("ar");
  });

  it("should detect RTL direction for Arabic", async () => {
    await i18n.changeLanguage("ar");
    const isRTL = i18n.language?.startsWith("ar");
    expect(isRTL).toBe(true);
  });

  it("should detect LTR direction for English", () => {
    const isRTL = i18n.language?.startsWith("ar");
    expect(isRTL).toBe(false);
  });

  it("should have all required translation keys", () => {
    const requiredKeys = [
      "appName",
      "nav.dashboard",
      "nav.contracts",
      "dashboard.title",
      "contracts.title",
      "upload.title",
    ];

    requiredKeys.forEach((key) => {
      const enTranslation = i18n.t(key, { lng: "en" });
      const arTranslation = i18n.t(key, { lng: "ar" });
      
      expect(enTranslation).not.toBe(key);
      expect(arTranslation).not.toBe(key);
      expect(enTranslation).not.toBe(arTranslation);
    });
  });

  it("should render component with English translations", () => {
    const { container } = render(<TestComponent />);
    expect(container.textContent).toContain("ContraMind.ai");
    expect(screen.getByTestId("language")).toBeTruthy();
    expect(screen.getByTestId("direction")).toBeTruthy();
  });

  it("should render component with Arabic translations", async () => {
    cleanup(); // Clean up any previous renders
    await i18n.changeLanguage("ar");
    const { container } = render(<TestComponent />);
    expect(container.textContent).toContain("كونترا مايند");
    expect(screen.getByTestId("language")).toBeTruthy();
    expect(screen.getByTestId("direction")).toBeTruthy();
  });
});

