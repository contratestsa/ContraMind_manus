/**
 * Vitest setup file for client-side tests
 */

import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Mock localStorage
const localStorageMock = {
  getItem: (key: string) => {
    return (localStorageMock as any)[key] || null;
  },
  setItem: (key: string, value: string) => {
    (localStorageMock as any)[key] = value;
  },
  removeItem: (key: string) => {
    delete (localStorageMock as any)[key];
  },
  clear: () => {
    Object.keys(localStorageMock).forEach((key) => {
      if (key !== "getItem" && key !== "setItem" && key !== "removeItem" && key !== "clear") {
        delete (localStorageMock as any)[key];
      }
    });
  },
};

global.localStorage = localStorageMock as Storage;

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

