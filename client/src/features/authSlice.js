import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ? 
  (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`) : 
  'http://localhost:5000/api';

export const registerUser = createAsyncThunk('auth/register', async (data, thunkAPI) => {
	try {
		const res = await axios.post(`${API}/auth/register`, data);
		return res.data;
	} catch (err) {
		return thunkAPI.rejectWithValue(err.response?.data?.message || 'Register failed');
	}
});

export const loginUser = createAsyncThunk('auth/login', async (data, thunkAPI) => {
	try {
		const res = await axios.post(`${API}/auth/login`, data);
		return res.data;
	} catch (err) {
		return thunkAPI.rejectWithValue(err.response?.data?.message || 'Login failed');
	}
});

const tokenFromStorage = sessionStorage.getItem('token');
const userFromStorage = sessionStorage.getItem('user');

export const verifyToken = createAsyncThunk('auth/verify', async (_data, thunkAPI) => {
	try {
		const state = thunkAPI.getState();
		const token = state.auth.token;
		if (!token) throw new Error('No token');
		const res = await axios.get(`${API}/auth/me`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data;
	} catch (err) {
		return thunkAPI.rejectWithValue('Invalid session');
	}
});

const authSlice = createSlice({
	name: 'auth',
	initialState: {
		token: tokenFromStorage || null,
		user: userFromStorage ? JSON.parse(userFromStorage) : null,
		status: 'idle',
		error: null,
	},
	reducers: {
		logout(state) {
			state.token = null;
			state.user = null;
			sessionStorage.removeItem('token');
			sessionStorage.removeItem('user');
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(registerUser.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.token = action.payload.token;
				state.user = action.payload.user;
				sessionStorage.setItem('token', action.payload.token);
				sessionStorage.setItem('user', JSON.stringify(action.payload.user));
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			})
			.addCase(loginUser.pending, (state) => {
				state.status = 'loading';
				state.error = null;
			})
			.addCase(loginUser.fulfilled, (state, action) => {
				state.status = 'succeeded';
				state.token = action.payload.token;
				state.user = action.payload.user;
				sessionStorage.setItem('token', action.payload.token);
				sessionStorage.setItem('user', JSON.stringify(action.payload.user));
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			})
			.addCase(verifyToken.fulfilled, (state, action) => {
				// Keep existing token; refresh user from server
				const serverUser = action.payload.user;
				state.user = serverUser;
				sessionStorage.setItem('user', JSON.stringify(serverUser));
			})
			.addCase(verifyToken.rejected, (state) => {
				// Invalid/expired -> clear session
				state.token = null;
				state.user = null;
				sessionStorage.removeItem('token');
				sessionStorage.removeItem('user');
			});
	},
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
