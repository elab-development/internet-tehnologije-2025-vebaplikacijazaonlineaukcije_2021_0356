import { useEffect } from 'react';
import { Tag } from 'lucide-react';
import { useCategoriesStore } from '../../stores/categoriesStore';

export default function CategorySelect({
  value,
  onChange,
  label = 'Category',
  required = false,
  placeholder = 'All categories',
  disabled = false,
}) {
  const { categories, fetchAllCategories, isLoading } = useCategoriesStore();

  useEffect(() => {
    fetchAllCategories();
  }, [fetchAllCategories]);

  return (
    <div>
      <label className='mb-2 block text-sm font-medium text-slate-700'>
        {label}
      </label>

      <div className='flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2'>
        <Tag size={18} className='text-slate-500' />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled || isLoading}
          className='w-full bg-transparent text-sm outline-none disabled:opacity-60'
        >
          {!required && <option value=''>{placeholder}</option>}
          {(categories || []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {required && (
        <div className='mt-1 text-xs text-slate-500'>
          Please select a category.
        </div>
      )}
    </div>
  );
}