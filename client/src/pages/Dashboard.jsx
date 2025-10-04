import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

export default function Dashboard() {
	const user = useSelector((s) => s.auth.user);
	const dispatch = useDispatch();
	return (
		<div className="p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
				<h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
				<div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
					<span className="text-sm sm:text-base">{user?.name} ({user?.role})</span>
					<button 
						className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded transition-colors text-sm sm:text-base touch-manipulation" 
						onClick={() => dispatch(logout())}
					>
						Logout
					</button>
				</div>
			</div>
			<p className="text-base sm:text-lg">Welcome to POS MVP.</p>
		</div>
	);
}
