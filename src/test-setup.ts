import { URL } from 'url';

// Polyfill URL for Node.js environment in tests
// This fixes "TypeError: URL is not a constructor" when running tests in environments
// that usually don't have the global URL constructor available by default or have issues with it.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.URL = URL as any;
