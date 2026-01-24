import { Search, ArrowUpDown, Plus, Filter } from 'lucide-react';
import CategorySelect from './CategorySelect';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'endTime', label: 'Ending soon' },
  { value: 'startingPrice', label: 'Starting price' },
  { value: 'title', label: 'Title' },
  { value: 'startTime', label: 'Start time' },
];

export default function AuctionsToolbar({
  q,
  onQChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  categoryId,
  onCategoryIdChange,
  canAddAuction,
  onOpenCreate,
  isLoading,
}) {
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
        {/* Left group */}
        <div className='grid w-full gap-3 md:grid-cols-2 lg:grid-cols-4'>
          {/* Search */}
          <div className='lg:col-span-2'>
            <label className='mb-2 block text-sm font-medium text-slate-700'>
              Search
            </label>
            <div className='flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-100'>
              <Search size={18} className='text-slate-500' />
              <input
                value={q}
                onChange={(e) => onQChange(e.target.value)}
                placeholder='Search title or description...'
                className='w-full bg-transparent text-sm outline-none'
              />
            </div>
          </div>

          {/* Category dropdown */}
          <CategorySelect
            value={categoryId}
            onChange={onCategoryIdChange}
            label='Category'
            placeholder='All categories'
            disabled={isLoading}
          />

          {/* Sort */}
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
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order */}
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
              >
                <option value='desc'>Desc</option>
                <option value='asc'>Asc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right group */}
        <div className='flex items-center justify-between gap-3 lg:justify-end'>
          {canAddAuction && (
            <button
              onClick={onOpenCreate}
              disabled={isLoading}
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:opacity-95 disabled:opacity-60'
            >
              <Plus size={18} />
              Add Auction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}