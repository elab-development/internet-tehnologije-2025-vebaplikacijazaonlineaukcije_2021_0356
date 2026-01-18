import { useState } from 'react';
import { Shield, Users, Tag, Gavel, Receipt } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';

import UsersTab from '../components/admin/UsersTab';
import CategoriesTab from '../components/admin/CategoriesTab';
import AuctionsTab from '../components/admin/AuctionsTab';
import OrdersTab from '../components/admin/OrdersTab';

const TABS = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'categories', label: 'Categories', icon: Tag },
  { key: 'auctions', label: 'Auctions', icon: Gavel },
  { key: 'orders', label: 'Orders', icon: Receipt },
];

export default function Admin() {
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState('users');

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8'>
      {/* Header */}
      <div className='mb-5'>
        <div className='flex items-center gap-2'>
          <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
            <Shield size={18} />
          </div>
          <h1 className='text-2xl font-semibold text-slate-900'>
            Admin dashboard
          </h1>
        </div>
        <p className='mt-1 text-sm text-slate-600'>
          Signed in as{' '}
          <span className='font-semibold text-slate-900'>{user.fullName}</span>{' '}
          (<span className='font-semibold'>admin</span>)
        </p>
      </div>

      {/* Tabs */}
      <div className='rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='flex flex-wrap items-center gap-2 border-b border-slate-200 p-3'>
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.key;

            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={[
                  'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition',
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200',
                ].join(' ')}
              >
                <Icon size={16} />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className='p-4 sm:p-6'>
          {tab === 'users' && <UsersTab />}
          {tab === 'categories' && <CategoriesTab />}
          {tab === 'auctions' && <AuctionsTab />}
          {tab === 'orders' && <OrdersTab />}
        </div>
      </div>
    </div>
  );
}
