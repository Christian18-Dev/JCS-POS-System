import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../features/ordersSlice';

export default function Orders() {
	const dispatch = useDispatch();
	const { items } = useSelector((s) => s.orders);
	useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

	return (
		<div>
			<h1 className="text-2xl font-bold mb-4">Orders</h1>
			<table className="w-full text-left border">
				<thead>
					<tr className="border-b bg-gray-100">
						<th className="p-2">Order ID</th>
						<th className="p-2">Items</th>
						<th className="p-2">Total</th>
						<th className="p-2">Status</th>
						<th className="p-2">Created</th>
					</tr>
				</thead>
				<tbody>
					{items.map(o => (
						<tr key={o._id} className="border-b">
							<td className="p-2 text-xs">{o._id}</td>
							<td className="p-2 text-sm">{o.items.reduce((s,i)=>s + i.qty,0)} items</td>
							<td className="p-2">${o.totalAmount}</td>
							<td className="p-2"><span className={`px-2 py-1 rounded text-xs ${o.status==='confirmed'?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{o.status}</span></td>
							<td className="p-2 text-sm">{new Date(o.createdAt).toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
			<p className="text-xs text-gray-500 mt-2">Confirmed orders have invoices accessible from the invoice viewer if you know the number.</p>
		</div>
	);
}
