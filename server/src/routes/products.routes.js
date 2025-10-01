import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { allowRoles } from '../middlewares/roles.js';
import { createProduct, listProducts, getProduct, updateProduct, deleteProduct, adjustStock } from '../controllers/products.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listProducts);
router.post('/', allowRoles('admin'), createProduct);
router.get('/:id', getProduct);
router.put('/:id', allowRoles('admin'), updateProduct);
router.delete('/:id', allowRoles('admin'), deleteProduct);
router.post('/:id/stock', allowRoles('admin'), adjustStock);

export default router;


