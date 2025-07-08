import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

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
  const quotes = ref(JSON.parse(localStorage.getItem('quotes') || '[]'));
  
  // Add a new quote
  const addQuote = (quoteText, author) => {
    const newQuote = {
      id: Date.now().toString(),
      text: quoteText,
      author,
      slug: slugify(`${quoteText} ${author}`).slice(0, 50), // Limit slug length
      createdAt: new Date().toISOString()
    };
    
    quotes.value.unshift(newQuote);
    saveToLocalStorage();
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
  
  // Save quotes to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('quotes', JSON.stringify(quotes.value));
  };
  
  return {
    quotes: computed(() => quotes.value),
    addQuote,
    getQuoteById,
    getQuoteBySlug,
    getNextQuote,
    getPreviousQuote,
  };
});
