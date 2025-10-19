import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../features/productsSlice';
import { createOrder as createOrderThunk, confirmOrder as confirmOrderThunk } from '../features/ordersSlice';
import { useNavigate } from 'react-router-dom';

export default function NewOrder() {
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const { items: products } = useSelector((s) => s.products);
	const { lastInvoice } = useSelector((s) => s.orders);
	const [cart, setCart] = useState([]);
	const [showErrorModal, setShowErrorModal] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [showCartModal, setShowCartModal] = useState(false);
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	const [lastOrder, setLastOrder] = useState(null);
	const [customerName, setCustomerName] = useState('');

	useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);

	useEffect(() => {
		const handleEscape = (e) => {
			if (e.key === 'Escape') {
				if (showErrorModal) closeErrorModal();
				if (showCartModal) closeCartModal();
				if (showInvoiceModal) closeInvoiceModal();
			}
		};
		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [showErrorModal, showCartModal, showInvoiceModal]);

	const addToCart = (p) => {
		// Check if product is out of stock
		if (p.stock <= 0) {
			setErrorMessage(`You are out of stock of "${p.name}". This item cannot be added to the order.`);
			setShowErrorModal(true);
			return;
		}

		setCart((prev) => {
			const idx = prev.findIndex((i) => i.product === p._id);
			if (idx >= 0) {
				const copy = [...prev];
				const newQty = copy[idx].qty + 1;
				
				// Check if adding one more would exceed available stock
				if (newQty > p.stock) {
					setErrorMessage(`Cannot add more "${p.name}". Only ${p.stock} items available in stock.`);
					setShowErrorModal(true);
					return prev; // Return unchanged cart
				}
				
				copy[idx] = { ...copy[idx], qty: newQty };
				return copy;
			}
			
			// For new items, check if we have stock
			if (p.stock < 1) {
				setErrorMessage(`You are out of stock of "${p.name}". This item cannot be added to the order.`);
				setShowErrorModal(true);
				return prev; // Return unchanged cart
			}
			
			return [...prev, { product: p._id, name: p.name, price: p.price, qty: 1 }];
		});
	};

	const updateQuantity = (productId, newQty) => {
		if (newQty <= 0) {
			removeFromCart(productId);
			return;
		}
		
		const product = products.find(p => p._id === productId);
		if (newQty > product.stock) {
			setErrorMessage(`Cannot add more "${product.name}". Only ${product.stock} items available in stock.`);
			setShowErrorModal(true);
			return;
		}
		
		setCart(prev => prev.map(item => 
			item.product === productId ? { ...item, qty: newQty } : item
		));
	};

	const removeFromCart = (productId) => {
		setCart(prev => prev.filter(item => item.product !== productId));
	};

	const closeErrorModal = () => {
		setShowErrorModal(false);
		setErrorMessage('');
	};

	const openCartModal = () => {
		setShowCartModal(true);
	};

	const closeCartModal = () => {
		setShowCartModal(false);
	};

	const closeInvoiceModal = () => {
		setShowInvoiceModal(false);
		setLastOrder(null);
	};

	const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

	const createOrder = async () => {
		const items = cart.map(i => ({ product: i.product, qty: i.qty }));
		const action = await dispatch(createOrderThunk({ items }));
		if (action.meta.requestStatus === 'fulfilled') {
			const orderId = action.payload._id;
			const confirmAction = await dispatch(confirmOrderThunk({ 
				orderId, 
				customerName 
			}));
			if (confirmAction.meta.requestStatus === 'fulfilled') {
				// Use the confirmed order data directly
				const confirmedOrder = confirmAction.payload;
				setLastOrder(confirmedOrder);
				setShowInvoiceModal(true);
				setShowCartModal(false);
				setCart([]);
				// Clear customer info after order
				setCustomerName('');
			}
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Page Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="py-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
									</svg>
								</div>
								<div className="ml-3">
									<h1 className="text-2xl font-bold text-gray-900">New Order</h1>
									<p className="text-xs text-gray-500">Create a new order by adding products to your cart</p>
								</div>
							</div>
							<button 
								onClick={openCartModal}
								className="relative bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-medium transition-colors flex items-center text-sm sm:text-base"
							>
								<span className="text-lg mr-1 sm:mr-2">🛒</span>
								<span className="hidden sm:inline">Shopping Cart</span>
								<span className="sm:hidden">Cart</span>
								{cart.length > 0 && (
									<span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center">
										{cart.length}
									</span>
								)}
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

				{/* Error Modal */}
				{showErrorModal && (
					<div 
						className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-4"
						onClick={(e) => e.target === e.currentTarget && closeErrorModal()}
					>
					<div className="bg-white rounded-lg shadow-xl w-full max-w-md">
						<div className="flex justify-between items-center p-6 border-b">
							<h2 className="text-xl font-semibold text-red-600">Out of Stock</h2>
							<button 
								onClick={closeErrorModal}
								className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
							>
								×
							</button>
						</div>
						<div className="p-6">
							<div className="flex items-center mb-4">
								<div className="flex-shrink-0">
									<svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
								</div>
								<div className="ml-3">
									<p className="text-sm text-gray-700">{errorMessage}</p>
								</div>
							</div>
							<div className="flex justify-end">
								<button 
									onClick={closeErrorModal}
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors text-base"
								>
									OK
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Cart Modal */}
			{showCartModal && (
				<div 
					className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
					onClick={(e) => e.target === e.currentTarget && closeCartModal()}
				>
					<div className="bg-white rounded-xl shadow-xl w-full max-w-2xl sm:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
						<div className="relative p-4 sm:p-6 border-b bg-gray-50">
							<div className="flex items-center justify-between">
								<h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
									<span className="text-xl sm:text-2xl mr-2 sm:mr-3">🛒</span>
									<span className="truncate">Shopping Cart ({cart.length})</span>
								</h2>
								<button 
									onClick={closeCartModal}
									className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									×
								</button>
							</div>
							{cart.length > 0 && (
								<div className="mt-3 flex justify-end">
									<button 
										onClick={() => setCart([])}
										className="text-xs sm:text-sm text-red-600 hover:text-red-700 flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg hover:bg-red-50 transition-colors"
									>
										<svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										<span className="hidden sm:inline">Clear All</span>
										<span className="sm:hidden">Clear</span>
									</button>
								</div>
							)}
						</div>
						
						<div className="overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[calc(90vh-140px)]">
							{cart.length === 0 ? (
								<div className="p-6 sm:p-12 text-center">
									<div className="text-6xl sm:text-8xl mb-4">🛒</div>
									<h3 className="text-base sm:text-lg font-medium text-gray-900">Your cart is empty</h3>
									<p className="mt-2 text-sm text-gray-500">Start adding products to create your order.</p>
									<button 
										onClick={closeCartModal}
										className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-colors text-sm sm:text-base"
									>
										Continue Shopping
									</button>
								</div>
							) : (
								<div className="divide-y divide-gray-200">
									{cart.map(i => {
										const product = products.find(p => p._id === i.product);
										return (
											<div key={i.product} className="p-3 sm:p-6 hover:bg-gray-50 transition-colors">
												<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
													<div className="flex-1 min-w-0">
														<h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">{i.name}</h4>
														<p className="text-sm text-gray-500">₱{i.price}</p>
													</div>
													
													<div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-4">
														{/* Quantity Controls */}
														<div className="flex items-center border border-gray-300 rounded-lg">
															<button
																onClick={() => updateQuantity(i.product, i.qty - 1)}
																className="p-2 sm:p-3 hover:bg-gray-100 transition-colors"
															>
																<svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
																</svg>
															</button>
															<span className="px-2 sm:px-4 py-2 sm:py-3 text-sm font-medium text-gray-900 min-w-[3rem] sm:min-w-[4rem] text-center">
																{i.qty}
															</span>
															<button
																onClick={() => updateQuantity(i.product, i.qty + 1)}
																disabled={i.qty >= product.stock}
																className="p-2 sm:p-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
															>
																<svg className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
																</svg>
															</button>
														</div>
														
														{/* Subtotal */}
														<div className="text-right min-w-[4rem] sm:min-w-[6rem]">
															<div className="text-lg sm:text-xl font-semibold text-gray-900">
																₱{(i.price * i.qty).toFixed(2)}
															</div>
														</div>
														
														{/* Remove Button */}
														<button
															onClick={() => removeFromCart(i.product)}
															className="p-2 sm:p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
														>
															<svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>
												</div>
											</div>
										);
									})}
								</div>
							)}
						</div>
						
						{/* Customer Information */}
						{cart.length > 0 && (
							<div className="px-4 sm:px-6 py-4 border-t bg-gray-50">
								<h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Customer Name *
									</label>
									<input
										type="text"
										value={customerName}
										onChange={(e) => setCustomerName(e.target.value)}
										placeholder="Enter customer name"
										className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										required
									/>
								</div>
							</div>
						)}

						{/* Order Summary */}
						{cart.length > 0 && (
							<div className="bg-gray-50 px-4 sm:px-6 py-4 sm:py-6 border-t">
								<div className="flex items-center justify-between mb-3 sm:mb-4">
									<span className="text-base sm:text-lg font-medium text-gray-900">Total Items:</span>
									<span className="text-base sm:text-lg font-semibold text-gray-900">
										{cart.reduce((sum, item) => sum + item.qty, 0)}
									</span>
								</div>
								<div className="flex items-center justify-between mb-4 sm:mb-6">
									<span className="text-lg sm:text-2xl font-semibold text-gray-900">Total Amount:</span>
									<span className="text-xl sm:text-3xl font-bold text-blue-600">₱{total.toFixed(2)}</span>
								</div>
								
								<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
									<button 
										onClick={closeCartModal}
										className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors"
									>
										Continue Shopping
									</button>
									<button 
										className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ${
											!customerName.trim() 
												? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
												: 'bg-green-600 hover:bg-green-700 text-white'
										}`}
										onClick={createOrder}
										disabled={!customerName.trim()}
									>
										<div className="flex items-center justify-center">
											<svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{customerName.trim() ? 'Confirm Order' : 'Enter Customer Name'}
										</div>
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			)}

			<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Products Section */}
				<div className="space-y-6">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold text-gray-900 flex items-center">
							<svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
							</svg>
							Products ({products.length})
						</h2>
						<div className="text-sm text-gray-500">
							{products.filter(p => p.stock > 0).length} available
						</div>
					</div>
					
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{products.map(p => (
							<div key={p._id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
								<div className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div className="flex-1">
											<h3 className="text-lg font-semibold text-gray-900 mb-1">{p.name}</h3>
											<div className="flex items-center space-x-2 mb-2">
												<span className="text-2xl font-bold text-blue-600">₱{p.price}</span>
												{p.category && (
													<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
														{p.category}
													</span>
												)}
											</div>
											<div className="flex items-center space-x-2">
												<div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
													p.stock <= 0 
														? 'bg-red-100 text-red-800' 
														: p.stock <= 5 
														? 'bg-yellow-100 text-yellow-800' 
														: 'bg-green-100 text-green-800'
												}`}>
													<svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
														<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
													</svg>
													{p.stock <= 0 ? 'Out of Stock' : `${p.stock} in stock`}
												</div>
											</div>
										</div>
									</div>
									<button 
										className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
											p.stock <= 0 
												? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
												: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5'
										}`}
										onClick={() => addToCart(p)}
										disabled={p.stock <= 0}
									>
										{p.stock <= 0 ? (
											<div className="flex items-center justify-center">
												<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
												</svg>
												Out of Stock
											</div>
										) : (
											<div className="flex items-center justify-center">
												<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
												</svg>
												Add to Cart
											</div>
										)}
						</button>
								</div>
							</div>
						))}
					</div>
					</div>
				</div>
			</div>

			{/* Invoice Modal */}
			{showInvoiceModal && lastOrder && (
				<div 
					className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
					onClick={(e) => e.target === e.currentTarget && closeInvoiceModal()}
				>
					<div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
						{/* Invoice Header */}
						<div className="relative p-4 sm:p-6 border-b bg-green-50">
							<div className="flex items-center justify-between">
								<div className="flex items-center">
									<div className="text-3xl mr-3">✅</div>
									<div>
										<h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Order Confirmed!</h2>
										<p className="text-sm text-gray-600">Invoice #{lastOrder.invoice?.invoiceNumber || 'N/A'}</p>
									</div>
								</div>
								<button 
									onClick={closeInvoiceModal}
									className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl font-bold p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
								>
									×
								</button>
							</div>
						</div>

						{/* Invoice Content */}
						<div className="overflow-y-auto max-h-[calc(90vh-140px)] p-4 sm:p-6">
							<div className="space-y-4">
								{/* Order Details */}
								<div className="bg-gray-50 rounded-lg p-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">Order Details</h3>
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-gray-600">Invoice Number:</span>
											<span className="font-medium">#{lastOrder.invoice?.invoiceNumber || 'N/A'}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Date:</span>
											<span className="font-medium">{new Date(lastOrder.order?.createdAt || lastOrder.createdAt).toLocaleDateString()}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Status:</span>
											<span className="font-medium text-green-600 capitalize">{lastOrder.order?.status || lastOrder.status}</span>
										</div>
									</div>
								</div>

								{/* Customer Information */}
								<div className="bg-gray-50 rounded-lg p-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-gray-600">Customer Name:</span>
											<span className="font-medium">{lastOrder.invoice?.customerName || 'N/A'}</span>
										</div>
									</div>
								</div>

								{/* Items */}
								<div className="bg-gray-50 rounded-lg p-4">
									<h3 className="text-lg font-semibold text-gray-900 mb-3">Items Ordered</h3>
									<div className="space-y-2">
										{lastOrder.order?.items && lastOrder.order.items.length > 0 ? (
											lastOrder.order.items.map((item, index) => (
												<div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
													<div className="flex-1">
														<p className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
														<p className="text-sm text-gray-600">Qty: {item.qty}</p>
													</div>
													<div className="text-right">
														<p className="font-medium">₱{((item.product?.price || item.price || 0) * item.qty).toFixed(2)}</p>
														<p className="text-sm text-gray-600">₱{item.product?.price || item.price || 0} each</p>
													</div>
												</div>
											))
										) : (
											<div className="text-center py-4 text-gray-500">
												<p>No items found in this order.</p>
											</div>
										)}
									</div>
								</div>

								{/* Total */}
								<div className="bg-blue-50 rounded-lg p-4">
									<div className="flex justify-between items-center">
										<span className="text-xl font-semibold text-gray-900">Total Amount:</span>
										<span className="text-2xl font-bold text-blue-600">₱{(lastOrder.order?.totalAmount || lastOrder.totalAmount || 0).toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>

						{/* Invoice Footer */}
						<div className="border-t bg-gray-50 p-4 sm:p-6">
							<div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
								<button 
									onClick={closeInvoiceModal}
									className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-semibold text-base sm:text-lg transition-colors"
								>
									Continue Shopping
								</button>
								<button 
									onClick={() => {
										closeInvoiceModal();
										navigate('/orders');
									}}
									className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 sm:px-6 py-3 rounded-lg font-semibold text-base sm:text-lg transition-colors"
								>
									View All Orders
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
