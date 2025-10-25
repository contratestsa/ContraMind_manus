/**
 * useDocumentDirection Hook
 * 
 * Automatically updates the document's dir and lang attributes
 * based on the current i18next language.
 */

import i18n from "@/lib/i18n";
import { useEffect } from "react";

export function useDocumentDirection() {
  useEffect(() => {
    const lng = i18n.language || "en";
    const dir = lng.startsWith("ar") ? "rtl" : "ltr";
    const html = document.documentElement;
    
    if (html.getAttribute("dir") !== dir) {
      html.setAttribute("dir", dir);
    }
    
    if (html.getAttribute("lang") !== lng) {
      html.setAttribute("lang", lng);
    }
  }, []);
  
  // Listen to language changes
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const dir = lng.startsWith("ar") ? "rtl" : "ltr";
      const html = document.documentElement;
      
      if (html.getAttribute("dir") !== dir) {
        html.setAttribute("dir", dir);
      }
      
      if (html.getAttribute("lang") !== lng) {
        html.setAttribute("lang", lng);
      }
    };
    
    i18n.on("languageChanged", handleLanguageChange);
    
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, []);
}

