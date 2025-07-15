import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
    const [email, setEmail] = useState('');
    const [nis, setNis] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('email', email)
            .eq('nis', nis) // You treat NIS as password

        if (data.length > 0) {
            localStorage.setItem('user', JSON.stringify(data[0]));
            navigate('/');
        } else {
            setError("Invalid email or NIS");
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-900">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl space-y-4 shadow-xl">
                <h1 className="text-2xl font-bold">Login</h1>
                {error && <p className="text-red-600">{error}</p>}
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border rounded" />
                <input type="password" placeholder="NIS (Student ID)" value={nis} onChange={e => setNis(e.target.value)} required className="w-full p-2 border rounded" />
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold p-2 rounded">Login</button>
            </form>
        </div>
    );
};

export default Login;
