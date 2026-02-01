import { Receipt } from 'lucide-react';

function formatMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(2);
}

export default function CartSummary({ total, totalSum, isBuyer, note }) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <div className='mb-2 flex items-center gap-2'>
        <Receipt size={18} className='text-slate-700' />
        <div className='text-base font-semibold text-slate-900'>Summary</div>
      </div>

      <div className='mt-3 space-y-2 text-sm text-slate-700'>
        <div className='flex items-center justify-between'>
          <span>Items</span>
          <span className='font-semibold'>{total ?? 0}</span>
        </div>

        <div className='flex items-center justify-between'>
          <span>Total (sum of final prices)</span>
          <span className='font-semibold text-slate-900'>
            {formatMoney(totalSum)}
          </span>
        </div>

        <div className='pt-2 text-xs text-slate-500'>{note}</div>

        {!isBuyer && (
          <div className='mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800'>
            Orders can only be created by buyers.
          </div>
        )}
      </div>
    </div>
  );
}