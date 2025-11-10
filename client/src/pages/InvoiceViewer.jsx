import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchInvoice } from '../features/invoicesSlice';

export default function InvoiceViewer() {
	const { invoiceNumber } = useParams();
	const dispatch = useDispatch();
	const { current } = useSelector((s) => s.invoices);
	useEffect(() => { dispatch(fetchInvoice(invoiceNumber)); }, [dispatch, invoiceNumber]);

	if (!current) return <div className="p-4 sm:p-6 text-center">Loading...</div>;
	return (
		<div className="p-4 sm:p-6">
			<div className="max-w-3xl mx-auto bg-white p-4 sm:p-6 border rounded-xl shadow-sm">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-6">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Invoice #{current.invoiceNumber}</h1>
						<div className="text-sm sm:text-base text-gray-500">
							Issued {new Date(current.issuedAt).toLocaleString()}
						</div>
					</div>
					<div className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold uppercase tracking-wide">
						Total: ₱{Number(current.totalAmount).toLocaleString()}
					</div>
				</div>

				{/* Mobile list */}
				<div className="sm:hidden space-y-3 mb-6">
					{current.orderId.items.map((item) => (
						<div key={item.product._id} className="border border-gray-200 rounded-lg p-4 shadow-sm bg-gray-50/70">
							<div className="flex items-center justify-between mb-2">
								<p className="text-sm font-semibold text-gray-900">{item.product.name}</p>
								<p className="text-sm font-semibold text-gray-900">₱{Number(item.subtotal).toLocaleString()}</p>
							</div>
							<div className="flex items-center justify-between text-xs text-gray-600">
								<span>Qty: <span className="font-semibold text-gray-800">{item.qty}</span></span>
								<span>Unit: ₱{Number(item.price).toLocaleString()}</span>
							</div>
						</div>
					))}
				</div>

				{/* Desktop table */}
				<div className="hidden sm:block overflow-x-auto mb-6">
					<table className="w-full text-left min-w-[600px] border border-gray-200 rounded-lg overflow-hidden">
						<thead>
							<tr className="bg-gray-50 text-sm text-gray-600 uppercase tracking-wide">
								<th className="p-3 font-medium">Product</th>
								<th className="p-3 font-medium">Qty</th>
								<th className="p-3 font-medium">Unit Price</th>
								<th className="p-3 font-medium text-right">Subtotal</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{current.orderId.items.map((item) => (
								<tr key={item.product._id} className="text-sm text-gray-700">
									<td className="p-3 font-semibold text-gray-900">{item.product.name}</td>
									<td className="p-3">{item.qty}</td>
									<td className="p-3">₱{Number(item.price).toLocaleString()}</td>
									<td className="p-3 text-right font-semibold text-gray-900">₱{Number(item.subtotal).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-100 pt-4">
					<div className="text-sm text-gray-500">Customer: <span className="font-semibold text-gray-800">{current.customerName || 'Walk-in'}</span></div>
					<div className="text-lg sm:text-xl font-bold text-gray-900">
						Grand Total: ₱{Number(current.totalAmount).toLocaleString()}
					</div>
				</div>
			</div>
		</div>
	);
}
