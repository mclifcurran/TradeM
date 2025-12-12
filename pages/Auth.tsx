import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        db.login(email, password);
      } else {
        if (!name.trim()) throw new Error("Name is required");
        db.register(email, password, name);
        db.login(email, password); // Auto login after register
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center w-16 h-16 bg-navy-50 rounded-full mb-4">
                 <i className="ph-fill ph-wrench text-brand-600 text-3xl"></i>
             </div>
             <h1 className="text-2xl font-bold text-navy-900 tracking-tight">Trade<span className="text-brand-600">Mate</span></h1>
             <p className="text-gray-500 text-sm mt-2">
                 {isLogin ? 'Welcome back! Log in to track expenses.' : 'Create an account to get started.'}
             </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                    {error}
                </div>
            )}
            
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                  placeholder="John Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div>
               <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Password</label>
               <input 
                type="password" 
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button 
                type="submit" 
                className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-lg shadow-lg hover:shadow-xl transition transform active:scale-95"
            >
                {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-sm text-gray-600 hover:text-brand-600 font-medium"
              >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;