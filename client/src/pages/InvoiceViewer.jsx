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
			<div className="max-w-2xl mx-auto bg-white p-4 sm:p-6 border rounded-lg shadow-sm">
				<h1 className="text-2xl sm:text-3xl font-bold mb-4">Invoice {current.invoiceNumber}</h1>
				<div className="text-sm sm:text-base mb-6 text-gray-600">Issued: {new Date(current.issuedAt).toLocaleString()}</div>
				<div className="overflow-x-auto mb-6">
					<table className="w-full text-left border min-w-[400px]">
						<thead>
							<tr className="border-b bg-gray-100">
								<th className="p-2 sm:p-3">Product</th>
								<th className="p-2 sm:p-3">Qty</th>
								<th className="p-2 sm:p-3">Price</th>
								<th className="p-2 sm:p-3">Subtotal</th>
							</tr>
						</thead>
						<tbody>
							{current.orderId.items.map((i) => (
								<tr key={i.product._id} className="border-b">
									<td className="p-2 sm:p-3 font-medium">{i.product.name}</td>
									<td className="p-2 sm:p-3">{i.qty}</td>
									<td className="p-2 sm:p-3">${i.price}</td>
									<td className="p-2 sm:p-3 font-medium">${i.subtotal}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="text-right font-bold text-lg sm:text-xl border-t pt-4">Total: ${current.totalAmount}</div>
			</div>
		</div>
	);
}
