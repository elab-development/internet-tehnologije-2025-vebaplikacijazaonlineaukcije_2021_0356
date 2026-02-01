import CartItemCard from './CartItemCard';

export default function CartItemsList({
  items,
  isLoading,
  canCreateOrder,
  creatingCartId,
  onCreateOrder,
  disabled,
}) {
  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'
          >
            <div className='h-4 w-2/3 animate-pulse rounded bg-slate-200' />
            <div className='mt-3 h-3 w-full animate-pulse rounded bg-slate-200' />
            <div className='mt-2 h-3 w-5/6 animate-pulse rounded bg-slate-200' />
            <div className='mt-4 h-9 w-full animate-pulse rounded-xl bg-slate-200' />
          </div>
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm'>
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      {items.map((it) => (
        <CartItemCard
          key={it.id}
          item={it}
          canCreateOrder={canCreateOrder}
          isCreating={creatingCartId === it.id}
          onCreateOrder={() => onCreateOrder(it.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}