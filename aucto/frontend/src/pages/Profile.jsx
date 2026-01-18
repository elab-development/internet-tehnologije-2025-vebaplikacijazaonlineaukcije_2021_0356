import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Shield, ShoppingCart, Receipt, Gavel } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useCartItemsStore } from '../stores/cartItemsStore';
import { useOrdersStore } from '../stores/ordersStore';
import { useAuctionsStore } from '../stores/auctionsStore';
import { useParticipationStore } from '../stores/participationStore';

import BuyerProfilePanel from '../components/profile/BuyerProfilePanel';
import SellerProfilePanel from '../components/profile/SellerProfilePanel';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const role = user?.role; // admin | buyer | seller

  // Redirect admin -> /admin
  useEffect(() => {
    if (role === 'admin') navigate('/admin', { replace: true });
  }, [role, navigate]);

  // BUYER data
  const cart = useCartItemsStore();
  const orders = useOrdersStore();
  const participation = useParticipationStore();

  // SELLER data
  const auctions = useAuctionsStore();

  const [buyerTab, setBuyerTab] = useState('overview'); // overview | cart | orders | participating
  const [sellerTab, setSellerTab] = useState('active'); // active | finished

  // BUYER load
  useEffect(() => {
    if (!user) return;
    if (role !== 'buyer') return;

    cart.clearMessages?.();
    orders.clearMessages?.();
    participation.clearMessages?.();

    cart.fetchCartItems?.({
      page: 1,
      limit: 8,
      sortBy: 'addedAt',
      sortOrder: 'desc',
    });
    orders.fetchOrders?.({
      page: 1,
      limit: 8,
      sortBy: 'orderDate',
      sortOrder: 'desc',
    });
    participation.fetchMyParticipatingAuctions?.({
      status: 'active',
      page: 1,
      limit: 12,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?.id]);

  // SELLER load
  useEffect(() => {
    if (!user) return;
    if (role !== 'seller') return;

    auctions.clearMessages?.();
    auctions.fetchMyAuctions?.({
      page: 1,
      limit: 24,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, user?.id]);

  const isBuyer = role === 'buyer';
  const isSeller = role === 'seller';

  const sellerActive = useMemo(() => {
    const list = auctions.items || [];
    return list.filter((a) => a.status === 'active');
  }, [auctions.items]);

  const sellerFinished = useMemo(() => {
    const list = auctions.items || [];
    return list.filter(
      (a) => a.status === 'finished' || a.status === 'archived',
    );
  }, [auctions.items]);

  if (!user) {
    return (
      <div className='mx-auto w-full max-w-6xl px-4 py-8'>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='text-lg font-semibold text-slate-900'>Profile</div>
          <div className='mt-1 text-sm text-slate-600'>
            You need to login to view your profile.
          </div>
        </div>
      </div>
    );
  }

  if (role === 'admin') {
    return (
      <div className='mx-auto w-full max-w-6xl px-4 py-8'>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <div className='flex items-center gap-2'>
            <Shield size={18} className='text-slate-700' />
            <div className='text-lg font-semibold text-slate-900'>
              Redirecting…
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8'>
      <div className='mb-5'>
        <div className='flex items-center gap-2'>
          <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
            <User size={18} />
          </div>
          <h1 className='text-2xl font-semibold text-slate-900'>Profile</h1>
        </div>
        <p className='mt-1 text-sm text-slate-600'>
          Signed in as{' '}
          <span className='font-semibold text-slate-900'>{user.fullName}</span>{' '}
          (<span className='font-semibold'>{user.role}</span>)
        </p>
      </div>

      {isBuyer && (
        <BuyerProfilePanel
          user={user}
          tab={buyerTab}
          onTabChange={setBuyerTab}
          cart={cart}
          orders={orders}
          participation={participation}
        />
      )}

      {isSeller && (
        <SellerProfilePanel
          user={user}
          tab={sellerTab}
          onTabChange={setSellerTab}
          isLoading={auctions.isLoading}
          error={auctions.error}
          activeAuctions={sellerActive}
          finishedAuctions={sellerFinished}
        />
      )}
    </div>
  );
}
