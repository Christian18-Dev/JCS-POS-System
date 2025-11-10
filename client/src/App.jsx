import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SideNavBar from './components/SideNavBar.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import NewOrder from './pages/NewOrder.jsx'
import InvoiceViewer from './pages/InvoiceViewer.jsx'
import Orders from './pages/Orders.jsx'
import { verifyToken } from './features/authSlice'
import { useEffect } from 'react'

function App() {
	const dispatch = useDispatch()
	const token = useSelector((s) => s.auth.token)
	const location = useLocation()
	
	// Don't show navigation on login and register pages
	const showNav = !['/login', '/register'].includes(location.pathname)
	
	// Boot-time token validation (run in effect to avoid dispatching during render)
	useEffect(() => {
		if (token) {
			dispatch(verifyToken())
		}
	}, [dispatch, token])
	
	return (
		<div className={`min-h-screen bg-gray-50 ${showNav ? 'lg:pl-64' : ''}`}>
			{showNav && <SideNavBar />}
			<main className={showNav ? "pt-16 sm:pt-20 lg:pt-10" : ""}>
				<Routes>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/" element={token ? <Dashboard /> : <Navigate to="/login" />} />
					<Route path="/inventory" element={token ? <Inventory /> : <Navigate to="/login" />} />
					<Route path="/orders" element={token ? <Orders /> : <Navigate to="/login" />} />
					<Route path="/orders/new" element={token ? <NewOrder /> : <Navigate to="/login" />} />
					<Route path="/invoice/:invoiceNumber" element={token ? <InvoiceViewer /> : <Navigate to="/login" />} />
				</Routes>
			</main>
		</div>
	)
}

export default App
