/**
 * RTL (Right-to-Left) Support Utilities
 * 
 * Provides utilities for handling bidirectional text and layout
 * for Arabic language support.
 */

import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Icons that should be mirrored in RTL mode
 */
const MIRRORED_ICONS = [
  "ChevronLeft",
  "ChevronRight",
  "ArrowLeft",
  "ArrowRight",
  "ArrowBigLeft",
  "ArrowBigRight",
  "ChevronsLeft",
  "ChevronsRight",
  "MoveLeft",
  "MoveRight",
  "CornerDownLeft",
  "CornerDownRight",
  "CornerUpLeft",
  "CornerUpRight",
  "CornerLeftDown",
  "CornerLeftUp",
  "CornerRightDown",
  "CornerRightUp",
];

/**
 * Hook to get RTL-aware icon mirroring class
 * 
 * Usage:
 * ```tsx
 * const { getMirrorClass } = useRTL();
 * <ChevronRight className={getMirrorClass("ChevronRight")} />
 * ```
 */
export function useRTL() {
  const { direction } = useLanguage();
  
  const getMirrorClass = (iconName: string): string => {
    if (direction === "rtl" && MIRRORED_ICONS.includes(iconName)) {
      return "rtl:scale-x-[-1]";
    }
    return "";
  };
  
  const isRTL = direction === "rtl";
  
  return {
    direction,
    isRTL,
    getMirrorClass,
  };
}

/**
 * Utility function to get directional class names
 * Converts left/right to start/end based on direction
 * 
 * Usage:
 * ```tsx
 * <div className={dir("ml-4", "mr-4")}>
 * // In LTR: ml-4
 * // In RTL: mr-4
 * ```
 */
export function useDirectionalClass() {
  const { direction } = useLanguage();
  
  return (ltrClass: string, rtlClass?: string): string => {
    if (direction === "rtl" && rtlClass) {
      return rtlClass;
    }
    return ltrClass;
  };
}

/**
 * CSS class to mirror elements in RTL
 */
export const RTL_MIRROR_CLASS = "[dir='rtl']_&:scale-x-[-1]";

/**
 * Get text alignment class that respects RTL
 */
export function useTextAlign() {
  const { direction } = useLanguage();
  
  return {
    start: direction === "rtl" ? "text-right" : "text-left",
    end: direction === "rtl" ? "text-left" : "text-right",
  };
}

