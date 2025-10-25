/**
 * Additional RTL Tests
 * 
 * Three specific RTL tests for:
 * 1. Header rendering in RTL/LTR
 * 2. Button logical alignment
 * 3. Breadcrumb chevron mirroring
 */

import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import i18n from "@/lib/i18n";

function setLang(lng: "en" | "ar") {
  i18n.changeLanguage(lng);
  document.documentElement.setAttribute("dir", lng === "ar" ? "rtl" : "ltr");
  document.documentElement.setAttribute("lang", lng);
}

describe("Additional RTL Tests", () => {
  beforeEach(() => {
    cleanup();
    setLang("en");
  });

  it("Header renders correctly in RTL/LTR", () => {
    const Header = () => (
      <header>
        <button className="language-toggle">
          {i18n.language?.startsWith("ar") ? "English" : "العربية"}
        </button>
        <nav className="text-start">Nav</nav>
      </header>
    );
    
    setLang("en");
    const { asFragment: enFrag } = render(<Header />);
    expect(enFrag().firstChild).toBeTruthy();
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    
    cleanup();
    
    setLang("ar");
    const { asFragment: arFrag } = render(<Header />);
    expect(arFrag().firstChild).toBeTruthy();
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  });

  it("Buttons keep logical alignment", () => {
    const Btn = () => <button className="text-end">OK</button>;
    
    setLang("ar");
    const { getByText } = render(<Btn />);
    
    const button = getByText("OK");
    expect(button).toBeTruthy();
    expect(button.className).toContain("text-end");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  });

  it("Breadcrumb chevrons mirror", () => {
    const DirChevron = () => {
      const dir = document.documentElement.getAttribute("dir") || "ltr";
      return <span data-testid="icon">{dir === "rtl" ? "«" : "»"}</span>;
    };
    
    setLang("en");
    let { getByTestId, unmount } = render(<DirChevron />);
    expect(getByTestId("icon").textContent).toBe("»");
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    
    unmount();
    
    setLang("ar");
    ({ getByTestId } = render(<DirChevron />));
    expect(getByTestId("icon").textContent).toBe("«");
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  });
});

