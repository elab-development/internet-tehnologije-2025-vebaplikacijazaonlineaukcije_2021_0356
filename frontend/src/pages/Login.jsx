import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    clearError();
    const user = await login({ email, password });
    if (user) navigate('/');
  }

  return (
    <div className='min-h-full'>
      <div className='mx-auto flex min-h-full max-w-6xl items-center justify-center px-4 py-12'>
        <div className='w-full max-w-md'>
          <div className='mb-6 text-center'>
            <div className='mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow'>
              <LogIn size={20} />
            </div>
            <h1 className='text-2xl font-semibold text-slate-900'>Login</h1>
            <p className='mt-1 text-sm text-slate-600'>
              Sign in to participate in auctions
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
          >
            {error && (
              <div className='mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                {error}
              </div>
            )}

            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Email
            </label>
            <div className='mb-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100'>
              <Mail size={18} className='text-slate-500' />
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder='you@example.com'
                className='w-full bg-transparent text-sm outline-none'
              />
            </div>

            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Password
            </label>
            <div className='mb-6 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100'>
              <Lock size={18} className='text-slate-500' />
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder='••••••••'
                className='w-full bg-transparent text-sm outline-none'
              />
            </div>

            <button
              disabled={isLoading}
              className='w-full rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
            >
              {isLoading ? 'Signing in…' : 'Login'}
            </button>

            <p className='mt-4 text-center text-sm text-slate-600'>
              Don’t have an account?{' '}
              <Link
                to='/register'
                className='font-semibold text-purple-700 hover:underline'
              >
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}