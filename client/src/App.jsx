import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import NewOrder from './pages/NewOrder.jsx'
import InvoiceViewer from './pages/InvoiceViewer.jsx'
import Orders from './pages/Orders.jsx'

function App() {
	const token = useSelector((s) => s.auth.token)
	const location = useLocation()
	
	// Don't show navigation on login and register pages
	const showNav = !['/login', '/register'].includes(location.pathname)
	
	return (
		<div className="min-h-screen bg-gray-50">
			{showNav && (
				<nav className="bg-white border-b px-4 sm:px-6 py-3">
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm">
							<Link className="hover:text-blue-600 transition-colors py-1 px-2 rounded hover:bg-gray-100 touch-manipulation" to="/">Dashboard</Link>
							<Link className="hover:text-blue-600 transition-colors py-1 px-2 rounded hover:bg-gray-100 touch-manipulation" to="/inventory">Inventory</Link>
							<Link className="hover:text-blue-600 transition-colors py-1 px-2 rounded hover:bg-gray-100 touch-manipulation" to="/orders">Orders</Link>
							<Link className="hover:text-blue-600 transition-colors py-1 px-2 rounded hover:bg-gray-100 touch-manipulation" to="/orders/new">New Order</Link>
						</div>
						<div className="text-xs sm:text-sm text-gray-500 font-medium">MERN POS MVP</div>
					</div>
				</nav>
			)}
			<div className={showNav ? "p-4 sm:p-6 max-w-6xl mx-auto" : ""}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
					<Route path="/inventory" element={token ? <Inventory /> : <Navigate to="/login" />} />
					<Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
					<Route path="/orders/new" element={token ? <NewOrder /> : <Navigate to="/login" />} />
					<Route path="/invoice/:invoiceNumber" element={token ? <InvoiceViewer /> : <Navigate to="/login" />} />
				</Routes>
			</div>
		</div>
	)
}

export default App
