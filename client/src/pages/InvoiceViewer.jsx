import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchInvoice } from '../features/invoicesSlice';

export default function InvoiceViewer() {
	const { invoiceNumber } = useParams();
	const dispatch = useDispatch();
	const { current } = useSelector((s) => s.invoices);
	useEffect(() => { dispatch(fetchInvoice(invoiceNumber)); }, [dispatch, invoiceNumber]);

	if (!current) return <div>Loading...</div>;
	return (
		<div className="max-w-xl mx-auto bg-white p-4 border">
			<h1 className="text-2xl font-bold mb-2">Invoice {current.invoiceNumber}</h1>
			<div className="text-sm mb-4">Issued: {new Date(current.issuedAt).toLocaleString()}</div>
			<table className="w-full text-left border mb-4">
				<thead>
					<tr className="border-b bg-gray-100"><th className="p-2">Product</th><th className="p-2">Qty</th><th className="p-2">Price</th><th className="p-2">Subtotal</th></tr>
				</thead>
				<tbody>
					{current.orderId.items.map((i) => (
						<tr key={i.product._id} className="border-b">
							<td className="p-2">{i.product.name}</td>
							<td className="p-2">{i.qty}</td>
							<td className="p-2">${i.price}</td>
							<td className="p-2">${i.subtotal}</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className="text-right font-bold">Total: ${current.totalAmount}</div>
		</div>
	);
}
