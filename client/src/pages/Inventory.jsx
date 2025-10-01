import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/productsSlice';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Inventory() {
	const dispatch = useDispatch();
	const { items, status, error } = useSelector((s) => s.products);
	const { token, user } = useSelector((s) => s.auth);
	const [form, setForm] = useState({ name: '', sku: '', price: '', stock: 0, category: '' });
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState({ name: '', price: '', stock: 0, category: '' });
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const headers = { Authorization: `Bearer ${token}` };

	useEffect(() => { 
		dispatch(fetchProducts()); 
	}, [dispatch]);

	const create = async (e) => {
		e.preventDefault();
		if (!form.name || !form.sku || !form.price) {
			setMessage('Please fill in all required fields');
			return;
		}
		setLoading(true);
		setMessage('');
		try {
			await axios.post(`${API}/products`, { ...form, price: Number(form.price), stock: Number(form.stock) }, { headers });
			setForm({ name: '', sku: '', price: '', stock: 0, category: '' });
			setMessage('Product created successfully!');
			dispatch(fetchProducts());
		} catch (err) {
			setMessage(err.response?.data?.message || 'Failed to create product');
		} finally {
			setLoading(false);
		}
	};

	const startEdit = (p) => {
		setEditingId(p._id);
		setEditForm({ name: p.name, price: p.price, stock: p.stock, category: p.category || '' });
	};

	const saveEdit = async (id) => {
		if (!editForm.name || !editForm.price) {
			setMessage('Please fill in all required fields');
			return;
		}
		setLoading(true);
		setMessage('');
		try {
			await axios.put(`${API}/products/${id}`, { ...editForm, price: Number(editForm.price), stock: Number(editForm.stock) }, { headers });
			setEditingId(null);
			setMessage('Product updated successfully!');
			dispatch(fetchProducts());
		} catch (err) {
			setMessage(err.response?.data?.message || 'Failed to update product');
		} finally {
			setLoading(false);
		}
	};

	const remove = async (id) => {
		if (!window.confirm('Are you sure you want to delete this product?')) return;
		setLoading(true);
		setMessage('');
		try {
			await axios.delete(`${API}/products/${id}`, { headers });
			setMessage('Product deleted successfully!');
			dispatch(fetchProducts());
		} catch (err) {
			setMessage(err.response?.data?.message || 'Failed to delete product');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-2xl font-bold">Inventory</h1>
				{user?.role === 'admin' && (
					<form onSubmit={create} className="flex gap-2">
						<input 
							className="border p-2 rounded" 
							placeholder="Name *" 
							value={form.name} 
							onChange={(e)=>setForm({...form,name:e.target.value})} 
							required
						/>
						<input 
							className="border p-2 rounded" 
							placeholder="SKU *" 
							value={form.sku} 
							onChange={(e)=>setForm({...form,sku:e.target.value})} 
							required
						/>
						<input 
							className="border p-2 rounded w-24" 
							placeholder="Price *" 
							type="number"
							step="0.01"
							value={form.price} 
							onChange={(e)=>setForm({...form,price:e.target.value})} 
							required
						/>
						<input 
							className="border p-2 rounded w-24" 
							placeholder="Stock" 
							type="number"
							value={form.stock} 
							onChange={(e)=>setForm({...form,stock:e.target.value})} 
						/>
						<input 
							className="border p-2 rounded" 
							placeholder="Category" 
							value={form.category} 
							onChange={(e)=>setForm({...form,category:e.target.value})} 
						/>
						<button 
							className="bg-green-600 text-white px-4 rounded disabled:opacity-50" 
							disabled={loading}
						>
							{loading ? 'Adding...' : 'Add'}
						</button>
					</form>
				)}
			</div>
			
			{/* Message display */}
			{message && (
				<div className={`mb-4 p-3 rounded ${message.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
					{message}
				</div>
			)}
			
			{/* Error from Redux */}
			{error && (
				<div className="mb-4 p-3 rounded bg-red-100 text-red-800">
					Error: {error}
				</div>
			)}
			<div className="overflow-auto border rounded">
				{status === 'loading' ? (
					<div className="p-8 text-center">
						<div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						<p className="mt-2 text-gray-600">Loading products...</p>
					</div>
				) : (
					<table className="w-full text-left">
						<thead>
							<tr className="border-b bg-gray-100 text-sm">
								<th className="p-2">Name</th>
								<th className="p-2">SKU</th>
								<th className="p-2">Price</th>
								<th className="p-2">Stock</th>
								<th className="p-2">Category</th>
								{user?.role==='admin' && <th className="p-2">Actions</th>}
							</tr>
						</thead>
						<tbody>
							{items.length === 0 ? (
								<tr>
									<td colSpan={user?.role==='admin' ? 6 : 5} className="p-8 text-center text-gray-500">
										No products found. {user?.role==='admin' && 'Add your first product above!'}
									</td>
								</tr>
							) : (
								items.map(p => (
							<tr key={p._id} className="border-b">
								<td className="p-2">
									{editingId===p._id ? (
										<input className="border p-1 rounded w-full" value={editForm.name} onChange={(e)=>setEditForm({...editForm,name:e.target.value})} />
									) : p.name}
								</td>
								<td className="p-2 text-xs text-gray-600">{p.sku}</td>
								<td className="p-2">
									{editingId===p._id ? (
										<input className="border p-1 rounded w-24" value={editForm.price} onChange={(e)=>setEditForm({...editForm,price:e.target.value})} />
									) : `$${p.price}`}
								</td>
								<td className="p-2">
									{editingId===p._id ? (
										<input className="border p-1 rounded w-20" value={editForm.stock} onChange={(e)=>setEditForm({...editForm,stock:e.target.value})} />
									) : p.stock}
								</td>
								<td className="p-2">
									{editingId===p._id ? (
										<input className="border p-1 rounded" value={editForm.category} onChange={(e)=>setEditForm({...editForm,category:e.target.value})} />
									) : (p.category || '-')}
								</td>
								{user?.role==='admin' && (
									<td className="p-2">
										{editingId===p._id ? (
											<div className="flex gap-2">
												<button 
													className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50" 
													onClick={()=>saveEdit(p._id)}
													disabled={loading}
												>
													{loading ? 'Saving...' : 'Save'}
												</button>
												<button 
													className="px-3 py-1 bg-gray-200 rounded" 
													onClick={()=>setEditingId(null)}
													disabled={loading}
												>
													Cancel
												</button>
											</div>
										) : (
											<div className="flex gap-2">
												<button 
													className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50" 
													onClick={()=>startEdit(p)}
													disabled={loading}
												>
													Edit
												</button>
												<button 
													className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-50" 
													onClick={()=>remove(p._id)}
													disabled={loading}
												>
													{loading ? 'Deleting...' : 'Delete'}
												</button>
											</div>
										)}
									</td>
								)}
							</tr>
								))
							)}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
