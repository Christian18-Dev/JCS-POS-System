import { Router } from 'express';
import { authenticate } from '../middlewares/auth.js';
import { allowRoles } from '../middlewares/roles.js';
import { getInvoice } from '../controllers/invoices.controller.js';

const router = Router();

router.use(authenticate);
router.get('/:invoiceNumber', allowRoles('admin', 'cashier'), getInvoice);

export default router;


