import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      login(res.data); // Save to context
      navigate('/dashboard'); // Go to dashboard!
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_0.9fr] rounded-[2rem] overflow-hidden bg-white border border-slate-200 shadow-2xl shadow-slate-200">
        <div className="hidden lg:block bg-slate-950 p-10 text-white relative overflow-hidden">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20" />
          <div className="relative">
            <p className="text-blue-300 font-bold uppercase tracking-[0.25em] text-xs">Secure Access</p>
            <h1 className="text-4xl font-black mt-4">Welcome back to HostelCore.</h1>
            <p className="text-slate-300 mt-4 leading-7">Manage rooms, payments, maintenance, and resident communication from a polished dashboard.</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 sm:p-10">
          <h2 className="text-3xl font-black text-slate-900">Login</h2>
          <p className="text-slate-500 mt-2 mb-8">Enter your account details to continue.</p>
        
          {error && <p className="text-red-600 bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-5 text-sm font-semibold">{error}</p>}

          <input 
            type="email" placeholder="Email" required 
            className="soft-input mb-4"
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" placeholder="Password" required 
            className="soft-input mb-6"
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
            Login
          </button>
          <p className="text-center text-sm text-slate-500 mt-6">
            New resident? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Apply now</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;