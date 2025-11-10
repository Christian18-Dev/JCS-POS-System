import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/productsSlice';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ? 
  (import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : `${import.meta.env.VITE_API_URL}/api`) : 
  'http://localhost:5000/api';

export default function Inventory() {
	const dispatch = useDispatch();
	const { items, page, totalPages, totalItems, pageSize, status, error } = useSelector((s) => s.products);
	const { token, user } = useSelector((s) => s.auth);
	const [form, setForm] = useState({ name: '', sku: '', price: '', stock: 0, category: '' });
	const [editingId, setEditingId] = useState(null);
	const [editForm, setEditForm] = useState({ name: '', price: '', stock: 0, category: '' });
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [query, setQuery] = useState('');
	const headers = { Authorization: `Bearer ${token}` };

	// On search query change, debounce and fetch from server (server-side search across pages)
	useEffect(() => {
		const handle = setTimeout(() => {
			dispatch(fetchProducts({ page: 1, limit: pageSize || 10, search: (query || '').trim() }));
		}, 300);
		return () => clearTimeout(handle);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);

	useEffect(() => { 
		dispatch(fetchProducts({ page: 1, limit: 10, search: '' })); 
	}, [dispatch]);

	const goToPage = (p) => {
		if (p < 1 || p > totalPages) return;
		dispatch(fetchProducts({ page: p, limit: pageSize || 10, search: (query || '').trim() }));
	};

	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape' && showModal) {
				closeModal();
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [showModal]);

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
			setShowModal(false);
			dispatch(fetchProducts({ page, limit: pageSize || 10 }));
		} catch (err) {
			setMessage(err.response?.data?.message || 'Failed to create product');
		} finally {
			setLoading(false);
		}
	};

	const openModal = () => {
		setForm({ name: '', sku: '', price: '', stock: 0, category: '' });
		setMessage('');
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setForm({ name: '', sku: '', price: '', stock: 0, category: '' });
		setMessage('');
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
			dispatch(fetchProducts({ page, limit: pageSize || 10 }));
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
			dispatch(fetchProducts({ page, limit: pageSize || 10 }));
		} catch (err) {
			setMessage(err.response?.data?.message || 'Failed to delete product');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="p-4 sm:p-6">
			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
				<h1 className="text-2xl sm:text-3xl font-bold">Inventory</h1>
				<div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
					<div className="flex-1 sm:flex-initial">
                        <div className="relative">
							<input
								type="text"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								placeholder="Search by name, SKU, or category"
								className="w-full sm:w-80 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								aria-label="Search products"
							/>
							{query && (
								<button
									onClick={() => setQuery('')}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
									aria-label="Clear search"
									title="Clear"
								>
									✕
								</button>
							)}
						</div>
					</div>
					{user?.role === 'admin' && (
						<button 
							onClick={openModal}
							className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50 transition-colors text-base touch-manipulation"
						>
							Add New Item
						</button>
					)}
				</div>
			</div>

			{/* Client-side search filters only the currently loaded page */}
			
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

			{/* Add Item Modal */}
			{showModal && (
				<div 
					className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4"
					onClick={(e) => e.target === e.currentTarget && closeModal()}
				>
					<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
						<div className="flex justify-between items-center p-6 border-b">
							<h2 className="text-xl font-semibold">Add New Item</h2>
							<button 
								onClick={closeModal}
								className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
							>
								×
							</button>
						</div>
						<form onSubmit={create} className="p-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Product Name *
								</label>
								<input 
									className="w-full border border-gray-300 p-3 rounded-md text-base focus:ring-2 focus:ring-green-500 focus:border-green-500" 
									placeholder="Enter product name" 
									value={form.name} 
									onChange={(e)=>setForm({...form,name:e.target.value})} 
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									SKU *
								</label>
								<input 
									className="w-full border border-gray-300 p-3 rounded-md text-base focus:ring-2 focus:ring-green-500 focus:border-green-500" 
									placeholder="Enter SKU" 
									value={form.sku} 
									onChange={(e)=>setForm({...form,sku:e.target.value})} 
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Price *
								</label>
								<input 
									className="w-full border border-gray-300 p-3 rounded-md text-base focus:ring-2 focus:ring-green-500 focus:border-green-500" 
									placeholder="0.00" 
									type="number"
									step="0.01"
									min="0"
									value={form.price} 
									onChange={(e)=>setForm({...form,price:e.target.value})} 
									required
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Stock Quantity
								</label>
								<input 
									className="w-full border border-gray-300 p-3 rounded-md text-base focus:ring-2 focus:ring-green-500 focus:border-green-500" 
									placeholder="0" 
									type="number"
									min="0"
									value={form.stock} 
									onChange={(e)=>setForm({...form,stock:e.target.value})} 
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Category
								</label>
								<input 
									className="w-full border border-gray-300 p-3 rounded-md text-base focus:ring-2 focus:ring-green-500 focus:border-green-500" 
									placeholder="Enter category" 
									value={form.category} 
									onChange={(e)=>setForm({...form,category:e.target.value})} 
								/>
							</div>
							<div className="flex gap-3 pt-4">
								<button 
									type="button"
									onClick={closeModal}
									className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-md transition-colors text-base"
								>
									Cancel
								</button>
								<button 
									type="submit"
									className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md disabled:opacity-50 transition-colors text-base" 
									disabled={loading}
								>
									{loading ? 'Adding...' : 'Add Item'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			{/* Mobile card list */}
			<div className="md:hidden space-y-3">
				{status === 'loading' ? (
					<div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
						<div className="mx-auto h-8 w-8 border-2 border-blue-500 border-b-transparent rounded-full animate-spin"></div>
						<p className="mt-3 text-sm text-gray-600">Loading products...</p>
					</div>
				) : items.length === 0 ? (
					<div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
						{query.trim() ? 'No products match your search.' : 'No products yet. Add your first item to get started.'}
					</div>
				) : (
					items.map((product) => (
						<div key={product._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3">
							{editingId === product._id ? (
								<div className="space-y-3">
									<div>
										<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Product Name</label>
										<input
											className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											value={editForm.name}
											onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
										/>
									</div>
									<div>
										<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Price</label>
										<input
											type="number"
											className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
											value={editForm.price}
											onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
										/>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div>
											<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</label>
											<input
												type="number"
												className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												value={editForm.stock}
												onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
											/>
										</div>
										<div>
											<label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</label>
											<input
												className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
												value={editForm.category}
												onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
											/>
										</div>
									</div>
									<div className="flex flex-col sm:flex-row gap-2">
										<button
											className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
											onClick={() => saveEdit(product._id)}
											disabled={loading}
										>
											{loading ? 'Saving...' : 'Save changes'}
										</button>
										<button
											className="w-full inline-flex justify-center items-center px-4 py-2.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-semibold transition-colors disabled:opacity-60"
											onClick={() => setEditingId(null)}
											disabled={loading}
										>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<>
									<div className="flex items-start justify-between gap-3">
										<div>
											<h3 className="text-base font-semibold text-gray-900">{product.name}</h3>
											<p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
										</div>
										<div className="text-right">
											<p className="text-sm font-semibold text-gray-900">₱{Number(product.price).toLocaleString()}</p>
											<p className={`text-xs mt-1 inline-flex items-center px-2 py-0.5 rounded-full ${
												product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
											}`}>
												{product.stock} in stock
											</p>
										</div>
									</div>
									{product.category && (
										<p className="text-xs text-gray-500 uppercase tracking-wide">Category: <span className="font-semibold normal-case">{product.category}</span></p>
									)}
									{user?.role === 'admin' && (
										<div className="flex items-center gap-2 pt-2">
											<button
												className="inline-flex justify-center items-center p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
												onClick={() => startEdit(product)}
												disabled={loading}
												aria-label="Edit product"
												title="Edit"
											>
												<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-7 7h8m-8 4h8m1.586-11.414l2.828 2.828M16 3l3.586 3.586a2 2 0 010 2.828l-8.486 8.486A2 2 0 019.172 19H6v-3.172a2 2 0 01.586-1.414l8.414-8.414A2 2 0 0116 3z" />
												</svg>
											</button>
											<button
												className="inline-flex justify-center items-center p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
												onClick={() => remove(product._id)}
												disabled={loading}
												aria-label="Delete product"
												title="Delete"
											>
												<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10" />
												</svg>
											</button>
										</div>
									)}
								</>
							)}
						</div>
					))
				)}
			</div>

			{/* Desktop table */}
			<div className="hidden md:block overflow-x-auto border rounded bg-white">
				{status === 'loading' ? (
					<div className="p-10 text-center">
						<div className="mx-auto h-10 w-10 border-2 border-blue-500 border-b-transparent rounded-full animate-spin"></div>
						<p className="mt-3 text-sm text-gray-600">Loading products...</p>
					</div>
				) : (
					<table className="w-full text-left min-w-[720px]">
						<thead>
							<tr className="border-b bg-gray-50 text-sm text-gray-600 uppercase tracking-wide">
								<th className="p-3 font-medium">Name</th>
								<th className="p-3 font-medium">SKU</th>
								<th className="p-3 font-medium">Price</th>
								<th className="p-3 font-medium">Stock</th>
								<th className="p-3 font-medium">Category</th>
								{user?.role === 'admin' && <th className="p-3 font-medium text-right">Actions</th>}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{items.length === 0 ? (
								<tr>
									<td colSpan={user?.role === 'admin' ? 6 : 5} className="p-8 text-center text-sm text-gray-500">
										{query.trim() ? 'No products match your search.' : 'No products yet. Add your first item to get started.'}
									</td>
								</tr>
							) : (
								items.map((product) => (
									<tr key={product._id} className="text-sm text-gray-700">
										<td className="p-3">
											{editingId === product._id ? (
												<input
													className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													value={editForm.name}
													onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
												/>
											) : (
												<div className="flex flex-col">
													<span className="font-semibold text-gray-900">{product.name}</span>
												</div>
											)}
										</td>
										<td className="p-3 text-xs text-gray-500">{product.sku}</td>
										<td className="p-3">
											{editingId === product._id ? (
												<input
													type="number"
													className="border border-gray-300 rounded-md px-2 py-1 w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													value={editForm.price}
													onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
												/>
											) : (
												`₱${Number(product.price).toLocaleString()}`
											)}
										</td>
										<td className="p-3">
											{editingId === product._id ? (
												<input
													type="number"
													className="border border-gray-300 rounded-md px-2 py-1 w-20 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													value={editForm.stock}
													onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })}
												/>
											) : (
												product.stock
											)}
										</td>
										<td className="p-3">
											{editingId === product._id ? (
												<input
													className="border border-gray-300 rounded-md px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
													value={editForm.category}
													onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
												/>
											) : (
												product.category || '-'
											)}
										</td>
										{user?.role === 'admin' && (
											<td className="p-3 text-right">
												{editingId === product._id ? (
													<div className="inline-flex gap-2">
														<button
															className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors disabled:opacity-60"
															onClick={() => saveEdit(product._id)}
															disabled={loading}
														>
															{loading ? 'Saving...' : 'Save'}
														</button>
														<button
															className="px-3 py-1.5 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium transition-colors disabled:opacity-60"
															onClick={() => setEditingId(null)}
															disabled={loading}
														>
															Cancel
														</button>
													</div>
												) : (
													<div className="inline-flex gap-2">
														<button
															className="inline-flex justify-center items-center p-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
															onClick={() => startEdit(product)}
															disabled={loading}
															aria-label="Edit product"
															title="Edit"
														>
															<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5h2m-7 7h8m-8 4h8m1.586-11.414l2.828 2.828M16 3l3.586 3.586a2 2 0 010 2.828l-8.486 8.486A2 2 0 019.172 19H6v-3.172a2 2 0 01.586-1.414l8.414-8.414A2 2 0 0116 3z" />
															</svg>
														</button>
														<button
															className="inline-flex justify-center items-center p-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-60"
															onClick={() => remove(product._id)}
															disabled={loading}
															aria-label="Delete product"
															title="Delete"
														>
															<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m-9 0h10" />
															</svg>
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
			
			{/* Pagination Controls */}
			<div className="flex items-center justify-between mt-4">
				<p className="text-xs sm:text-sm text-gray-500">
					{(query || '').trim()
						? `Filtered results on this page: ${items.length} of ${totalItems}`
						: `Showing ${items.length} of ${totalItems} products`
					}
				</p>
				<div className="flex items-center space-x-2">
					<button
						className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
						disabled={page <= 1}
						onClick={() => goToPage(page - 1)}
					>
						Prev
					</button>
					<span className="text-sm">Page {page} of {totalPages}</span>
					<button
						className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50 transition-colors"
						disabled={page >= totalPages}
						onClick={() => goToPage(page + 1)}
					>
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
