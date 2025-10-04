import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../features/ordersSlice';

export default function Orders() {
	const dispatch = useDispatch();
	const { items } = useSelector((s) => s.orders);
	useEffect(() => { dispatch(fetchOrders()); }, [dispatch]);

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
							<tr key={o._id} className="border-b">
								<td className="p-2 sm:p-3 text-xs sm:text-sm">{o._id}</td>
								<td className="p-2 sm:p-3 text-sm">{o.items.reduce((s,i)=>s + i.qty,0)} items</td>
								<td className="p-2 sm:p-3 font-medium">${o.totalAmount}</td>
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
			<p className="text-xs sm:text-sm text-gray-500 mt-4">Confirmed orders have invoices accessible from the invoice viewer if you know the number.</p>
		</div>
	);
}
