import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../features/ordersSlice';

// Add print styles
const printStyles = `
	@media print {
		body * {
			visibility: hidden;
		}
		#invoice-content, #invoice-content * {
			visibility: visible;
		}
		#invoice-content {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			margin: 0;
			padding: 20px;
		}
		.no-print {
			display: none !important;
		}
		/* Hide browser UI elements */
		@page {
			margin: 0;
			padding: 0;
		}
		/* Hide Vite + React text and other browser elements */
		body::before,
		body::after,
		#root::before,
		#root::after {
			display: none !important;
		}
		/* Hide any browser-specific elements */
		[data-vite-dev-toolbar],
		[data-react-dev-toolbar],
		.vite-dev-toolbar,
		.react-dev-toolbar {
			display: none !important;
		}
		/* Ensure clean print layout */
		html, body {
			margin: 0 !important;
			padding: 0 !important;
			background: white !important;
		}
	}
`;

// Inject print styles
if (typeof document !== 'undefined') {
	const styleSheet = document.createElement("style");
	styleSheet.type = "text/css";
	styleSheet.innerText = printStyles;
	document.head.appendChild(styleSheet);
}

export default function Orders() {
	const dispatch = useDispatch();
	const { items, page, totalPages, totalItems, pageSize } = useSelector((s) => s.orders);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	
	useEffect(() => { dispatch(fetchOrders({ page: 1, limit: 10 })); }, [dispatch]);

	const goToPage = (p) => {
		if (p < 1 || p > totalPages) return;
		dispatch(fetchOrders({ page: p, limit: pageSize || 10 }));
	};

	const openInvoiceModal = (order) => {
		setSelectedOrder(order);
		setShowInvoiceModal(true);
	};

	const closeInvoiceModal = () => {
		setShowInvoiceModal(false);
		setSelectedOrder(null);
	};

	return (
		<div className="p-4 sm:p-6">
			<h1 className="text-2xl sm:text-3xl font-bold mb-6">Orders</h1>
			{/* Mobile card view */}
			<div className="md:hidden space-y-3 mb-4">
				{items.length === 0 ? (
					<div className="border rounded-lg bg-white p-4 text-center text-sm text-gray-500">
						No orders yet. Create a new order to get started.
					</div>
				) : (
					items.map((order) => (
						<button
							key={order._id}
							onClick={() => openInvoiceModal(order)}
							className="w-full bg-white border border-gray-200 rounded-lg shadow-sm text-left p-4 space-y-3 active:shadow-md transition-shadow"
						>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-xs text-gray-500 uppercase tracking-wide">Order</p>
									<p className="text-sm font-semibold text-gray-900">{order.orderNumber || order._id}</p>
								</div>
								<span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
									order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
								}`}>
									{order.status}
								</span>
							</div>
							<div className="flex items-center justify-between text-sm text-gray-600">
								<span>{order.items.reduce((s, i) => s + i.qty, 0)} items</span>
								<span className="font-semibold text-gray-900">₱{Number(order.totalAmount).toLocaleString()}</span>
							</div>
							<div className="text-xs text-gray-500">
								Created {new Date(order.createdAt).toLocaleString()}
							</div>
						</button>
					))
				)}
			</div>

			{/* Desktop table */}
			<div className="hidden md:block overflow-x-auto border rounded bg-white">
				<table className="w-full text-left min-w-[640px]">
					<thead>
						<tr className="border-b bg-gray-50 text-sm">
							<th className="p-3 font-medium text-gray-600">Order ID</th>
							<th className="p-3 font-medium text-gray-600">Items</th>
							<th className="p-3 font-medium text-gray-600">Total</th>
							<th className="p-3 font-medium text-gray-600">Status</th>
							<th className="p-3 font-medium text-gray-600">Created</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{items.length === 0 ? (
							<tr>
								<td colSpan={5} className="p-6 text-center text-sm text-gray-500">
									No orders yet. Create a new order to get started.
								</td>
							</tr>
						) : (
							items.map((order) => (
									<tr 
										key={order._id} 
									className="hover:bg-gray-50 cursor-pointer transition-colors"
										onClick={() => openInvoiceModal(order)}
									>
									<td className="p-3 text-sm text-gray-700">{order.orderNumber || order._id}</td>
									<td className="p-3 text-sm text-gray-700">{order.items.reduce((s, i) => s + i.qty, 0)} items</td>
									<td className="p-3 text-sm font-semibold text-gray-900">₱{Number(order.totalAmount).toLocaleString()}</td>
									<td className="p-3 text-sm">
										<span className={`px-2 py-1 rounded-full text-xs font-semibold ${
											order.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
										}`}>
												{order.status}
											</span>
										</td>
									<td className="p-3 text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
									</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="flex items-center justify-between mt-4">
				<p className="text-xs sm:text-sm text-gray-500">Click on any order to view its invoice details.</p>
				<div className="flex items-center space-x-2">
					<button
						className="px-3 py-1 border rounded disabled:opacity-50"
						disabled={page <= 1}
						onClick={() => goToPage(page - 1)}
					>
						Prev
					</button>
					<span className="text-sm">Page {page} of {totalPages}</span>
					<button
						className="px-3 py-1 border rounded disabled:opacity-50"
						disabled={page >= totalPages}
						onClick={() => goToPage(page + 1)}
					>
						Next
					</button>
				</div>
			</div>

			{/* Invoice Modal */}
			{showInvoiceModal && selectedOrder && (
				<div 
					className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
					onClick={(e) => e.target === e.currentTarget && closeInvoiceModal()}
				>
					<div className="bg-white rounded-lg shadow-xl w-full max-w-3xl lg:max-w-4xl max-h-[95vh] overflow-hidden">
						{/* Modal Header */}
						<div className="no-print flex justify-between items-center p-4 border-b bg-gray-50">
							<h2 className="text-lg font-semibold text-gray-900">Invoice Preview</h2>
							<div className="flex space-x-2">
								<button 
									onClick={() => window.print()}
									className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
								>
									<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
									</svg>
									Print
								</button>
								<button 
									onClick={closeInvoiceModal}
									className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 hover:bg-gray-100 rounded-lg transition-colors"
								>
									×
								</button>
							</div>
						</div>

						{/* Printable Invoice */}
						<div className="overflow-y-auto max-h-[calc(95vh-80px)] p-4 sm:p-6">
							<div id="invoice-content" className="max-w-4xl mx-auto bg-white">
								{/* Company Header */}
								<div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
									<h1 className="text-3xl font-bold text-gray-900 mb-2">JCS ENTERPRISE</h1>
								</div>

								{/* Invoice Header */}
								<div className="flex justify-between items-start mb-8">
									<div>
										<h2 className="text-2xl font-bold text-gray-900 mb-4">INVOICE</h2>
										<div className="space-y-1">
											<p className="text-md text-gray-600"><span className="font-semibold">Invoice #:</span> {selectedOrder.invoice?.invoiceNumber || 'N/A'}</p>
											<p className="text-md text-gray-600"><span className="font-semibold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
												year: 'numeric', 
												month: 'long', 
												day: 'numeric' 
											})}</p>
											<p className="text-md text-gray-600"><span className="font-semibold">Bill To:</span> <span className="font-bold text-gray-900">{selectedOrder.invoice?.customerName || 'N/A'}</span></p>
										</div>
									</div>
								</div>

								{/* Items */}
								<div className="mb-8">
									<div className="md:hidden space-y-3">
										{selectedOrder.items.map((item, index) => (
											<div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50/80">
												<div className="flex items-center justify-between mb-2">
													<p className="text-sm font-semibold text-gray-900">{item.product.name}</p>
													<p className="text-sm font-semibold text-gray-900">₱{(item.product.price * item.qty).toFixed(2)}</p>
												</div>
												<div className="flex items-center justify-between text-xs text-gray-600">
													<span>Qty: <span className="font-semibold text-gray-800">{item.qty}</span></span>
													<span>Unit: ₱{item.product.price.toFixed(2)}</span>
												</div>
											</div>
										))}
									</div>
									<div className="hidden md:block">
										<table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
										<thead>
											<tr className="bg-gray-100">
												<th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
												<th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
												<th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Unit Price</th>
												<th className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-700">Total</th>
											</tr>
										</thead>
										<tbody>
											{selectedOrder.items.map((item, index) => (
												<tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
													<td className="border border-gray-300 px-4 py-3 text-sm text-gray-900">{item.product.name}</td>
													<td className="border border-gray-300 px-4 py-3 text-center text-sm text-gray-900">{item.qty}</td>
													<td className="border border-gray-300 px-4 py-3 text-right text-sm text-gray-900">₱{item.product.price.toFixed(2)}</td>
													<td className="border border-gray-300 px-4 py-3 text-right text-sm font-semibold text-gray-900">₱{(item.product.price * item.qty).toFixed(2)}</td>
												</tr>
											))}
										</tbody>
									</table>
									</div>
								</div>

								{/* Totals */}
								<div className="flex justify-end mb-8">
									<div className="w-80">
										<div className="bg-gray-100 p-4 rounded-lg">
											<div className="flex justify-between items-center py-2 border-b border-gray-300">
												<span className="text-lg font-semibold text-gray-700">Subtotal:</span>
												<span className="text-lg font-semibold text-gray-900">₱{selectedOrder.totalAmount.toFixed(2)}</span>
											</div>
											<div className="flex justify-between items-center py-3">
												<span className="text-xl font-bold text-gray-900">TOTAL:</span>
												<span className="text-2xl font-bold text-gray-900">₱{selectedOrder.totalAmount.toFixed(2)}</span>
											</div>
										</div>
									</div>
								</div>
									<p className="text-sm text-gray-600"><span className="font-semibold">Status:</span> 
										<span className={`ml-1 font-semibold ${selectedOrder.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'} uppercase`}> 
											{selectedOrder.status}
										</span>
									</p>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
