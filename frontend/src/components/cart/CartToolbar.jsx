import { ArrowUpDown, Filter } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'addedAt', label: 'Added at' },
  { value: 'finalPrice', label: 'Final price' },
];

export default function CartToolbar({
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  buyerId,
  onBuyerIdChange,
  showBuyerFilter,
  disabled,
}) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='grid gap-3 md:grid-cols-2 lg:grid-cols-4 lg:items-end'>
        {showBuyerFilter && (
          <div>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Filter by buyerId (admin)
            </label>
            <div className='flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2'>
              <Filter size={18} className='text-slate-500' />
              <input
                value={buyerId}
                onChange={(e) => onBuyerIdChange(e.target.value)}
                placeholder='e.g. 12'
                className='w-full bg-transparent text-sm outline-none'
                disabled={disabled}
              />
            </div>
          </div>
        )}

        <div>
          <label className='mb-2 block text-sm font-medium text-slate-700'>
            Sort by
          </label>
          <div className='flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2'>
            <ArrowUpDown size={18} className='text-slate-500' />
            <select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className='w-full bg-transparent text-sm outline-none'
              disabled={disabled}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className='mb-2 block text-sm font-medium text-slate-700'>
            Order
          </label>
          <div className='flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2'>
            <ArrowUpDown size={18} className='text-slate-500' />
            <select
              value={sortOrder}
              onChange={(e) => onSortOrderChange(e.target.value)}
              className='w-full bg-transparent text-sm outline-none'
              disabled={disabled}
            >
              <option value='desc'>Desc</option>
              <option value='asc'>Asc</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}