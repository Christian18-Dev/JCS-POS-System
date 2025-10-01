import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

export default function Dashboard() {
	const user = useSelector((s) => s.auth.user);
	const dispatch = useDispatch();
	return (
		<div>
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Dashboard</h1>
				<div className="flex items-center gap-2">
					<span className="text-sm">{user?.name} ({user?.role})</span>
					<button className="bg-gray-200 px-3 py-1" onClick={() => dispatch(logout())}>Logout</button>
				</div>
			</div>
			<p>Welcome to POS MVP.</p>
		</div>
	);
}
