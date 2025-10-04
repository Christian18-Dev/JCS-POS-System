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

	useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);
	useEffect(() => { if (lastInvoice?.invoiceNumber) navigate(`/invoice/${lastInvoice.invoiceNumber}`); }, [lastInvoice, navigate]);

	const addToCart = (p) => {
		setCart((prev) => {
			const idx = prev.findIndex((i) => i.product === p._id);
			if (idx >= 0) {
				const copy = [...prev];
				copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
				return copy;
			}
			return [...prev, { product: p._id, name: p.name, price: p.price, qty: 1 }];
		});
	};

	const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

	const createOrder = async () => {
		const items = cart.map(i => ({ product: i.product, qty: i.qty }));
		const action = await dispatch(createOrderThunk({ items }));
		if (action.meta.requestStatus === 'fulfilled') {
			const orderId = action.payload._id;
			dispatch(confirmOrderThunk(orderId));
		}
	};

	return (
		<div className="p-4 sm:p-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div>
					<h2 className="font-semibold text-lg sm:text-xl mb-4">Products</h2>
					<ul className="space-y-3">
						{products.map(p => (
							<li key={p._id} className="flex flex-col sm:flex-row sm:justify-between gap-2 border p-3 rounded-lg">
								<div className="flex-1">
									<span className="font-medium">{p.name}</span>
									<span className="text-gray-600 ml-2">(${p.price})</span>
								</div>
								<button 
									className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors text-sm sm:text-base touch-manipulation" 
									onClick={() => addToCart(p)}
								>
									Add
								</button>
							</li>
						))}
					</ul>
				</div>
				<div>
					<h2 className="font-semibold text-lg sm:text-xl mb-4">Cart</h2>
					<div className="border rounded-lg p-4">
						<ul className="space-y-3 mb-4">
							{cart.map(i => (
								<li key={i.product} className="flex justify-between items-center border-b pb-2">
									<span className="text-sm sm:text-base">{i.name} x {i.qty}</span>
									<span className="font-medium">${(i.price * i.qty).toFixed(2)}</span>
								</li>
							))}
						</ul>
						<div className="font-bold text-lg mb-4 border-t pt-3">Total: ${total.toFixed(2)}</div>
						<button 
							className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-base touch-manipulation" 
							onClick={createOrder} 
							disabled={!cart.length}
						>
							Confirm Order
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
