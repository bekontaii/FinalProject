const express = require('express');
const {
  getMenProducts,
  getWomenProducts,
  getClothesProducts,
  getGadgetsProducts,
  getCosmeticsProducts,
  getAllExternalProducts,
  getExternalProductById,
} = require('../controllers/externalApiController');

const router = express.Router();

router.get('/products', getAllExternalProducts);
router.get('/products/men', getMenProducts);
router.get('/products/women', getWomenProducts);
router.get('/products/clothes', getClothesProducts);
router.get('/products/gadgets', getGadgetsProducts);
router.get('/products/cosmetics', getCosmeticsProducts);
router.get('/products/:id', getExternalProductById);

module.exports = router;
