import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';

export default function SideNavBar() {
	const [isOpen, setIsOpen] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { user } = useSelector((s) => s.auth);
	const dispatch = useDispatch();
	const location = useLocation();

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const closeSidebar = () => {
		setIsSidebarOpen(false);
	};

	const navigation = [
		{ name: 'Dashboard', href: '/', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z' },
		{ name: 'Inventory', href: '/inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
		{ name: 'Orders', href: '/orders', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
		{ name: 'New Order', href: '/orders/new', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
	];

	return (
		<>
			{/* Mobile Menu Button */}
			<div className="lg:hidden fixed top-4 left-4 z-50">
				<button
					onClick={toggleSidebar}
					className="bg-white p-2 rounded-md shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
				>
					<svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>

			{/* Desktop Dropdown Menu */}
			<div className="hidden lg:block fixed top-6 left-6 z-50">
				<div className="relative">
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center space-x-2"
					>
						<svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						</svg>
						<span className="text-sm font-medium text-gray-700">Menu</span>
						<svg className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>

					{/* Dropdown Menu */}
					{isOpen && (
						<div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
							{navigation.map((item) => (
								<Link
									key={item.name}
									to={item.href}
									onClick={() => setIsOpen(false)}
									className={`flex items-center px-4 py-3 text-sm transition-colors ${
										location.pathname === item.href
											? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
											: 'text-gray-700 hover:bg-gray-50'
									}`}
								>
									<svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
									</svg>
									{item.name}
								</Link>
							))}
							
							{/* User Info and Logout */}
							{user && (
								<>
									<div className="border-t border-gray-200 my-2"></div>
									<div className="px-4 py-2">
										<div className="flex items-center space-x-3 mb-3">
											<div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
												<span className="text-sm font-medium text-white">
													{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
												</span>
											</div>
											<div>
												<p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
												<p className="text-xs text-gray-500 capitalize">{user.role}</p>
											</div>
										</div>
										<button
											onClick={() => {
												dispatch(logout());
												setIsOpen(false);
											}}
											className="w-full flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
										>
											<svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
											</svg>
											Logout
										</button>
									</div>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Mobile Sidebar Overlay */}
			{isSidebarOpen && (
				<div 
					className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
					onClick={closeSidebar}
				/>
			)}

			{/* Mobile Sidebar */}
			<div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
				isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
			}`}>
				<div className="flex items-center justify-between p-4 border-b border-gray-200">
					<h2 className="text-lg font-semibold text-gray-900">JCS POS System</h2>
					<button
						onClick={closeSidebar}
						className="p-2 rounded-md hover:bg-gray-100 transition-colors"
					>
						<svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<nav className="mt-4">
					{navigation.map((item) => (
						<Link
							key={item.name}
							to={item.href}
							onClick={closeSidebar}
							className={`flex items-center px-4 py-3 text-sm transition-colors ${
								location.pathname === item.href
									? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
									: 'text-gray-700 hover:bg-gray-50'
							}`}
						>
							<svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
							</svg>
							{item.name}
						</Link>
					))}
				</nav>

				{/* User Info and Logout */}
				{user && (
					<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
						<div className="flex items-center justify-between mb-3">
							<div className="flex items-center space-x-3">
								<div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
									<span className="text-sm font-medium text-white">
										{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
									</span>
								</div>
								<div>
									<p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
									<p className="text-xs text-gray-500 capitalize">{user.role}</p>
								</div>
							</div>
						</div>
						<button
							onClick={() => {
								dispatch(logout());
								closeSidebar();
							}}
							className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
						>
							<svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
							Logout
						</button>
					</div>
				)}
			</div>

			{/* Click outside to close dropdown */}
			{isOpen && (
				<div 
					className="fixed inset-0 z-30"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</>
	);
}
