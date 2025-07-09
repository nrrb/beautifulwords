import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

// Mock data
const mockQuotes = [
  { id: '1', text: 'Test quote 1', author: 'Author 1', slug: 'test-quote-1' },
  { id: '2', text: 'Test quote 2', author: 'Author 2', slug: 'test-quote-2' },
];

let serverState = {
  quotes: [...mockQuotes],
  binId: 'test-bin-id',
};

// Track test bins
const testBins = new Map();
testBins.set('test-bin-id', { quotes: [...mockQuotes] });

export const handlers = [
  // GET /b/:binId/latest - Get latest quotes
  http.get('https://api.jsonbin.io/v3/b/:binId/latest', ({ params }) => {
    const { binId } = params;
    
    const bin = testBins.get(binId);
    if (!bin) {
      return HttpResponse.json(
        { message: 'Bin not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      record: { quotes: bin.quotes },
      metadata: { id: binId }
    });
  }),

  // PUT /b/:binId - Update quotes
  http.put('https://api.jsonbin.io/v3/b/:binId', async ({ request, params }) => {
    const { binId } = params;
    const { quotes } = await request.json();
    
    const bin = testBins.get(binId);
    if (!bin) {
      return HttpResponse.json(
        { message: 'Bin not found' },
        { status: 404 }
      );
    }

    bin.quotes = quotes;
    
    return HttpResponse.json({
      record: { quotes },
      metadata: { id: binId }
    });
  }),

  // POST /b - Create new bin
  http.post('https://api.jsonbin.io/v3/b', async ({ request }) => {
    const { quotes } = await request.json();
    const newBinId = `bin-${Date.now()}`;
    
    testBins.set(newBinId, { quotes });
    
    return HttpResponse.json(
      {
        record: { quotes },
        metadata: { id: newBinId }
      },
      { status: 201 }
    );
  }),
];

export const server = setupServer(...handlers);

// Helper functions for tests
export const resetServerState = () => {
  testBins.clear();
  testBins.set('test-bin-id', { quotes: [...mockQuotes] });
  return {
    quotes: [...mockQuotes],
    binId: 'test-bin-id',
  };
};

export const getServerState = (binId = 'test-bin-id') => {
  const bin = testBins.get(binId);
  return bin ? { ...bin, binId } : null;
};
