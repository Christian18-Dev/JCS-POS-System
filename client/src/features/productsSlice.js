import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ? 
  (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`) : 
  'http://localhost:5000/api';

const authHeader = (getState) => {
	const token = getState().auth.token;
	return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchProducts = createAsyncThunk('products/fetch', async ({ page = 1, limit = 10, search = '' } = {}, thunkAPI) => {
	try {
		const res = await axios.get(`${API}/products`, { 
			headers: authHeader(thunkAPI.getState),
			params: { page, limit, search }
		});
		return res.data;
	} catch (err) {
		return thunkAPI.rejectWithValue('Failed to fetch');
	}
});

const productsSlice = createSlice({
	name: 'products',
	initialState: { items: [], page: 1, pageSize: 10, totalPages: 1, totalItems: 0, status: 'idle', error: null },
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProducts.pending, (state) => {
				state.status = 'loading';
			})
			.addCase(fetchProducts.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.items = action.payload.items;
				state.page = action.payload.page;
				state.pageSize = action.payload.pageSize;
				state.totalPages = action.payload.totalPages;
				state.totalItems = action.payload.totalItems;
			})
			.addCase(fetchProducts.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			});
	},
});

export default productsSlice.reducer;
