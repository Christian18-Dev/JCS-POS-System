import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../features/authSlice';
import { Navigate, Link } from 'react-router-dom';

export default function Register() {
	const dispatch = useDispatch();
	const { token, status, error } = useSelector((s) => s.auth);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');

	if (token) return <Navigate to="/" />;

	const onSubmit = (e) => {
		e.preventDefault();
		dispatch(registerUser({ name, email, password }));
	};

	return (
		<div className="max-w-sm mx-auto">
			<h1 className="text-2xl font-bold mb-4">Register</h1>
			<form onSubmit={onSubmit} className="space-y-3">
				<input className="w-full border p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
				<input className="w-full border p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<input className="w-full border p-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				<button className="w-full bg-blue-600 text-white p-2" disabled={status==='loading'}>{status==='loading'?'Loading...':'Register'}</button>
				{error && <div className="text-red-600 text-sm">{error}</div>}
			</form>
			<p className="mt-3 text-sm">Have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
		</div>
	);
}
