import { useSelector } from 'react-redux';

export default function Dashboard() {
	const user = useSelector((s) => s.auth.user);
	return (
		<div className="p-4 sm:p-6">
			<div className="mb-6">
				<h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
			</div>
			<p className="text-base sm:text-lg">Welcome to POS MVP.</p>
		</div>
	);
}
