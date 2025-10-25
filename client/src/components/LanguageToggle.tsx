/**
 * LanguageToggle Component
 * 
 * Provides a button to toggle between English and Arabic languages.
 */

import i18n from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export default function LanguageToggle() {
  const toggle = () => {
    const next = i18n.language?.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(next);
    
    // Persist manually as a fallback
    try {
      localStorage.setItem("i18nextLng", next);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="gap-2"
      title={i18n.language?.startsWith("ar") ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Languages className="size-4" />
      <span className="text-sm">
        {i18n.language?.startsWith("ar") ? "English" : "العربية"}
      </span>
    </Button>
  );
}

