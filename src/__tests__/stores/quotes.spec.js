import { describe, it, expect, beforeEach, afterEach, vi, beforeAll, afterAll } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useQuotesStore } from '../../stores/quotes'
import { server, resetServerState, getServerState } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock environment variables
vi.mock('../../config/jsonbin.js', () => ({
  JSONBIN_CONFIG: {
    BASE_URL: 'https://api.jsonbin.io/v3/b',
    API_KEY: 'test-api-key',
    BIN_ID: 'test-bin-id'
  },
  getHeaders: () => ({
    'Content-Type': 'application/json',
    'X-Master-Key': 'test-api-key',
    'X-Bin-Name': 'Test Quotes'
  })
}))

// Set environment variables for testing
process.env.VITE_JSONBIN_API_KEY = 'test-api-key'
process.env.VITE_JSONBIN_BIN_ID = 'test-bin-id'

describe('Quotes Store', () => {
  let store

  // Start server before all tests
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  // Reset server state and set up Pinia before each test
  beforeEach(() => {
    resetServerState()
    setActivePinia(createPinia())
    store = useQuotesStore()
    // Load initial quotes before each test
    return store.loadQuotes()
  })

  // Reset any request handlers and clean up after each test
  afterEach(() => {
    vi.clearAllMocks()
    server.resetHandlers()
  })

  // Close server after all tests
  afterAll(() => {
    server.close()
  })

  describe('loadQuotes', () => {
    it('should load quotes from the API', async () => {
      // Act
      const result = await store.loadQuotes()
      
      // Assert
      expect(store.quotes).toHaveLength(2)
      expect(store.quotes[0].text).toBe('Test quote 1')
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(result).toEqual(store.quotes)
    })

    it('should handle 404 by returning empty array when bin does not exist', async () => {
      // Arrange
      const originalBinId = process.env.VITE_JSONBIN_BIN_ID
      process.env.VITE_JSONBIN_BIN_ID = 'non-existent-bin'
      
      // Act
      const result = await store.loadQuotes()
      
      // Assert
      expect(store.quotes).toHaveLength(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      expect(result).toEqual([])
      
      // Clean up
      process.env.VITE_JSONBIN_BIN_ID = originalBinId
    })

    it('should handle API errors', async () => {
      // Arrange
      server.use(
        http.get('https://api.jsonbin.io/v3/b/:binId/latest', () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          )
        })
      )
      
      // Act
      const result = await store.loadQuotes()
      
      // Assert
      expect(store.quotes).toHaveLength(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toContain('Failed to load quotes')
      expect(result).toEqual([])
    })
  })

  describe('saveQuotes', () => {
    it('should save quotes to the API', async () => {
      // Arrange
      const newQuote = store.addQuote('New test quote', 'Test Author')
      
      // Act - Save the quotes
      const result = await store.saveQuotes()
      
      // Assert
      expect(result).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      
      // Verify the server state was updated
      const serverState = getServerState(process.env.VITE_JSONBIN_BIN_ID)
      const savedQuote = serverState.quotes.find(q => q.text === 'New test quote')
      expect(savedQuote).toBeDefined()
      expect(savedQuote.author).toBe('Test Author')
    })

    it('should create a new bin if no bin ID exists', async () => {
      // Arrange
      // Clear the bin ID to simulate first-time save
      const originalBinId = process.env.VITE_JSONBIN_BIN_ID
      delete process.env.VITE_JSONBIN_BIN_ID
      
      // Add a new quote
      const newQuote = store.addQuote('New test quote', 'Test Author')
      
      // Act - Save the quotes (should create a new bin)
      const result = await store.saveQuotes()
      
      // Assert
      expect(result).toBe(true)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBeNull()
      
      // The quote should be in the store
      const quoteInStore = store.quotes.find(q => q.text === 'New test quote')
      expect(quoteInStore).toBeDefined()
      expect(quoteInStore.author).toBe('Test Author')
      
      // Clean up
      process.env.VITE_JSONBIN_BIN_ID = originalBinId
    })

    it('should handle API errors', async () => {
      // First add a quote to save
      await store.addQuote({
        id: 'error-test',
        text: 'Error test quote',
        author: 'Test',
        slug: 'error-test-quote'
      })
      
      // Arrange - Override the PUT handler to return an error
      server.use(
        http.put('https://api.jsonbin.io/v3/b/:binId', () => {
          return HttpResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
          )
        })
      )
      
      // Act
      const result = await store.saveQuotes()
      
      // Assert
      expect(result).toBe(false)
      expect(store.isLoading).toBe(false)
      expect(store.error).toContain('Failed to save quotes')
    })
  })
})
