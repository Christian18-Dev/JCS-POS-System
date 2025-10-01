import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

const tokenFromStorage = localStorage.getItem('token');
const userFromStorage = localStorage.getItem('user');

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
			localStorage.removeItem('token');
			localStorage.removeItem('user');
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
				localStorage.setItem('token', action.payload.token);
				localStorage.setItem('user', JSON.stringify(action.payload.user));
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
				localStorage.setItem('token', action.payload.token);
				localStorage.setItem('user', JSON.stringify(action.payload.user));
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.status = 'failed';
				state.error = action.payload;
			});
	},
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
