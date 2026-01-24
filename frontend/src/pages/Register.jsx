import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, Briefcase } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');

  async function onSubmit(e) {
    e.preventDefault();
    clearError();
    const user = await register({ fullName, email, password, role });
    if (user) navigate('/');
  }

  return (
    <div className='min-h-full'>
      <div className='mx-auto flex min-h-full max-w-6xl items-center justify-center px-4 py-12'>
        <div className='w-full max-w-md'>
          <div className='mb-6 text-center'>
            <div className='mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow'>
              <UserPlus size={20} />
            </div>
            <h1 className='text-2xl font-semibold text-slate-900'>Register</h1>
            <p className='mt-1 text-sm text-slate-600'>
              Create your auction account
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
              Full name
            </label>
            <div className='mb-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100'>
              <User size={18} className='text-slate-500' />
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder='John Doe'
                className='w-full bg-transparent text-sm outline-none'
              />
            </div>

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
            <div className='mb-4 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100'>
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

            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Account type
            </label>
            <div className='mb-6 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100'>
              <Briefcase size={18} className='text-slate-500' />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className='w-full bg-transparent text-sm outline-none'
              >
                <option value='buyer'>Buyer (customer)</option>
                <option value='seller'>Seller</option>
              </select>
            </div>

            <button
              disabled={isLoading}
              className='w-full rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
            >
              {isLoading ? 'Creating account…' : 'Register'}
            </button>

            <p className='mt-4 text-center text-sm text-slate-600'>
              Already have an account?{' '}
              <Link
                to='/login'
                className='font-semibold text-purple-700 hover:underline'
              >
                Login
              </Link>
            </p>
          </form>

          <p className='mt-3 text-center text-xs text-slate-500'>
            Seller accounts require admin activation.
          </p>
        </div>
      </div>
    </div>
  );
}