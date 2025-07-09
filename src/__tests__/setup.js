// Import the server instance from our mocks
import { server } from './mocks/server';

// Establish API mocking before all tests.
beforeAll(() => {
  // Enable the mocking in tests.
  server.listen();
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});

// Clean up after the tests are finished.
afterAll(() => {
  server.close();
});

// Mock window.scrollTo
window.scrollTo = () => {};
