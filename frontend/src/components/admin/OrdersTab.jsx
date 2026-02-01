import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Receipt,
  ShoppingCart,
  Filter,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import { useOrdersStore } from '../../stores/ordersStore';
import { useCartItemsStore } from '../../stores/cartItemsStore';

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(2);
}

function formatDate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

function normalizeStr(v) {
  return String(v ?? '').trim();
}

function StatusPill({ status }) {
  const s = String(status || '').toLowerCase();

  const cls =
    s === 'active'
      ? 'bg-green-50 text-green-700 border-green-200'
      : s === 'finished'
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : s === 'archived'
          ? 'bg-slate-100 text-slate-700 border-slate-200'
          : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {status}
    </span>
  );
}

export default function OrdersTab() {
  const orders = useOrdersStore();
  const cart = useCartItemsStore();

  // Shared filter inputs
  const [buyerId, setBuyerId] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [q, setQ] = useState('');

  // Orders sorting
  const [orderSortBy, setOrderSortBy] = useState('orderDate');
  const [orderSortOrder, setOrderSortOrder] = useState('desc');

  // Cart sorting
  const [cartSortBy, setCartSortBy] = useState('addedAt');
  const [cartSortOrder, setCartSortOrder] = useState('desc');

  const ordersLoading = orders.isLoading;
  const cartLoading = cart.isLoading;

  const anyError = orders.error || cart.error;
  const anySuccess = orders.success || cart.success;

  function numOrEmpty(v) {
    const t = String(v ?? '').trim();
    if (!t) return '';
    const n = Number(t);
    return Number.isInteger(n) ? String(n) : '__invalid__';
  }

  async function loadAll({
    ordersPage = 1,
    cartPage = 1,
    keepMessages = false,
  } = {}) {
    if (!keepMessages) {
      orders.clearMessages?.();
      cart.clearMessages?.();
    }

    const bid = numOrEmpty(buyerId);
    const sid = numOrEmpty(sellerId);

    if (bid === '__invalid__' || sid === '__invalid__') return;

    await orders.fetchOrders?.({
      buyerId: bid || undefined,
      sellerId: sid || undefined,
      sortBy: orderSortBy,
      sortOrder: orderSortOrder,
      page: ordersPage,
      limit: orders.limit || 12,
    });

    await cart.fetchCartItems?.({
      buyerId: bid || undefined,
      sortBy: cartSortBy,
      sortOrder: cartSortOrder,
      page: cartPage,
      limit: cart.limit || 12,
    });
  }

  useEffect(() => {
    loadAll({ ordersPage: 1, cartPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ordersRows = useMemo(() => {
    const list = orders.items || [];
    const term = normalizeStr(q).toLowerCase();
    if (!term) return list;

    return list.filter((o) => {
      const title = normalizeStr(o?.auction?.title).toLowerCase();
      const buyer = normalizeStr(o?.user?.fullName).toLowerCase();
      const email = normalizeStr(o?.user?.email).toLowerCase();
      const idStr = String(o?.id ?? '').toLowerCase();
      return (
        title.includes(term) ||
        buyer.includes(term) ||
        email.includes(term) ||
        idStr.includes(term)
      );
    });
  }, [orders.items, q]);

  const cartRows = useMemo(() => {
    let list = cart.items || [];
    const sid = Number(String(sellerId || '').trim());
    if (Number.isInteger(sid) && sid > 0) {
      list = list.filter((ci) => ci?.auction?.sellerId === sid);
    }

    const term = normalizeStr(q).toLowerCase();
    if (!term) return list;

    return list.filter((ci) => {
      const title = normalizeStr(ci?.auction?.title).toLowerCase();
      const buyer = normalizeStr(ci?.user?.fullName).toLowerCase();
      const email = normalizeStr(ci?.user?.email).toLowerCase();
      const idStr = String(ci?.id ?? '').toLowerCase();
      return (
        title.includes(term) ||
        buyer.includes(term) ||
        email.includes(term) ||
        idStr.includes(term)
      );
    });
  }, [cart.items, q, sellerId]);

  const invalidBuyerId =
    buyerId.trim() && numOrEmpty(buyerId) === '__invalid__';
  const invalidSellerId =
    sellerId.trim() && numOrEmpty(sellerId) === '__invalid__';

  return (
    <div>
      {/* Header */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
              <Receipt size={18} />
            </div>
            <div className='text-lg font-semibold text-slate-900'>
              Orders & Cart Items
            </div>
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            Orders are completed purchases. Cart items are auctions awaiting
            order creation.
          </div>
        </div>

        <button
          onClick={() =>
            loadAll({
              ordersPage: orders.page || 1,
              cartPage: cart.page || 1,
            })
          }
          disabled={ordersLoading || cartLoading}
          className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60'
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters card */}
      <div className='mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
        <div className='mb-3 flex items-center gap-2'>
          <Filter size={16} className='text-slate-700' />
          <div className='text-sm font-semibold text-slate-900'>Filters</div>
        </div>

        <div className='grid gap-3 md:grid-cols-4'>
          <div>
            <div className='mb-1 text-xs font-semibold text-slate-600'>
              Buyer ID (admin)
            </div>
            <input
              value={buyerId}
              onChange={(e) => setBuyerId(e.target.value)}
              placeholder='e.g. 12'
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 ${
                invalidBuyerId
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-purple-400 focus:ring-purple-100'
              }`}
              disabled={ordersLoading || cartLoading}
            />
            {invalidBuyerId && (
              <div className='mt-1 text-xs text-red-600'>Must be integer</div>
            )}
          </div>

          <div>
            <div className='mb-1 text-xs font-semibold text-slate-600'>
              Seller ID (admin)
            </div>
            <input
              value={sellerId}
              onChange={(e) => setSellerId(e.target.value)}
              placeholder='e.g. 7'
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 ${
                invalidSellerId
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-slate-200 focus:border-purple-400 focus:ring-purple-100'
              }`}
              disabled={ordersLoading || cartLoading}
            />
            {invalidSellerId && (
              <div className='mt-1 text-xs text-red-600'>Must be integer</div>
            )}
            <div className='mt-1 text-[11px] text-slate-500'>
              Note: sellerId applies to Orders (server) and Cart Items
              (client-side).
            </div>
          </div>

          <div className='md:col-span-2'>
            <div className='mb-1 text-xs font-semibold text-slate-600'>
              Quick search (loaded rows)
            </div>
            <div className='relative'>
              <Search
                size={16}
                className='absolute left-3 top-2.5 text-slate-400'
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder='Search by auction title, buyer name/email, id…'
                className='w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                disabled={ordersLoading || cartLoading}
              />
            </div>
          </div>
        </div>

        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          {/* Orders sort */}
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <div className='text-xs font-semibold text-slate-700'>
              Orders sorting
            </div>
            <div className='mt-2 flex gap-2'>
              <select
                value={orderSortBy}
                onChange={(e) => setOrderSortBy(e.target.value)}
                className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                disabled={ordersLoading || cartLoading}
              >
                <option value='orderDate'>Order date</option>
                <option value='totalPrice'>Total price</option>
              </select>

              <select
                value={orderSortOrder}
                onChange={(e) => setOrderSortOrder(e.target.value)}
                className='w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                disabled={ordersLoading || cartLoading}
              >
                <option value='desc'>Desc</option>
                <option value='asc'>Asc</option>
              </select>
            </div>
          </div>

          {/* Cart sort */}
          <div className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <div className='text-xs font-semibold text-slate-700'>
              Cart items sorting
            </div>
            <div className='mt-2 flex gap-2'>
              <select
                value={cartSortBy}
                onChange={(e) => setCartSortBy(e.target.value)}
                className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                disabled={ordersLoading || cartLoading}
              >
                <option value='addedAt'>Added at</option>
                <option value='finalPrice'>Final price</option>
              </select>

              <select
                value={cartSortOrder}
                onChange={(e) => setCartSortOrder(e.target.value)}
                className='w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100'
                disabled={ordersLoading || cartLoading}
              >
                <option value='desc'>Desc</option>
                <option value='asc'>Asc</option>
              </select>
            </div>
          </div>
        </div>

        <div className='mt-4 flex flex-wrap items-center justify-end gap-2'>
          <button
            onClick={() => {
              setBuyerId('');
              setSellerId('');
              setQ('');
              setOrderSortBy('orderDate');
              setOrderSortOrder('desc');
              setCartSortBy('addedAt');
              setCartSortOrder('desc');
              setTimeout(() => loadAll({ ordersPage: 1, cartPage: 1 }), 0);
            }}
            disabled={ordersLoading || cartLoading}
            className='rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60'
          >
            Reset
          </button>

          <button
            onClick={() => loadAll({ ordersPage: 1, cartPage: 1 })}
            disabled={
              ordersLoading || cartLoading || invalidBuyerId || invalidSellerId
            }
            className='rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
          >
            Apply
          </button>
        </div>
      </div>

      {/* Messages */}
      {anyError && (
        <div className='mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          <div className='flex items-start gap-2'>
            <AlertTriangle size={18} className='mt-0.5' />
            <div>{anyError}</div>
          </div>
        </div>
      )}

      {anySuccess && (
        <div className='mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
          <div className='flex items-start gap-2'>
            <CheckCircle2 size={18} className='mt-0.5' />
            <div>{anySuccess}</div>
          </div>
        </div>
      )}

      {/* ORDERS TABLE */}
      <div className='mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <Receipt size={16} className='text-slate-700' />
            <div className='text-sm font-semibold text-slate-900'>Orders</div>
          </div>
          <div className='text-xs text-slate-600'>
            Total: <span className='font-semibold'>{orders.total ?? 0}</span>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-[1050px] w-full text-left text-sm'>
            <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-600'>
              <tr>
                <th className='px-4 py-3'>Order</th>
                <th className='px-4 py-3'>Buyer</th>
                <th className='px-4 py-3'>Auction</th>
                <th className='px-4 py-3'>Total</th>
                <th className='px-4 py-3'>Date</th>
                <th className='px-4 py-3 text-right'>Open</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-200'>
              {ordersLoading && ordersRows.length === 0 && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className='animate-pulse'>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-40 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-60 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-64 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-24 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-44 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='ml-auto h-8 w-24 rounded bg-slate-200' />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!ordersLoading && ordersRows.length === 0 && (
                <tr>
                  <td className='px-4 py-6 text-slate-600' colSpan={6}>
                    No orders found.
                  </td>
                </tr>
              )}

              {ordersRows.map((o) => (
                <tr key={o.id} className='hover:bg-slate-50'>
                  <td className='px-4 py-3'>
                    <div className='font-semibold text-slate-900'>#{o.id}</div>
                    <div className='text-xs text-slate-600'>
                      auctionId: {o.auctionId}
                    </div>
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    <div className='font-semibold text-slate-900'>
                      {o?.user?.fullName || '—'}
                    </div>
                    <div className='text-xs text-slate-600'>
                      {o?.user?.email || '—'}
                    </div>
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    <div className='font-semibold text-slate-900'>
                      {o?.auction?.title || '—'}
                    </div>
                    <div className='mt-1 text-xs text-slate-600'>
                      <StatusPill status={o?.auction?.status} />{' '}
                      <span className='ml-2'>
                        sellerId: {o?.auction?.sellerId ?? '—'}
                      </span>
                    </div>
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    {formatMoney(o.totalPrice)}
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    {formatDate(o.orderDate)}
                  </td>

                  <td className='px-4 py-3'>
                    <div className='flex justify-end'>
                      <Link
                        to={`/orders/${o.id}`}
                        className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50'
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Orders pagination */}
        <div className='flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            Page <span className='font-semibold'>{orders.page}</span> /{' '}
            <span className='font-semibold'>{orders.totalPages || 1}</span>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() =>
                loadAll({
                  ordersPage: Math.max(1, (orders.page || 1) - 1),
                  cartPage: cart.page || 1,
                  keepMessages: true,
                })
              }
              disabled={ordersLoading || (orders.page || 1) <= 1}
              className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50'
            >
              Prev
            </button>

            <button
              onClick={() =>
                loadAll({
                  ordersPage: Math.min(
                    orders.totalPages || 1,
                    (orders.page || 1) + 1,
                  ),
                  cartPage: cart.page || 1,
                  keepMessages: true,
                })
              }
              disabled={
                ordersLoading || (orders.page || 1) >= (orders.totalPages || 1)
              }
              className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CART ITEMS TABLE */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3'>
          <div className='flex items-center gap-2'>
            <ShoppingCart size={16} className='text-slate-700' />
            <div className='text-sm font-semibold text-slate-900'>
              Cart Items (pending orders)
            </div>
          </div>
          <div className='text-xs text-slate-600'>
            Total: <span className='font-semibold'>{cart.total ?? 0}</span>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-[1100px] w-full text-left text-sm'>
            <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-600'>
              <tr>
                <th className='px-4 py-3'>CartItem</th>
                <th className='px-4 py-3'>Buyer</th>
                <th className='px-4 py-3'>Auction</th>
                <th className='px-4 py-3'>Final price</th>
                <th className='px-4 py-3'>Added</th>
                <th className='px-4 py-3 text-right'>Open</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-200'>
              {cartLoading && cartRows.length === 0 && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className='animate-pulse'>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-44 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-60 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-72 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-24 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-44 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='ml-auto h-8 w-24 rounded bg-slate-200' />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!cartLoading && cartRows.length === 0 && (
                <tr>
                  <td className='px-4 py-6 text-slate-600' colSpan={6}>
                    No cart items found.
                  </td>
                </tr>
              )}

              {cartRows.map((ci) => (
                <tr key={ci.id} className='hover:bg-slate-50'>
                  <td className='px-4 py-3'>
                    <div className='font-semibold text-slate-900'>#{ci.id}</div>
                    <div className='text-xs text-slate-600'>
                      auctionId: {ci.auctionId}
                    </div>
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    <div className='font-semibold text-slate-900'>
                      {ci?.user?.fullName || '—'}
                    </div>
                    <div className='text-xs text-slate-600'>
                      {ci?.user?.email || '—'}
                    </div>
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    <div className='font-semibold text-slate-900'>
                      {ci?.auction?.title || '—'}
                    </div>
                    <div className='mt-1 text-xs text-slate-600'>
                      <StatusPill status={ci?.auction?.status} />{' '}
                      <span className='ml-2'>
                        sellerId: {ci?.auction?.sellerId ?? '—'}
                      </span>
                    </div>
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    {formatMoney(ci.finalPrice)}
                  </td>

                  <td className='px-4 py-3 text-slate-700'>
                    {formatDate(ci.addedAt)}
                  </td>

                  <td className='px-4 py-3'>
                    <div className='flex justify-end gap-2'>
                      <Link
                        to={`/cart-items/${ci.id}`}
                        className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50'
                      >
                        View
                      </Link>
                      <Link
                        to={`/auctions/${ci.auctionId}`}
                        className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50'
                      >
                        Auction
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cart pagination */}
        <div className='flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            Page <span className='font-semibold'>{cart.page}</span> /{' '}
            <span className='font-semibold'>{cart.totalPages || 1}</span>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={() =>
                loadAll({
                  ordersPage: orders.page || 1,
                  cartPage: Math.max(1, (cart.page || 1) - 1),
                  keepMessages: true,
                })
              }
              disabled={cartLoading || (cart.page || 1) <= 1}
              className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50'
            >
              Prev
            </button>

            <button
              onClick={() =>
                loadAll({
                  ordersPage: orders.page || 1,
                  cartPage: Math.min(
                    cart.totalPages || 1,
                    (cart.page || 1) + 1,
                  ),
                  keepMessages: true,
                })
              }
              disabled={
                cartLoading || (cart.page || 1) >= (cart.totalPages || 1)
              }
              className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50'
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}