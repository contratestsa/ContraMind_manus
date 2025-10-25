/**
 * RTL (Right-to-Left) Snapshot Tests
 * 
 * Tests to ensure proper RTL layout behavior for Arabic language support.
 * These tests verify that:
 * 1. Layout direction flips correctly
 * 2. Directional icons are mirrored
 * 3. Text alignment follows RTL rules
 */

import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Helper to render with language context
function renderWithLanguage(ui: React.ReactElement, language: "en" | "ar") {
  // Set localStorage before rendering
  localStorage.setItem("language", language);
  
  return render(
    <LanguageProvider>
      {ui}
    </LanguageProvider>
  );
}

describe("RTL Layout Tests", () => {
  it("should render dashboard card with correct RTL direction", () => {
    const { container } = renderWithLanguage(
      <Card>
        <CardHeader>
          <CardTitle>العقود المحللة</CardTitle>
          <CardDescription>نظرة عامة على تحليل العقود</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>المجموع</span>
            <span className="text-2xl font-bold">42</span>
          </div>
        </CardContent>
      </Card>,
      "ar"
    );
    
    // Check that html element has dir="rtl"
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
    expect(document.documentElement.getAttribute("lang")).toBe("ar");
    
    // Snapshot test
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should render navigation with mirrored chevron icons in RTL", () => {
    const { container } = renderWithLanguage(
      <nav className="flex items-center gap-4">
        <Button variant="ghost" className="gap-2">
          <ChevronRight className="rtl-mirror" />
          <span>التالي</span>
        </Button>
        <Button variant="ghost" className="gap-2">
          <span>السابق</span>
          <ArrowLeft className="rtl-mirror" />
        </Button>
      </nav>,
      "ar"
    );
    
    // Check direction
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
    
    // Snapshot test
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should render form with correct RTL text alignment", () => {
    const { container } = renderWithLanguage(
      <form className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-start block">
            الاسم
          </label>
          <input
            id="name"
            type="text"
            className="w-full px-4 py-2 border rounded-md"
            placeholder="أدخل اسمك"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="text-start block">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 border rounded-md ltr-only"
            placeholder="example@email.com"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">إلغاء</Button>
          <Button>
            إرسال
            <ArrowRight className="rtl-mirror ms-2" />
          </Button>
        </div>
      </form>,
      "ar"
    );
    
    // Check direction
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
    expect(document.documentElement.getAttribute("lang")).toBe("ar");
    
    // Snapshot test
    expect(container.firstChild).toMatchSnapshot();
  });
});

describe("LTR Layout Tests (baseline)", () => {
  it("should render dashboard card with LTR direction", () => {
    const { container } = renderWithLanguage(
      <Card>
        <CardHeader>
          <CardTitle>Contracts Analyzed</CardTitle>
          <CardDescription>Overview of contract analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span className="text-2xl font-bold">42</span>
          </div>
        </CardContent>
      </Card>,
      "en"
    );
    
    // Check that html element has dir="ltr"
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    expect(document.documentElement.getAttribute("lang")).toBe("en");
    
    // Snapshot test
    expect(container.firstChild).toMatchSnapshot();
  });
});

