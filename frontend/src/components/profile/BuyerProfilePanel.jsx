import { ShoppingCart, Receipt, Gavel, User as UserIcon } from 'lucide-react';
import AuctionCard from '../auctions/AuctionCard';

function Stat({ icon: Icon, label, value }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex items-center gap-2'>
        <Icon size={18} className='text-slate-700' />
        <div className='text-sm font-medium text-slate-700'>{label}</div>
      </div>
      <div className='mt-2 text-2xl font-semibold text-slate-900'>{value}</div>
    </div>
  );
}

function SmallListCard({ title, children }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='text-base font-semibold text-slate-900'>{title}</div>
      <div className='mt-3'>{children}</div>
    </div>
  );
}

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(2);
}

export default function BuyerProfilePanel({
  user,
  tab,
  onTabChange,
  cart,
  orders,
  participation,
}) {
  const cartItems = cart.items || [];
  const orderItems = orders.items || [];

  const participating = participation.items || [];

  return (
    <div className='space-y-6'>
      {/* Tabs */}
      <div className='flex flex-wrap gap-2'>
        {[
          { id: 'overview', label: 'Overview', icon: UserIcon },
          { id: 'cart', label: 'Cart items', icon: ShoppingCart },
          { id: 'orders', label: 'Orders', icon: Receipt },
          { id: 'participating', label: 'Participating', icon: Gavel },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold shadow-sm ${
              tab === t.id
                ? 'border-purple-200 bg-purple-50 text-purple-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <>
          <div className='grid gap-4 md:grid-cols-3'>
            <Stat
              icon={ShoppingCart}
              label='Cart items'
              value={cart.total ?? cartItems.length ?? 0}
            />
            <Stat
              icon={Receipt}
              label='Orders'
              value={orders.total ?? orderItems.length ?? 0}
            />
            <Stat
              icon={Gavel}
              label='Active participations'
              value={participating.length}
            />
          </div>

          <div className='grid gap-6 lg:grid-cols-2'>
            <SmallListCard title='Profile details'>
              <div className='space-y-2 text-sm text-slate-700'>
                <div>
                  <span className='font-medium'>Full name:</span>{' '}
                  {user.fullName}
                </div>
                <div>
                  <span className='font-medium'>Email:</span> {user.email}
                </div>
                <div>
                  <span className='font-medium'>Role:</span> {user.role}
                </div>
                {user.status && (
                  <div>
                    <span className='font-medium'>Status:</span> {user.status}
                  </div>
                )}
              </div>
            </SmallListCard>

            <SmallListCard title='Participating (quick view)'>
              {participation.isLoading ? (
                <div className='text-sm text-slate-600'>Loading…</div>
              ) : participating.length === 0 ? (
                <div className='text-sm text-slate-600'>
                  You are not participating in any active auctions.
                </div>
              ) : (
                <div className='space-y-3'>
                  {participating.slice(0, 5).map((p) => (
                    <div
                      key={p.auction.id}
                      className='rounded-xl border border-slate-200 p-4'
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0'>
                          <div className='truncate font-semibold text-slate-900'>
                            {p.auction.title}
                          </div>
                          <div className='mt-1 text-xs text-slate-600'>
                            Your bid:{' '}
                            <span className='font-semibold'>
                              {formatMoney(p.myBid?.amount)}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                            p.isWinning
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {p.isWinning ? 'Winning' : 'Not winning'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SmallListCard>
          </div>
        </>
      )}

      {/* Cart */}
      {tab === 'cart' && (
        <SmallListCard title='Your cart items'>
          {cart.isLoading ? (
            <div className='text-sm text-slate-600'>Loading…</div>
          ) : cartItems.length === 0 ? (
            <div className='text-sm text-slate-600'>No cart items.</div>
          ) : (
            <div className='space-y-3'>
              {cartItems.map((it) => (
                <div
                  key={it.id}
                  className='rounded-xl border border-slate-200 p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate font-semibold text-slate-900'>
                        {it.auction?.title || `Auction #${it.auctionId}`}
                      </div>
                      <div className='mt-1 text-sm text-slate-600'>
                        Final: {formatMoney(it.finalPrice)}
                      </div>
                    </div>
                    <div className='text-xs text-slate-500'>#{it.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SmallListCard>
      )}

      {/* Orders */}
      {tab === 'orders' && (
        <SmallListCard title='Your orders'>
          {orders.isLoading ? (
            <div className='text-sm text-slate-600'>Loading…</div>
          ) : orderItems.length === 0 ? (
            <div className='text-sm text-slate-600'>No orders.</div>
          ) : (
            <div className='space-y-3'>
              {orderItems.map((o) => (
                <div
                  key={o.id}
                  className='rounded-xl border border-slate-200 p-4'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <div className='truncate font-semibold text-slate-900'>
                        {o.auction?.title || `Auction #${o.auctionId}`}
                      </div>
                      <div className='mt-1 text-sm text-slate-600'>
                        Total: {formatMoney(o.totalPrice)}
                      </div>
                    </div>
                    <div className='text-xs text-slate-500'>Order #{o.id}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SmallListCard>
      )}

      {/* Participating grid */}
      {tab === 'participating' && (
        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='text-base font-semibold text-slate-900'>
            Auctions you participate in
          </div>

          {participation.error && (
            <div className='mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
              {participation.error}
            </div>
          )}

          {participation.isLoading ? (
            <div className='mt-3 text-sm text-slate-600'>Loading…</div>
          ) : participating.length === 0 ? (
            <div className='mt-3 text-sm text-slate-600'>
              No active participations.
            </div>
          ) : (
            <div className='mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {participating.map((p) => (
                <div key={p.auction.id} className='relative'>
                  <AuctionCard auction={p.auction} />
                  <div
                    className={`pointer-events-none absolute left-3 top-3 rounded-xl px-3 py-1 text-xs font-semibold ${
                      p.isWinning
                        ? 'bg-green-50 text-green-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}
                  >
                    {p.isWinning ? 'WINNING' : 'NOT WINNING'}
                  </div>
                  <div className='pointer-events-none absolute left-3 top-[54px] rounded-xl bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700'>
                    My bid: {formatMoney(p.myBid?.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}