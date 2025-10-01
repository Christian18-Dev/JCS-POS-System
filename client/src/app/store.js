import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';
import productsReducer from '../features/productsSlice';
import ordersReducer from '../features/ordersSlice';
import invoicesReducer from '../features/invoicesSlice';

const store = configureStore({
	reducer: {
		auth: authReducer,
		products: productsReducer,
		orders: ordersReducer,
		invoices: invoicesReducer,
	},
});

export default store;
