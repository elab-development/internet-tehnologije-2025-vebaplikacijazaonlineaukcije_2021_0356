import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Info } from 'lucide-react';

import { useAuthStore } from '../stores/authStore';
import { useCartItemsStore } from '../stores/cartItemsStore';
import { useOrdersStore } from '../stores/ordersStore';

import CartToolbar from '../components/cart/CartToolbar';
import CartItemsList from '../components/cart/CartItemsList';
import Pagination from '../components/auctions/Pagination';
import CartSummary from '../components/cart/CartSummary';

export default function Cart() {
  const user = useAuthStore((s) => s.user);

  const {
    items,
    page,
    totalPages,
    total,
    isLoading,
    error,
    fetchCartItems,
    clearMessages,
  } = useCartItemsStore();

  const {
    createOrderFromCartItem,
    isLoading: orderLoading,
    error: orderError,
    success: orderSuccess,
    clearMessages: clearOrderMessages,
  } = useOrdersStore();

  const role = user?.role; // admin | seller | buyer
  const isBuyer = role === 'buyer';
  const isAdmin = role === 'admin';

  const [sortBy, setSortBy] = useState('addedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [buyerId, setBuyerId] = useState(''); // admin only
  const [creatingCartId, setCreatingCartId] = useState(null);

  async function load(nextPage = 1) {
    clearMessages?.();

    await fetchCartItems({
      page: nextPage,
      limit: 12,
      sortBy,
      sortOrder,
      buyerId: isAdmin && buyerId ? buyerId : undefined,
    });
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, buyerId, role]);

  const totalSum = useMemo(() => {
    const nums = (items || [])
      .map((x) => Number(x.finalPrice))
      .filter(Number.isFinite);
    return nums.reduce((a, b) => a + b, 0);
  }, [items]);

  async function handleCreateOrder(cartId) {
    if (!isBuyer) return;

    clearOrderMessages?.();
    setCreatingCartId(cartId);

    const created = await createOrderFromCartItem({ cartId });

    setCreatingCartId(null);

    if (created) {
      await load(1);
    }
  }

  return (
    <div className='mx-auto w-full max-w-6xl px-4 py-8'>
      <div className='mb-5 flex flex-col gap-1'>
        <div className='flex items-center gap-2'>
          <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
            <ShoppingCart size={18} />
          </div>
          <h1 className='text-2xl font-semibold text-slate-900'>Cart</h1>
        </div>

        <p className='text-sm text-slate-600'>
          {isBuyer
            ? 'Review your cart items and create orders in one click.'
            : isAdmin
              ? 'Admin view: browse cart items. Ordering is available only for buyers.'
              : 'Seller view: cart items related to your auctions. Ordering is available only for buyers.'}
        </p>
      </div>

      <CartToolbar
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        buyerId={buyerId}
        onBuyerIdChange={setBuyerId}
        showBuyerFilter={isAdmin}
        disabled={isLoading || orderLoading}
      />

      {/* Messages */}
      {(error || orderError) && (
        <div className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error || orderError}
        </div>
      )}

      {orderSuccess && (
        <div className='mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
          {orderSuccess}
        </div>
      )}

      {!user && (
        <div className='mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700'>
          <div className='flex items-start gap-2'>
            <Info size={18} className='mt-0.5 text-slate-500' />
            <div>
              You need to{' '}
              <Link
                to='/login'
                className='font-semibold text-purple-700 hover:underline'
              >
                login
              </Link>{' '}
              to view your cart.
            </div>
          </div>
        </div>
      )}

      <div className='mt-5 grid gap-6 lg:grid-cols-3'>
        {/* List */}
        <div className='lg:col-span-2'>
          <CartItemsList
            items={items}
            isLoading={isLoading}
            canCreateOrder={isBuyer}
            creatingCartId={creatingCartId}
            onCreateOrder={handleCreateOrder}
            disabled={orderLoading}
          />

          <div className='mt-6'>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              onPageChange={(p) => load(p)}
              disabled={isLoading || orderLoading}
            />
          </div>
        </div>

        {/* Summary */}
        <div className='space-y-4'>
          <CartSummary
            total={total}
            totalSum={totalSum}
            isBuyer={isBuyer}
            note={
              isBuyer
                ? 'Each cart item creates a separate order.'
                : 'Only buyers can create orders.'
            }
          />

          {!isBuyer && user && (
            <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <div className='text-sm font-semibold text-slate-900'>
                Ordering
              </div>
              <div className='mt-1 text-sm text-slate-600'>
                Your role is <span className='font-semibold'>{role}</span>.
                Creating orders is allowed only for buyers.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}