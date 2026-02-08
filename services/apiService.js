const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '';
const RAPIDAPI_HOST = process.env.RAPIDAPI_HOST || '';

const APIS = {
  FAKE_STORE: 'https://fakestoreapi.com/products',
  DUMMY_JSON: 'https://dummyjson.com/products',
};

const CACHE_TTL = 5 * 60 * 1000;
const productCache = new Map();

const getCacheKey = (endpoint, params = {}) => `${endpoint}_${JSON.stringify(params)}`;

const getCached = (key) => {
  const cached = productCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  productCache.delete(key);
  return null;
};

const setCache = (key, data) => {
  productCache.set(key, { data, timestamp: Date.now() });
};

const fetchAPI = async (url, options = {}, cacheKey = null) => {
  if (cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  try {
    const response = await axios.get(url, {
      ...options,
      timeout: 10000,
      headers: {
        ...options.headers,
        ...(RAPIDAPI_KEY && RAPIDAPI_HOST ? {
          'X-RapidAPI-Key': RAPIDAPI_KEY,
          'X-RapidAPI-Host': RAPIDAPI_HOST,
        } : {}),
      },
    });

    const data = response.data;
    if (cacheKey) setCache(cacheKey, data);
    return data;
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      console.warn(`Timeout for ${url}`);
    } else {
      console.error(`API request failed for ${url}:`, err.message);
    }
    return null;
  }
};

const transformProduct = (product, config) => {
  const { gender, category, idOffset = 0, source = 'fakestore' } = config;
  
  let name, description, price, imageUrl;
  
  switch (source) {
    case 'dummyjson':
      name = product.title || product.name;
      description = product.description;
      price = product.price;
      imageUrl = product.thumbnail || product.images?.[0];
      break;
    case 'storeapi':
      name = product.title || product.name;
      description = product.description;
      price = product.price;
      imageUrl = product.images?.[0] || product.image;
      break;
    default: // fakestore
      name = product.title || product.name;
      description = product.description;
      price = product.price;
      imageUrl = product.image || product.thumbnail;
  }

  // Validate and clean image URL
  const validateImageUrl = (url) => {
    if (!url) return null;
    // Remove invalid URLs or placeholder URLs
    if (url.includes('placeholder') || url.includes('via.placeholder')) return null;
    // Check if URL is valid
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' ? url : null;
    } catch {
      return null;
    }
  };

  const validImageUrl = validateImageUrl(imageUrl);

  return {
    id: (product.id || Math.random() * 1000000) + idOffset,
    name: name || 'Unnamed Product',
    description: description || 'No description available',
    price: price || 0,
    imageUrl: validImageUrl || null,
    category,
    gender,
    inStock: true,
    external: true,
  };
};

const fetchProductsFromSources = async (sources) => {
  const requests = sources.map(({ url, options, cacheKey }) => 
    fetchAPI(url, options, cacheKey)
  );

  const results = await Promise.allSettled(requests);
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
    return null;
  }).filter(Boolean);
};

const processProducts = (products, config) => {
  if (!products || !Array.isArray(products)) return [];
  
  const { limit = 10, gender, category, idOffset = 0, source = 'fakestore' } = config;
  
  return products
    .slice(0, limit)
    .map((product, index) => 
      transformProduct(product, { gender, category, idOffset: idOffset + (index * 10000), source })
    );
};

const fetchDummyJSON = async (category = 'all', limit = 15) => {
  const cacheKey = getCacheKey('dummyjson', { category, limit });
  const url = category === 'all' 
    ? APIS.DUMMY_JSON 
    : `${APIS.DUMMY_JSON}/category/${category}`;
  
  const data = await fetchAPI(url, { params: { limit } }, cacheKey);
  return data?.products || [];
};

const fetchFakeStoreCategory = async (category) => {
  const cacheKey = getCacheKey('fakestore', { category });
  const data = await fetchAPI(`${APIS.FAKE_STORE}/category/${category}`, {}, cacheKey);
  return data?.data || data || [];
};

module.exports = {
  fetchAPI,
  transformProduct,
  fetchProductsFromSources,
  processProducts,
  fetchDummyJSON,
  fetchFakeStoreCategory,
  getCached,
  setCache,
  APIS,
};
