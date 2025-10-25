/**
 * RTL Demonstration Component
 * 
 * Shows how RTL/LTR support works in the application.
 * This component demonstrates:
 * - Automatic direction switching
 * - Icon mirroring
 * - Text alignment
 * - Logical properties
 */

import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, ArrowRight, ArrowLeft, Languages } from "lucide-react";

export function RTLDemo() {
  const { language, setLanguage, direction, t } = useLanguage();
  
  return (
    <div className="container py-8 space-y-6">
      {/* Language Switcher */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="size-5" />
            {language === "en" ? "Language & Direction" : "اللغة والاتجاه"}
          </CardTitle>
          <CardDescription>
            {language === "en" 
              ? "Current direction: " + direction.toUpperCase()
              : "الاتجاه الحالي: " + (direction === "rtl" ? "من اليمين إلى اليسار" : "من اليسار إلى اليمين")
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button 
            variant={language === "en" ? "default" : "outline"}
            onClick={() => setLanguage("en")}
          >
            English (LTR)
          </Button>
          <Button 
            variant={language === "ar" ? "default" : "outline"}
            onClick={() => setLanguage("ar")}
          >
            العربية (RTL)
          </Button>
        </CardContent>
      </Card>

      {/* Icon Mirroring Demo */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Icon Mirroring" : "عكس الأيقونات"}
          </CardTitle>
          <CardDescription>
            {language === "en" 
              ? "Directional icons automatically mirror in RTL mode"
              : "تنعكس الأيقونات الاتجاهية تلقائياً في وضع RTL"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <ChevronLeft className="rtl-mirror" />
              {language === "en" ? "Previous" : "السابق"}
            </Button>
            <Button variant="outline" className="gap-2">
              {language === "en" ? "Next" : "التالي"}
              <ChevronRight className="rtl-mirror" />
            </Button>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="rtl-mirror" />
              {language === "en" ? "Back" : "رجوع"}
            </Button>
            <Button variant="outline" className="gap-2">
              {language === "en" ? "Forward" : "إلى الأمام"}
              <ArrowRight className="rtl-mirror" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Text Alignment Demo */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Text Alignment" : "محاذاة النص"}
          </CardTitle>
          <CardDescription>
            {language === "en" 
              ? "Text automatically aligns to the start/end based on direction"
              : "يتم محاذاة النص تلقائياً إلى البداية/النهاية بناءً على الاتجاه"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-md">
            <p className="text-start font-medium">
              {language === "en" 
                ? "This text is aligned to the start (left in LTR, right in RTL)"
                : "هذا النص محاذٍ إلى البداية (يسار في LTR، يمين في RTL)"
              }
            </p>
          </div>
          
          <div className="p-4 bg-muted rounded-md">
            <p className="text-end font-medium">
              {language === "en" 
                ? "This text is aligned to the end (right in LTR, left in RTL)"
                : "هذا النص محاذٍ إلى النهاية (يمين في LTR، يسار في RTL)"
              }
            </p>
          </div>
          
          <div className="p-4 bg-muted rounded-md">
            <p className="text-center font-medium">
              {language === "en" 
                ? "This text is centered (same in both directions)"
                : "هذا النص في المنتصف (نفس الشيء في كلا الاتجاهين)"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Layout Demo */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Layout Direction" : "اتجاه التخطيط"}
          </CardTitle>
          <CardDescription>
            {language === "en" 
              ? "Flexbox and grid layouts automatically reverse in RTL"
              : "تنعكس تخطيطات Flexbox و Grid تلقائياً في RTL"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 p-4 bg-primary/10 rounded-md text-center">
              {language === "en" ? "First" : "الأول"}
            </div>
            <div className="flex-1 p-4 bg-primary/20 rounded-md text-center">
              {language === "en" ? "Second" : "الثاني"}
            </div>
            <div className="flex-1 p-4 bg-primary/30 rounded-md text-center">
              {language === "en" ? "Third" : "الثالث"}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Example */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === "en" ? "Implementation" : "التنفيذ"}
          </CardTitle>
          <CardDescription>
            {language === "en" 
              ? "How to use RTL support in your components"
              : "كيفية استخدام دعم RTL في مكوناتك"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md overflow-x-auto ltr-only text-sm">
{`// Use logical properties in CSS
.container {
  margin-inline: auto;
  padding-inline: 1rem;
}

// Use RTL-aware classes
<div className="text-start">Start-aligned text</div>
<ChevronRight className="rtl-mirror" />

// Use the useLanguage hook
const { language, direction } = useLanguage();`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}

