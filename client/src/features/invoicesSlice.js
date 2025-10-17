import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ? 
  (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`) : 
  'http://localhost:5000/api';

export const fetchInvoice = createAsyncThunk('invoices/fetchOne', async (invoiceNumber, thunkAPI) => {
	try {
		const token = thunkAPI.getState().auth.token;
		const res = await axios.get(`${API}/invoices/${invoiceNumber}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
		return res.data;
	} catch (err) {
		return thunkAPI.rejectWithValue('Failed to fetch');
	}
});

const invoicesSlice = createSlice({
	name: 'invoices',
	initialState: { current: null, status: 'idle', error: null },
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(fetchInvoice.fulfilled, (state, action) => {
				state.current = action.payload;
			});
	},
});

export default invoicesSlice.reducer;
