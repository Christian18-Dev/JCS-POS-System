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
		<div className="grid grid-cols-2 gap-4">
			<div>
				<h2 className="font-semibold mb-2">Products</h2>
				<ul className="space-y-2">
					{products.map(p => (
						<li key={p._id} className="flex justify-between border p-2">
							<span>{p.name} (${p.price})</span>
							<button className="bg-blue-600 text-white px-2" onClick={() => addToCart(p)}>Add</button>
						</li>
					))}
				</ul>
			</div>
			<div>
				<h2 className="font-semibold mb-2">Cart</h2>
				<ul className="space-y-2 mb-2">
					{cart.map(i => (
						<li key={i.product} className="flex justify-between border p-2">
							<span>{i.name} x {i.qty}</span>
							<span>${(i.price * i.qty).toFixed(2)}</span>
						</li>
					))}
				</ul>
				<div className="font-bold mb-2">Total: ${total.toFixed(2)}</div>
				<button className="bg-green-600 text-white px-3 py-2" onClick={createOrder} disabled={!cart.length}>Confirm Order</button>
			</div>
		</div>
	);
}
