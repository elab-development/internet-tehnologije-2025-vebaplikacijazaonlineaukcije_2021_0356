import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Gavel,
  Home,
  LogIn,
  UserPlus,
  User,
  ShoppingCart,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCurrencyStore } from '../stores/currencyStore';

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        [
          'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
          isActive
            ? 'bg-white/15 text-white'
            : 'text-white/80 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      <Icon size={18} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function Navbar() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const currency = useCurrencyStore((s) => s.currency);
  const supported = useCurrencyStore((s) => s.supported);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  const initCurrency = useCurrencyStore((s) => s.init);

  useEffect(() => {
    initCurrency?.();
  }, [initCurrency]);

  const [open, setOpen] = useState(false);

  const role = user?.role; // buyer | seller | admin

  const links = useMemo(() => {
    // NOT LOGGED IN
    if (!user) {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/auctions', label: 'Auctions', icon: Gavel },
        { to: '/login', label: 'Login', icon: LogIn },
        { to: '/register', label: 'Register', icon: UserPlus },
      ];
    }

    // ADMIN
    if (role === 'admin') {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/auctions', label: 'Auctions', icon: Gavel },
        { to: '/admin', label: 'Admin', icon: Shield },
      ];
    }

    // SELLER OR BUYER
    const base = [
      { to: '/', label: 'Home', icon: Home },
      { to: '/auctions', label: 'Auctions', icon: Gavel },
      { to: '/profile', label: 'Profile', icon: User },
    ];

    if (role === 'buyer') {
      base.push({ to: '/cart', label: 'Cart', icon: ShoppingCart });
    }

    return base;
  }, [user, role]);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate('/');
  }

  return (
    <header className='sticky top-0 z-50 border-b border-white/10 bg-linear-to-r from-purple-700 via-purple-600 to-indigo-600'>
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        {/* Brand */}
        <Link
          to='/'
          className='flex items-center gap-2 rounded-xl px-2 py-1 text-white hover:bg-white/10'
        >
          <div className='grid h-9 w-9 place-items-center rounded-xl bg-white/15'>
            <Gavel size={18} />
          </div>
          <div className='leading-tight'>
            <div className='text-sm font-semibold'>Aucto</div>
            <div className='text-xs text-white/70'>Online Auctions</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className='hidden items-center gap-2 md:flex'>
          {links.map((l) => (
            <NavItem key={l.to} to={l.to} icon={l.icon} label={l.label} />
          ))}

          {user?.role !== 'admin' && (
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className='ml-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white outline-none hover:bg-white/20'
              title='Currency'
            >
              {supported.map((c) => (
                <option key={c} value={c} className='text-slate-900'>
                  {c}
                </option>
              ))}
            </select>
          )}

          {user && (
            <button
              onClick={handleLogout}
              className='ml-2 inline-flex items-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20'
            >
              <LogOut size={18} />
              Logout
            </button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className='inline-flex items-center justify-center rounded-xl bg-white/15 p-2 text-white transition hover:bg-white/20 md:hidden'
          aria-label='Toggle menu'
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className='border-t border-white/10 bg-black/10 md:hidden'>
          <div className='mx-auto max-w-6xl px-4 py-3'>
            <div className='grid gap-2'>
              {links.map((l) => (
                <NavItem
                  key={l.to}
                  to={l.to}
                  icon={l.icon}
                  label={l.label}
                  onClick={() => setOpen(false)}
                />
              ))}

              {user?.role !== 'admin' && (
                <div className='rounded-xl bg-white/10 p-3'>
                  <div className='mb-2 text-xs font-semibold text-white/80'>
                    Currency
                  </div>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className='w-full rounded-xl bg-white/15 px-3 py-2 text-sm font-semibold text-white outline-none'
                  >
                    {supported.map((c) => (
                      <option key={c} value={c} className='text-slate-900'>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className='mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/20'
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}

              {user && (
                <div className='mt-2 rounded-xl bg-white/10 p-3 text-xs text-white/80'>
                  Logged in as{' '}
                  <span className='font-semibold'>{user.fullName}</span> (
                  {user.role})
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}