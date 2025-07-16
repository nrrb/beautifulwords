// JSONBin.io configuration
export const JSONBIN_CONFIG = {
  BASE_URL: 'https://api.jsonbin.io/v3/b',
  // Get these values from environment variables
  API_KEY: import.meta.env.VITE_JSONBIN_API_KEY || '$2a$10$.OqXPMsC3tiH6ieL.ZMv4OmdI/Fb7R8sqQgTqSvLKXo9K7ibLGK.K',
  BIN_ID: import.meta.env.VITE_JSONBIN_BIN_ID || '68732c206063391d31ac8a7e'
}

// Helper function to get headers
export function getHeaders() {
  if (!JSONBIN_CONFIG.API_KEY) {
    console.warn('JSONBIN_API_KEY is not set. Please set it in your .env file.')
  }
  
  return {
    'Content-Type': 'application/json',
    'X-Access-Key': JSONBIN_CONFIG.API_KEY,
    'X-Bin-Name': 'Beautiful Words Quotes' // Optional: gives your bin a name
  }
}
