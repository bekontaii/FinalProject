const {
  fetchFakeStoreCategory,
  fetchDummyJSON,
  processProducts,
  APIS,
} = require('../services/apiService');

const CATEGORY_MAP = {
  clothes: {
    men: { fakestore: "men's clothing", dummyjson: 'mens-shirts' },
    women: { fakestore: "women's clothing", dummyjson: 'womens-dresses' },
  },
  gadgets: {
    fakestore: 'electronics',
    dummyjson: 'smartphones',
  },
  cosmetics: {
    fakestore: 'jewelery',
    dummyjson: 'fragrances',
  },
};

const getMenProducts = async (req, res) => {
  try {
    const [mensClothing, electronics, jewelery, dummyClothes, dummyGadgets] = 
      await Promise.all([
        fetchFakeStoreCategory(CATEGORY_MAP.clothes.men.fakestore),
        fetchFakeStoreCategory(CATEGORY_MAP.gadgets.fakestore),
        fetchFakeStoreCategory(CATEGORY_MAP.cosmetics.fakestore),
        fetchDummyJSON(CATEGORY_MAP.clothes.men.dummyjson, 12),
        fetchDummyJSON(CATEGORY_MAP.gadgets.dummyjson, 10),
      ]);

    const products = [
      ...processProducts(mensClothing, { limit: 10, gender: 'men', category: 'clothes', idOffset: 0 }),
      ...processProducts(electronics, { limit: 8, gender: 'men', category: 'gadgets', idOffset: 20000 }),
      ...processProducts(jewelery, { limit: 6, gender: 'men', category: 'cosmetics', idOffset: 30000 }),
      ...processProducts(dummyClothes, { limit: 12, gender: 'men', category: 'clothes', idOffset: 50000, source: 'dummyjson' }),
      ...processProducts(dummyGadgets, { limit: 10, gender: 'men', category: 'gadgets', idOffset: 60000, source: 'dummyjson' }),
    ];

    return res.json(products);
  } catch (err) {
    console.error('Men products error:', err.message);
    return res.status(500).json({
      message: 'Failed to fetch men products',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getWomenProducts = async (req, res) => {
  try {
    const [womensClothing, electronics, jewelery, dummyClothes, dummyGadgets] = 
      await Promise.all([
        fetchFakeStoreCategory(CATEGORY_MAP.clothes.women.fakestore),
        fetchFakeStoreCategory(CATEGORY_MAP.gadgets.fakestore),
        fetchFakeStoreCategory(CATEGORY_MAP.cosmetics.fakestore),
        fetchDummyJSON(CATEGORY_MAP.clothes.women.dummyjson, 12),
        fetchDummyJSON(CATEGORY_MAP.gadgets.dummyjson, 10),
      ]);

    const products = [
      ...processProducts(womensClothing, { limit: 10, gender: 'women', category: 'clothes', idOffset: 110000 }),
      ...processProducts(electronics, { limit: 8, gender: 'women', category: 'gadgets', idOffset: 120000 }),
      ...processProducts(jewelery, { limit: 6, gender: 'women', category: 'cosmetics', idOffset: 130000 }),
      ...processProducts(dummyClothes, { limit: 12, gender: 'women', category: 'clothes', idOffset: 140000, source: 'dummyjson' }),
      ...processProducts(dummyGadgets, { limit: 10, gender: 'women', category: 'gadgets', idOffset: 150000, source: 'dummyjson' }),
    ];

    return res.json(products);
  } catch (err) {
    console.error('Women products error:', err.message);
    return res.status(500).json({
      message: 'Failed to fetch women products',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getClothesProducts = async (req, res) => {
  try {
    const [mensClothing, womensClothing, dummyMens, dummyWomens] = 
      await Promise.all([
        fetchFakeStoreCategory(CATEGORY_MAP.clothes.men.fakestore),
        fetchFakeStoreCategory(CATEGORY_MAP.clothes.women.fakestore),
        fetchDummyJSON(CATEGORY_MAP.clothes.men.dummyjson, 10),
        fetchDummyJSON(CATEGORY_MAP.clothes.women.dummyjson, 10),
      ]);

    const products = [
      ...processProducts(mensClothing, { limit: 8, gender: 'men', category: 'clothes', idOffset: 0 }),
      ...processProducts(womensClothing, { limit: 8, gender: 'women', category: 'clothes', idOffset: 50000 }),
      ...processProducts(dummyMens, { limit: 10, gender: 'men', category: 'clothes', idOffset: 200000, source: 'dummyjson' }),
      ...processProducts(dummyWomens, { limit: 10, gender: 'women', category: 'clothes', idOffset: 210000, source: 'dummyjson' }),
    ];

    return res.json(products);
  } catch (err) {
    console.error('Clothes error:', err.message);
    return res.status(500).json({
      message: 'Failed to fetch clothes products',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getGadgetsProducts = async (req, res) => {
  try {
    const [electronics, dummyGadgets] = await Promise.all([
      fetchFakeStoreCategory(CATEGORY_MAP.gadgets.fakestore),
      fetchDummyJSON(CATEGORY_MAP.gadgets.dummyjson, 15),
    ]);

    const products = [
      ...processProducts(electronics, { limit: 10, gender: 'unisex', category: 'gadgets', idOffset: 0 }),
      ...processProducts(dummyGadgets, { limit: 15, gender: 'unisex', category: 'gadgets', idOffset: 230000, source: 'dummyjson' }),
    ];

    return res.json(products);
  } catch (err) {
    console.error('Gadgets error:', err.message);
    return res.status(500).json({
      message: 'Failed to fetch gadgets products',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getCosmeticsProducts = async (req, res) => {
  try {
    const [jewelery, dummyCosmetics] = await Promise.all([
      fetchFakeStoreCategory(CATEGORY_MAP.cosmetics.fakestore),
      fetchDummyJSON(CATEGORY_MAP.cosmetics.dummyjson, 15),
    ]);

    const products = [
      ...processProducts(jewelery, { limit: 10, gender: 'unisex', category: 'cosmetics', idOffset: 0 }),
      ...processProducts(dummyCosmetics, { limit: 15, gender: 'unisex', category: 'cosmetics', idOffset: 250000, source: 'dummyjson' }),
    ];

    return res.json(products);
  } catch (err) {
    console.error('Cosmetics error:', err.message);
    return res.status(500).json({
      message: 'Failed to fetch cosmetics products',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getAllExternalProducts = async (req, res) => {
  try {
    const [
      mensClothing,
      womensClothing,
      electronics,
      jewelery,
      dummyMens,
      dummyWomens,
      dummyGadgets,
      dummyCosmetics,
    ] = await Promise.all([
      fetchFakeStoreCategory(CATEGORY_MAP.clothes.men.fakestore),
      fetchFakeStoreCategory(CATEGORY_MAP.clothes.women.fakestore),
      fetchFakeStoreCategory(CATEGORY_MAP.gadgets.fakestore),
      fetchFakeStoreCategory(CATEGORY_MAP.cosmetics.fakestore),
      fetchDummyJSON(CATEGORY_MAP.clothes.men.dummyjson, 10),
      fetchDummyJSON(CATEGORY_MAP.clothes.women.dummyjson, 10),
      fetchDummyJSON(CATEGORY_MAP.gadgets.dummyjson, 10),
      fetchDummyJSON(CATEGORY_MAP.cosmetics.dummyjson, 10),
    ]);

    const products = [
      ...processProducts(mensClothing, { limit: 8, gender: 'men', category: 'clothes', idOffset: 0 }),
      ...processProducts(womensClothing, { limit: 8, gender: 'women', category: 'clothes', idOffset: 50000 }),
      ...processProducts(electronics, { limit: 8, gender: 'unisex', category: 'gadgets', idOffset: 20000 }),
      ...processProducts(jewelery, { limit: 8, gender: 'unisex', category: 'cosmetics', idOffset: 30000 }),
      ...processProducts(dummyMens, { limit: 10, gender: 'men', category: 'clothes', idOffset: 270000, source: 'dummyjson' }),
      ...processProducts(dummyWomens, { limit: 10, gender: 'women', category: 'clothes', idOffset: 280000, source: 'dummyjson' }),
      ...processProducts(dummyGadgets, { limit: 10, gender: 'unisex', category: 'gadgets', idOffset: 290000, source: 'dummyjson' }),
      ...processProducts(dummyCosmetics, { limit: 10, gender: 'unisex', category: 'cosmetics', idOffset: 300000, source: 'dummyjson' }),
    ];

    return res.json(products);
  } catch (err) {
    console.error('All products error:', err.message);
    return res.status(500).json({
      message: 'Failed to fetch external products',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

const getExternalProductById = async (req, res) => {
  try {
    const { fetchAPI, transformProduct, getCached, setCache } = require('../services/apiService');
    const cacheKey = `product_${req.params.id}`;
    
    const cached = getCached(cacheKey);
    if (cached) return res.json(cached);

    try {
      const data = await fetchAPI(`${APIS.FAKE_STORE}/${req.params.id}`);
      if (!data) {
        return res.status(404).json({ message: 'Product not found' });
      }

      const categoryMap = {
        "men's clothing": { category: "clothes", gender: "men" },
        "women's clothing": { category: "clothes", gender: "women" },
        "electronics": { category: "gadgets", gender: "unisex" },
        "jewelery": { category: "cosmetics", gender: "unisex" },
      };

      const mapping = categoryMap[data.category] || { category: 'clothes', gender: 'unisex' };
      const product = transformProduct(data, { ...mapping, idOffset: 0 });

      setCache(cacheKey, product);
      return res.json(product);
    } catch (err) {
      return res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('Product by ID error:', err.message);
    return res.status(500).json({
      message: 'Failed to fetch product',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
};

module.exports = {
  getMenProducts,
  getWomenProducts,
  getClothesProducts,
  getGadgetsProducts,
  getCosmeticsProducts,
  getAllExternalProducts,
  getExternalProductById,
};
