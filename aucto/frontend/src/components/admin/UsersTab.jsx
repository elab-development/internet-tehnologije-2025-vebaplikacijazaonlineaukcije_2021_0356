import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import { useUsersStore } from '../../stores/usersStore';

function fmtDate(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return dt.toLocaleString();
}

export default function UsersTab() {
  const me = useAuthStore((s) => s.user);

  const {
    users,
    roleFilter,
    isLoading,
    error,
    success,
    clearMessages,
    setRoleFilter,
    fetchUsers,
    updateUserStatus,
    updateUserRole,
  } = useUsersStore();

  const [statusDraft, setStatusDraft] = useState({});
  const [roleDraft, setRoleDraft] = useState({});

  // Load
  useEffect(() => {
    clearMessages?.();
    fetchUsers(roleFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  useEffect(() => {
    const nextStatus = {};
    const nextRole = {};
    for (const u of users || []) {
      nextStatus[u.id] = u.status;
      nextRole[u.id] = u.role;
    }
    setStatusDraft(nextStatus);
    setRoleDraft(nextRole);
  }, [users]);

  const rows = useMemo(() => users || [], [users]);

  const roleOptions = useMemo(() => ['', 'buyer', 'seller', 'admin'], []);
  const statusOptions = useMemo(() => ['active', 'inactive', 'blocked'], []);
  const roleEditOptions = useMemo(() => ['buyer', 'seller', 'admin'], []);

  async function onRefresh() {
    clearMessages?.();
    await fetchUsers(roleFilter);
  }

  async function handleStatusSave(userId) {
    const nextStatus = statusDraft[userId];
    const original = rows.find((u) => u.id === userId)?.status;

    if (!nextStatus || nextStatus === original) return;

    await updateUserStatus({
      userId,
      status: nextStatus,
      meId: me?.id,
    });
  }

  async function handleRoleSave(userId) {
    const nextRole = roleDraft[userId];
    const original = rows.find((u) => u.id === userId)?.role;

    if (!nextRole || nextRole === original) return;

    await updateUserRole({
      userId,
      role: nextRole,
      meId: me?.id,
    });
  }

  return (
    <div>
      {/* Header */}
      <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-700'>
              <Users size={18} />
            </div>
            <div className='text-lg font-semibold text-slate-900'>Users</div>
          </div>
          <div className='mt-1 text-sm text-slate-600'>
            Manage roles and statuses.
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm'>
            <Filter size={16} className='text-slate-500' />
            <span className='text-slate-700'>Role:</span>
            <select
              className='rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm outline-none focus:border-purple-400'
              value={roleFilter || ''}
              onChange={(e) => setRoleFilter(e.target.value)}
              disabled={isLoading}
            >
              {roleOptions.map((r) => (
                <option key={r || 'all'} value={r}>
                  {r ? r : 'all'}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60'
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className='mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          <div className='flex items-start gap-2'>
            <AlertTriangle size={18} className='mt-0.5' />
            <div>{error}</div>
          </div>
        </div>
      )}

      {success && (
        <div className='mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700'>
          <div className='flex items-start gap-2'>
            <CheckCircle2 size={18} className='mt-0.5' />
            <div>{success}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white'>
        <div className='overflow-x-auto'>
          <table className='min-w-225 w-full text-left text-sm'>
            <thead className='bg-slate-50 text-xs uppercase tracking-wide text-slate-600'>
              <tr>
                <th className='px-4 py-3'>User</th>
                <th className='px-4 py-3'>Email</th>
                <th className='px-4 py-3'>Created</th>
                <th className='px-4 py-3'>Role</th>
                <th className='px-4 py-3'>Status</th>
                <th className='px-4 py-3 text-right'>Actions</th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-200'>
              {isLoading && rows.length === 0 && (
                <>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className='animate-pulse'>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-40 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-56 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-4 w-28 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-8 w-28 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='h-8 w-28 rounded bg-slate-200' />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='ml-auto h-8 w-32 rounded bg-slate-200' />
                      </td>
                    </tr>
                  ))}
                </>
              )}

              {!isLoading && rows.length === 0 && (
                <tr>
                  <td className='px-4 py-6 text-slate-600' colSpan={6}>
                    No users found.
                  </td>
                </tr>
              )}

              {rows.map((u) => {
                const isMe = me?.id === u.id;
                const statusChanged = statusDraft[u.id] !== u.status;
                const roleChanged = roleDraft[u.id] !== u.role;

                const statusDisabled =
                  isLoading || (isMe && statusDraft[u.id] !== 'active');
                const roleDisabled =
                  isLoading || (isMe && roleDraft[u.id] !== 'admin');

                return (
                  <tr key={u.id} className='hover:bg-slate-50'>
                    <td className='px-4 py-3'>
                      <div className='font-semibold text-slate-900'>
                        {u.fullName}
                        {isMe && (
                          <span className='ml-2 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700'>
                            you
                          </span>
                        )}
                      </div>
                      <div className='text-xs text-slate-500'>ID: {u.id}</div>
                    </td>

                    <td className='px-4 py-3 text-slate-700'>{u.email}</td>

                    <td className='px-4 py-3 text-slate-700'>
                      {fmtDate(u.createdAt)}
                    </td>

                    <td className='px-4 py-3'>
                      <select
                        className='w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 disabled:opacity-60'
                        value={roleDraft[u.id] || u.role}
                        onChange={(e) =>
                          setRoleDraft((s) => ({
                            ...s,
                            [u.id]: e.target.value,
                          }))
                        }
                        disabled={roleDisabled}
                      >
                        {roleEditOptions.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className='px-4 py-3'>
                      <select
                        className='w-40 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-purple-400 disabled:opacity-60'
                        value={statusDraft[u.id] || u.status}
                        onChange={(e) =>
                          setStatusDraft((s) => ({
                            ...s,
                            [u.id]: e.target.value,
                          }))
                        }
                        disabled={statusDisabled}
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className='px-4 py-3'>
                      <div className='flex justify-end gap-2'>
                        <button
                          onClick={() => handleRoleSave(u.id)}
                          disabled={!roleChanged || roleDisabled}
                          className='rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50'
                        >
                          Save role
                        </button>

                        <button
                          onClick={() => handleStatusSave(u.id)}
                          disabled={!statusChanged || statusDisabled}
                          className='rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50'
                        >
                          Save status
                        </button>
                      </div>

                      {isMe && (
                        <div className='mt-1 text-right text-[11px] text-slate-500'>
                          You can’t downgrade yourself.
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-600'>
          <div>
            Showing <span className='font-semibold'>{rows.length}</span> users
            {roleFilter ? (
              <>
                {' '}
                filtered by <span className='font-semibold'>{roleFilter}</span>
              </>
            ) : null}
          </div>

          {isLoading ? (
            <div className='font-semibold text-slate-700'>Loading…</div>
          ) : (
            <button
              onClick={() => clearMessages?.()}
              className='rounded-lg px-2 py-1 font-semibold text-slate-700 hover:bg-slate-100'
            >
              Clear messages
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
