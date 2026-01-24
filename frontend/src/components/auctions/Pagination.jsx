import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({
  page,
  totalPages,
  total,
  onPageChange,
  disabled,
}) {
  if (!totalPages || totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
      <div className='text-sm text-slate-600'>
        Page <span className='font-semibold text-slate-900'>{page}</span> of{' '}
        <span className='font-semibold text-slate-900'>{totalPages}</span> •{' '}
        <span className='font-semibold text-slate-900'>{total}</span> total
      </div>

      <div className='flex items-center gap-2'>
        <button
          disabled={!canPrev || disabled}
          onClick={() => onPageChange(page - 1)}
          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50'
        >
          <ChevronLeft size={18} />
          Prev
        </button>

        <button
          disabled={!canNext || disabled}
          onClick={() => onPageChange(page + 1)}
          className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-50'
        >
          Next
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}