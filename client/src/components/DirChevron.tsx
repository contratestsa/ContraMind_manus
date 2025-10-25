/**
 * DirChevron Component
 * 
 * Renders the appropriate chevron icon based on the current text direction.
 * In RTL mode, ChevronLeft is used; in LTR mode, ChevronRight is used.
 */

import { ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";

interface DirChevronProps {
  className?: string;
}

export function DirChevron({ className }: DirChevronProps) {
  const [dir, setDir] = useState<"ltr" | "rtl">(
    document?.documentElement?.getAttribute("dir") as "ltr" | "rtl" || "ltr"
  );
  
  useEffect(() => {
    // Watch for direction changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "dir") {
          const newDir = document.documentElement.getAttribute("dir") as "ltr" | "rtl";
          setDir(newDir || "ltr");
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    
    return () => observer.disconnect();
  }, []);
  
  const Icon = dir === "rtl" ? ChevronLeft : ChevronRight;
  
  return <Icon aria-hidden className={className} />;
}

/**
 * DirChevronBack Component
 * 
 * Renders a back chevron that points in the correct direction.
 * In RTL mode, ChevronRight is used; in LTR mode, ChevronLeft is used.
 */
export function DirChevronBack({ className }: DirChevronProps) {
  const [dir, setDir] = useState<"ltr" | "rtl">(
    document?.documentElement?.getAttribute("dir") as "ltr" | "rtl" || "ltr"
  );
  
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "dir") {
          const newDir = document.documentElement.getAttribute("dir") as "ltr" | "rtl";
          setDir(newDir || "ltr");
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });
    
    return () => observer.disconnect();
  }, []);
  
  const Icon = dir === "rtl" ? ChevronRight : ChevronLeft;
  
  return <Icon aria-hidden className={className} />;
}

