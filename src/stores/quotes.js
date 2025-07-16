import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { JSONBIN_CONFIG, getHeaders } from '../config/jsonbin';
import { useSettingsStore } from './settings';

// Helper to get config values with environment variable fallbacks
const getConfig = () => ({
  API_KEY: import.meta.env.VITE_JSONBIN_API_KEY || JSONBIN_CONFIG.API_KEY,
  BIN_ID: import.meta.env.VITE_JSONBIN_BIN_ID || JSONBIN_CONFIG.BIN_ID,
  BASE_URL: JSONBIN_CONFIG.BASE_URL
});

// Helper function to generate a URL-friendly slug
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
}

export const useQuotesStore = defineStore('quotes', () => {
  const quotes = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  
  // Initialize the store by loading quotes from JSONBin.io
  const loadQuotes = async () => {
    const config = getConfig();
    if (!config.API_KEY || !config.BIN_ID) {
      error.value = 'JSONBin.io API key or Bin ID not configured';
      quotes.value = [];
      return [];
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${config.BASE_URL}/${config.BIN_ID}/latest`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        // If bin doesn't exist yet, return an empty array
        if (response.status === 404) {
          quotes.value = [];
          return [];
        }
        throw new Error(`Failed to load quotes: ${response.statusText}`);
      }
      
      const data = await response.json();
      quotes.value = data.record?.quotes || [];
      return [...quotes.value];
    } catch (err) {
      error.value = err.message;
      console.error('Error loading quotes:', err);
      quotes.value = [];
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // Save quotes to JSONBin.io
  const saveQuotes = async () => {
    const config = getConfig();
    if (!config.API_KEY) {
      error.value = 'JSONBin.io API key not configured';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const url = config.BIN_ID 
        ? `${config.BASE_URL}/${config.BIN_ID}`
        : config.BASE_URL;
      
      const method = config.BIN_ID ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ quotes: quotes.value })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save quotes: ${response.statusText}`);
      }
      
      // If this is the first save, store the bin ID for future use
      if (!config.BIN_ID) {
        const data = await response.json();
        import.meta.env.VITE_JSONBIN_BIN_ID = data.metadata.id;
        console.log('Created new bin with ID:', import.meta.env.VITE_JSONBIN_BIN_ID);
      }
      
      return true;
    } catch (err) {
      error.value = err.message;
      console.error('Error saving quotes:', err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };
  
  // Add a new quote
  const addQuote = (quoteText, author, font, size) => {
    const settingsStore = useSettingsStore(); // moved here
    const newQuote = {
      id: Date.now().toString(),
      text: quoteText,
      author,
      font: font || settingsStore.fontFamily,
      size: size || settingsStore.fontSize,
      slug: slugify(`${quoteText} ${author}`).slice(0, 50), // Limit slug length
      createdAt: new Date().toISOString()
    };
    
    // Add to the beginning of the array (most recent first)
    quotes.value = [newQuote, ...quotes.value];
    saveQuotes();
    return newQuote;
  };
  
  // Get a quote by ID
  const getQuoteById = (id) => {
    return quotes.value.find(quote => quote.id === id);
  };
  
  // Get a quote by slug
  const getQuoteBySlug = (slug) => {
    return quotes.value.find(quote => quote.slug === slug);
  };
  
  // Get the next quote
  const getNextQuote = (currentId) => {
    const currentIndex = quotes.value.findIndex(quote => quote.id === currentId);
    if (import.meta.env.DEV) {
      console.log('getNextQuote currentIndex', currentIndex);
    }
    if (currentIndex === -1) return null;
    const nextIndex = (currentIndex + 1) % quotes.value.length;
    return quotes.value[nextIndex];
  };
  
  // Get the previous quote
  const getPreviousQuote = (currentId) => {
    const currentIndex = quotes.value.findIndex(quote => quote.id === currentId);
    if (import.meta.env.DEV) {
      console.log('getPreviousQuote currentIndex', currentIndex);
    }
    if (currentIndex === -1) return null;
    const prevIndex = (currentIndex - 1 + quotes.value.length) % quotes.value.length;
    return quotes.value[prevIndex];
  };
  
  // Don't auto-load quotes in test environment to avoid race conditions
  if (import.meta.env.MODE !== 'test') {
    loadQuotes();
  }
  
  return {
    quotes: computed(() => quotes.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadQuotes,
    saveQuotes,
    addQuote,
    getQuoteById,
    getQuoteBySlug,
    getNextQuote,
    getPreviousQuote,
  };
});
