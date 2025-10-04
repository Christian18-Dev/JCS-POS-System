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
	const { items } = useSelector((s) => s.orders);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [showInvoiceModal, setShowInvoiceModal] = useState(false);
	
	useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

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
			<div className="overflow-x-auto border rounded">
				<table className="w-full text-left min-w-[500px]">
					<thead>
						<tr className="border-b bg-gray-100">
							<th className="p-2 sm:p-3">Order ID</th>
							<th className="p-2 sm:p-3">Items</th>
							<th className="p-2 sm:p-3">Total</th>
							<th className="p-2 sm:p-3">Status</th>
							<th className="p-2 sm:p-3 hidden sm:table-cell">Created</th>
						</tr>
					</thead>
					<tbody>
						{items.map(o => (
							<tr 
								key={o._id} 
								className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
								onClick={() => openInvoiceModal(o)}
							>
								<td className="p-2 sm:p-3 text-xs sm:text-sm">{o._id}</td>
								<td className="p-2 sm:p-3 text-sm">{o.items.reduce((s,i)=>s + i.qty,0)} items</td>
								<td className="p-2 sm:p-3 font-medium">₱{o.totalAmount}</td>
								<td className="p-2 sm:p-3">
									<span className={`px-2 py-1 rounded text-xs ${o.status==='confirmed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>
										{o.status}
									</span>
								</td>
								<td className="p-2 sm:p-3 text-sm hidden sm:table-cell">{new Date(o.createdAt).toLocaleString()}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<p className="text-xs sm:text-sm text-gray-500 mt-4">Click on any order to view its invoice details.</p>

			{/* Invoice Modal */}
			{showInvoiceModal && selectedOrder && (
				<div 
					className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
					onClick={(e) => e.target === e.currentTarget && closeInvoiceModal()}
				>
					<div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
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
						<div className="overflow-y-auto max-h-[calc(95vh-80px)] p-6">
							<div id="invoice-content" className="max-w-4xl mx-auto bg-white">
								{/* Company Header */}
								<div className="text-center mb-8 border-b-2 border-gray-300 pb-6">
									<h1 className="text-3xl font-bold text-gray-900 mb-2">JCS POS SYSTEM</h1>
									<p className="text-lg text-gray-600 mb-1">Point of Sale Management</p>
									<p className="text-sm text-gray-500">Professional Business Solutions</p>
								</div>

								{/* Invoice Header */}
								<div className="flex justify-between items-start mb-8">
									<div>
										<h2 className="text-2xl font-bold text-gray-900 mb-4">INVOICE</h2>
										<div className="space-y-1">
											<p className="text-sm text-gray-600"><span className="font-semibold">Invoice #:</span> {selectedOrder._id}</p>
											<p className="text-sm text-gray-600"><span className="font-semibold">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
												year: 'numeric', 
												month: 'long', 
												day: 'numeric' 
											})}</p>
											<p className="text-sm text-gray-600"><span className="font-semibold">Status:</span> 
												<span className={`ml-1 font-semibold ${selectedOrder.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'} uppercase`}>
													{selectedOrder.status}
												</span>
											</p>
										</div>
									</div>
									<div className="text-right">
										<div className="bg-gray-100 p-4 rounded-lg">
											<p className="text-sm font-semibold text-gray-700 mb-2">Bill To:</p>
											<p className="text-sm text-gray-600">Customer</p>
											<p className="text-sm text-gray-600">POS System</p>
										</div>
									</div>
								</div>

								{/* Items Table */}
								<div className="mb-8">
									<table className="w-full border-collapse border border-gray-300">
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

								{/* Totals */}
								<div className="flex justify-end mb-8">
									<div className="w-80">
										<div className="bg-gray-100 p-4 rounded-lg">
											<div className="flex justify-between items-center py-2 border-b border-gray-300">
												<span className="text-lg font-semibold text-gray-700">Subtotal:</span>
												<span className="text-lg font-semibold text-gray-900">₱{selectedOrder.totalAmount.toFixed(2)}</span>
											</div>
											<div className="flex justify-between items-center py-2 border-b border-gray-300">
												<span className="text-sm text-gray-600">Tax (0%):</span>
												<span className="text-sm text-gray-900">₱0.00</span>
											</div>
											<div className="flex justify-between items-center py-3">
												<span className="text-xl font-bold text-gray-900">TOTAL:</span>
												<span className="text-2xl font-bold text-gray-900">₱{selectedOrder.totalAmount.toFixed(2)}</span>
											</div>
										</div>
									</div>
								</div>

								{/* Footer */}
								<div className="text-center text-sm text-gray-500 border-t border-gray-300 pt-6">
									<p className="mb-2">Thank you for your business!</p>
									<p>This invoice was generated by JCS POS System</p>
									<p className="mt-2 text-xs">Generated on: {new Date().toLocaleString()}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
