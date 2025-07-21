import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ccLogo from '../assets/cc.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        const cleanEmail = email.trim();
        const cleanPassword = password.trim();

        const { data, error } = await supabase
            .from('student')
            .select('*')
            .eq('student_email', cleanEmail)
            .eq('student_password', cleanPassword);

        if (error) {
            setError('Login failed: ' + error.message);
            return;
        }

        if (!data || data.length === 0) {
            setError('Invalid email or password');
            return;
        }

        if (data.length > 1) {
            setError('Multiple users found. Please contact support.');
            return;
        }
        
        localStorage.setItem('user', JSON.stringify(data[0]));
        navigate('/');
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 relative overflow-hidden flex items-center justify-center px-4">
            {/* Background Decorations */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full blur-3xl"></div>
            </div>

            {/* Login Card */}
            <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <img
                        src={ccLogo}
                        alt="Canisius College Jakarta"
                        className="mx-auto mb-2"
                        style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                    />
                    <h1 className="text-white text-3xl font-bold">Canisius College Jakarta</h1>
                    <p className="text-yellow-400 font-semibold text-lg mt-1">Career Day Login</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {error && <div className="text-red-500 text-sm text-center">{error}</div>}
                    <div>
                        <label className="block text-white text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                        />
                    </div>
                    <div>
                        <label className="block text-white text-sm font-medium mb-1">Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-300"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold py-3 rounded-lg hover:scale-105 hover:from-yellow-300 hover:to-orange-400 transition-all duration-300"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
