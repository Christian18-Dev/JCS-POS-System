import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { allowRoles } from '../middlewares/roles.js';
import { createOrder, listOrders, getOrder, confirmOrder } from '../controllers/orders.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', listOrders);
router.post('/', allowRoles('admin', 'cashier'), createOrder);
router.get('/:id', getOrder);
router.post('/:id/confirm', allowRoles('admin', 'cashier'), confirmOrder);

export default router;


