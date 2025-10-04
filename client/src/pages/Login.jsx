import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/authSlice';
import { Navigate, Link } from 'react-router-dom';

export default function Login() {
	const dispatch = useDispatch();
	const { token, status, error } = useSelector((s) => s.auth);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	if (token) return <Navigate to="/" />;

	const onSubmit = (e) => {
		e.preventDefault();
		dispatch(loginUser({ email, password }));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
			{/* Floating shapes - hidden on mobile for better performance */}
			<div className="absolute inset-0 overflow-hidden hidden sm:block">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
				<div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
				<div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl"></div>
				<div className="absolute top-1/3 left-1/3 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
			</div>
			
			<div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
				<div className="w-full max-w-md">
					
					{/* Glass effect card */}
					<div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">

						{/* Logo placeholder */}
						<div className="flex justify-center mb-4 sm:mb-6">
							<div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center">
								<span className="text-xl sm:text-2xl font-bold text-white">POS</span>
							</div>
						</div>
						
						{/* Login form */}
						<div className="text-center mb-6 sm:mb-8">
							<h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome to JCS POS</h1>
						</div>
						
						<form onSubmit={onSubmit} className="space-y-4 sm:space-y-6">
							<div>
								<input 
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 sm:py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all text-base" 
									placeholder="Email address" 
									type="email" 
									value={email} 
									onChange={(e) => setEmail(e.target.value)} 
								/>
							</div>
							<div>
								<input 
									className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 sm:py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all text-base" 
									placeholder="Password" 
									type="password" 
									value={password} 
									onChange={(e) => setPassword(e.target.value)} 
								/>
							</div>
							
							{error && <div className="text-red-300 text-sm text-center">{error}</div>}
							
							<div className="text-right">
								<Link to="#" className="text-blue-200 hover:text-white text-sm transition-colors">Forgot password?</Link>
							</div>
							
							<button 
								className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-xl py-3 sm:py-3 transition-all transform hover:scale-[1.02] disabled:opacity-60 disabled:transform-none text-base touch-manipulation" 
								disabled={status==='loading'}
							>
								{status==='loading'?'Signing in...':'Sign in'}
							</button>
						</form>
						
						{/* Divider */}
						<div className="flex items-center my-4 sm:my-6">
							<div className="flex-1 border-t border-white/20"></div>
							<div className="flex-1 border-t border-white/20"></div>
						</div>
					</div>
					
					{/* Footer */}
					<div className="text-center mt-6 sm:mt-8">
						<p className="text-blue-200 text-sm">
							Don't have an account?{' '}
							<Link to="/register" className="text-white hover:text-blue-100 font-medium transition-colors">Register for free</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
