// Browser-compatible URL polyfill for test environment
// This file is loaded by Vitest setupFiles and only runs in test context
import { URL, URLSearchParams } from 'whatwg-url';

// Polyfill URL for test environment (jsdom may not have URL constructor)
// Check if we're in a Node.js-like environment and URL doesn't exist
if (typeof global !== 'undefined') {
  if (!global.URL) {
    (global as any).URL = URL;
  }
  if (!global.URLSearchParams) {
    (global as any).URLSearchParams = URLSearchParams;
  }
}

// Also polyfill for window object if it exists (browser-like environment)
if (typeof window !== 'undefined') {
  if (!window.URL) {
    (window as any).URL = URL;
  }
  if (!window.URLSearchParams) {
    (window as any).URLSearchParams = URLSearchParams;
  }
}

