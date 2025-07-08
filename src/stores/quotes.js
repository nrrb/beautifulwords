import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { JSONBIN_CONFIG, getHeaders } from '../config/jsonbin';

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
    if (!JSONBIN_CONFIG.API_KEY || !JSONBIN_CONFIG.BIN_ID) {
      error.value = 'JSONBin.io API key or Bin ID not configured';
      return [];
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await fetch(`${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}/latest`, {
        headers: getHeaders()
      });
      
      if (!response.ok) {
        // If bin doesn't exist yet, create it with an empty array
        if (response.status === 404) {
          return [];
        }
        throw new Error(`Failed to load quotes: ${response.statusText}`);
      }
      
      const data = await response.json();
      quotes.value = data.record?.quotes || [];
      return quotes.value;
    } catch (err) {
      error.value = err.message;
      console.error('Error loading quotes:', err);
      return [];
    } finally {
      isLoading.value = false;
    }
  };
  
  // Save quotes to JSONBin.io
  const saveQuotes = async () => {
    if (!JSONBIN_CONFIG.API_KEY) {
      error.value = 'JSONBin.io API key not configured';
      return false;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const url = JSONBIN_CONFIG.BIN_ID 
        ? `${JSONBIN_CONFIG.BASE_URL}/${JSONBIN_CONFIG.BIN_ID}`
        : JSONBIN_CONFIG.BASE_URL;
      
      const method = JSONBIN_CONFIG.BIN_ID ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ quotes: quotes.value })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save quotes: ${response.statusText}`);
      }
      
      // If this is the first save, store the bin ID for future use
      if (!JSONBIN_CONFIG.BIN_ID) {
        const data = await response.json();
        JSONBIN_CONFIG.BIN_ID = data.metadata.id;
        console.log('Created new bin with ID:', JSONBIN_CONFIG.BIN_ID);
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
  const addQuote = async (quoteText, author, font) => {
    const newQuote = {
      id: Date.now().toString(),
      text: quoteText,
      author,
      font,
      slug: slugify(`${quoteText} ${author}`).slice(0, 50), // Limit slug length
      createdAt: new Date().toISOString()
    };
    
    quotes.value.unshift(newQuote);
    const success = await saveQuotes();
    
    if (!success) {
      // Revert the local change if save fails
      quotes.value.shift();
      throw new Error(error.value || 'Failed to save quote');
    }
    
    return newQuote;
  };
  
  // Get a quote by ID
  const getQuoteById = (id) => {
    return quotes.value.find(quote => quote.id === id);
  };
  
  // Get a quote by slug
  const getQuoteBySlug = (slug) => {
    return quotes.value.find(quote => quote.sug === slug);
  };
  
  // Get the next quote
  const getNextQuote = (currentId) => {
    const currentIndex = quotes.value.findIndex(quote => quote.id === currentId);
    if (currentIndex === -1) return null;
    const nextIndex = (currentIndex + 1) % quotes.value.length;
    return quotes.value[nextIndex];
  };
  
  // Get the previous quote
  const getPreviousQuote = (currentId) => {
    const currentIndex = quotes.value.findIndex(quote => quote.id === currentId);
    if (currentIndex === -1) return null;
    const prevIndex = (currentIndex - 1 + quotes.value.length) % quotes.value.length;
    return quotes.value[prevIndex];
  };
  
  // Initialize the store when it's created
  loadQuotes();
  
  return {
    quotes: computed(() => quotes.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    loadQuotes,
    addQuote,
    getQuoteById,
    getQuoteBySlug,
    getNextQuote,
    getPreviousQuote,
  };
});
