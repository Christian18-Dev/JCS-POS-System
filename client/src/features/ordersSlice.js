import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ? 
  (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`) : 
  'http://localhost:5000/api';

const authHeader = (getState) => {
	const token = getState().auth.token;
	return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchOrders = createAsyncThunk('orders/fetch', async ({ page = 1, limit = 10 } = {}, thunkAPI) => {
	try {
		const res = await axios.get(`${API}/orders`, { 
			headers: authHeader(thunkAPI.getState),
			params: { page, limit }
		});
		return res.data;
	} catch (err) {
		return thunkAPI.rejectWithValue('Failed to fetch');
	}
});

export const createOrder = createAsyncThunk('orders/create', async (payload, thunkAPI) => {
	try {
		const res = await axios.post(`${API}/orders`, payload, { headers: authHeader(thunkAPI.getState) });
		return res.data;
	} catch (err) {
		return thunkAPI.rejectWithValue('Failed to create');
	}
});

export const confirmOrder = createAsyncThunk('orders/confirm', async ({ orderId, customerName }, thunkAPI) => {
	try {
		const res = await axios.post(`${API}/orders/${orderId}/confirm`, { 
			customerName 
		}, { headers: authHeader(thunkAPI.getState) });
		return res.data;
	} catch (err) {
		return thunkAPI.rejectWithValue('Failed to confirm');
	}
});

const ordersSlice = createSlice({
	name: 'orders',
	initialState: { items: [], page: 1, pageSize: 10, totalPages: 1, totalItems: 0, status: 'idle', error: null, lastInvoice: null },
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchOrders.fulfilled, (state, action) => {
				state.items = action.payload.items;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.totalPages = action.payload.totalPages;
				state.totalItems = action.payload.totalItems;
			})
			.addCase(createOrder.fulfilled, (state, action) => {
				state.items.unshift(action.payload);
			})
			.addCase(confirmOrder.fulfilled, (state, action) => {
				const idx = state.items.findIndex((o) => o._id === action.payload.order._id);
				if (idx >= 0) state.items[idx] = action.payload.order;
				state.lastInvoice = action.payload.invoice;
			});
	},
});

export default ordersSlice.reducer;
