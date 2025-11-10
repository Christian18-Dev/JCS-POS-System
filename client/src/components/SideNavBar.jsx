import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

const navigation = [
	{ name: 'Dashboard', href: '/', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
	{ name: 'Inventory', href: '/inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
	{ name: 'Orders', href: '/orders', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
	{ name: 'New Order', href: '/orders/new', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
];

const NavLinks = ({ locationPath, onNavigate, className = '' }) => (
	<nav className={className}>
		{navigation.map((item) => {
			const isActive = locationPath === item.href;
			return (
				<Link
					key={item.name}
					to={item.href}
					onClick={onNavigate}
					className={`flex items-center px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
						isActive
							? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
							: 'text-gray-700 hover:bg-gray-100'
					}`}
				>
					<svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
					</svg>
					<span className="truncate">{item.name}</span>
				</Link>
			);
		})}
	</nav>
);

export default function SideNavBar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const { user } = useSelector((s) => s.auth);
	const dispatch = useDispatch();
	const location = useLocation();

	const handleLogout = () => {
		dispatch(logout());
		setMobileOpen(false);
	};

	return (
		<>
			{/* Mobile header */}
			<header className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
				<div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
					<button
						onClick={() => setMobileOpen((prev) => !prev)}
						className="p-2 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors"
						aria-label="Open navigation"
					>
						<svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
					</button>
					<div className="text-base font-semibold text-gray-900">JCS POS System</div>
					<div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
						{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
					</div>
				</div>
			</header>

			{/* Desktop sidebar */}
			<aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-100 lg:shadow-sm lg:z-30">
				<div className="px-6 py-6 border-b border-gray-100">
					<div className="text-lg font-bold text-gray-900">JCS POS System</div>
				</div>

				<div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
					<NavLinks locationPath={location.pathname} />
				</div>

				{user && (
					<div className="px-4 py-5 border-t border-gray-100">
						<div className="flex items-center space-x-3 mb-4">
							<div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
								{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
							</div>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
								<p className="text-xs text-gray-500 capitalize truncate">{user.role || 'staff'}</p>
							</div>
						</div>
						<button
							onClick={handleLogout}
							className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							Logout
						</button>
					</div>
				)}
			</aside>

			{/* Mobile drawer */}
			<div
				className={`lg:hidden fixed inset-y-0 left-0 z-40 w-72 max-w-[80%] bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
					mobileOpen ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
					<div>
						<p className="text-lg font-semibold text-gray-900">JCS POS System</p>
						<p className="text-xs text-gray-500">Your daily operations hub</p>
					</div>
					<button
						onClick={() => setMobileOpen(false)}
						className="p-2 rounded-md hover:bg-gray-100 transition-colors"
						aria-label="Close navigation"
					>
						<svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="px-4 py-6 space-y-6 overflow-y-auto h-full pb-28">
					<NavLinks locationPath={location.pathname} onNavigate={() => setMobileOpen(false)} className="space-y-2" />
				</div>

				{user && (
					<div className="absolute bottom-0 inset-x-0 px-4 py-5 border-t border-gray-100 bg-gray-50">
						<div className="flex items-center space-x-3 mb-4">
							<div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
								{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
							</div>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-gray-900 truncate">{user.name || 'User'}</p>
								<p className="text-xs text-gray-500 capitalize truncate">{user.role || 'staff'}</p>
							</div>
						</div>
						<button
							onClick={handleLogout}
							className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
						>
							<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							Logout
						</button>
					</div>
				)}
			</div>

			{/* Mobile overlay */}
			{mobileOpen && (
				<div
					className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-30"
					onClick={() => setMobileOpen(false)}
					aria-hidden="true"
				/>
			)}
		</>
	);
}
