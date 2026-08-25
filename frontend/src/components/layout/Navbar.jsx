import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useI18n } from '../../i18n';

const linkClass = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-base ${isActive ? 'bg-navy-800 text-white' : 'text-navy-800 hover:bg-navy-50'}`;

export default function Navbar() {
  const { t, lang, setLang, languages } = useI18n();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes (nav link clicked) or
  // the viewport is resized back up to desktop width.
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMenuOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  function handleLogout() {
    closeMenu();
    logout();
    navigate('/');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <NavLink to="/" className="text-2xl font-bold text-navy-900" onClick={closeMenu}>
          {t.appName}
        </NavLink>

        {/* Hamburger toggle — mobile only */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 p-2 text-navy-800 md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop nav */}
       <nav className="hidden flex-1 flex-nowrap items-center justify-between gap-1 md:flex" aria-label="Main">
          <NavLink to="/" className={linkClass} end>
            {t.nav.home}
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={linkClass}>
                {t.nav.dashboard}
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                {t.nav.profile}
              </NavLink>
              <NavLink to="/documents" className={linkClass}>
                {t.nav.documents}
              </NavLink>
            </>
          )}
          <NavLink to="/schemes" className={linkClass}>
            {t.nav.allSchemes}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/find-schemes" className={linkClass}>
              {t.nav.findSchemes}
            </NavLink>
          )}
          <NavLink to="/benefits" className={linkClass}>
            {t.nav.benefits}
          </NavLink>
          <NavLink to="/about" className={linkClass}>
            {t.nav.about}
          </NavLink>
          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `rounded-md px-3 py-2 text-base font-semibold ${isActive ? 'bg-saffron-500 text-white' : 'text-saffron-600 hover:bg-saffron-500/10'}`}>
              ⚙ Admin
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'central_admin' && (
            <NavLink to="/admin" className={({ isActive }) => `rounded-md px-3 py-2 text-base font-semibold ${isActive ? 'bg-saffron-500 text-white' : 'text-saffron-600 hover:bg-saffron-500/10'}`}>
              🏛 Central Admin
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'state_admin' && (
            <NavLink to="/state-admin" className={({ isActive }) => `rounded-md px-3 py-2 text-base font-semibold ${isActive ? 'bg-leaf-700 text-white' : 'text-leaf-700 hover:bg-leaf-600/10'}`}>
              🗺 State Admin
            </NavLink>
          )}
          <label className="sr-only" htmlFor="lang">
            {t.nav.language}
          </label>
          <select
            id="lang"
            className="ml-1 max-w-[11rem] rounded-md border border-slate-300 px-2 py-2 text-base"
            value={languages.some((item) => item.code === lang) ? lang : 'en'}
            onChange={(e) => setLang(e.target.value)}
          >
            {languages.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
          {isAuthenticated ? (
            <button type="button" className="btn-secondary ml-1 py-2" onClick={handleLogout}>
              {t.nav.logout}
            </button>
          ) : (
            <>
              <NavLink to="/login" className="btn-secondary ml-1 py-2">
                {t.nav.login}
              </NavLink>
              <NavLink to="/register" className="btn-primary py-2">
                {t.nav.register}
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Mobile dropdown nav */}
      {menuOpen && (
        <nav className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 md:hidden" aria-label="Main mobile">
          <NavLink to="/" className={linkClass} end onClick={closeMenu}>
            {t.nav.home}
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" className={linkClass} onClick={closeMenu}>
                {t.nav.dashboard}
              </NavLink>
              <NavLink to="/profile" className={linkClass} onClick={closeMenu}>
                {t.nav.profile}
              </NavLink>
              <NavLink to="/documents" className={linkClass} onClick={closeMenu}>
                {t.nav.documents}
              </NavLink>
            </>
          )}
          <NavLink to="/schemes" className={linkClass} onClick={closeMenu}>
            {t.nav.allSchemes}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/find-schemes" className={linkClass} onClick={closeMenu}>
              {t.nav.findSchemes}
            </NavLink>
          )}
          <NavLink to="/benefits" className={linkClass} onClick={closeMenu}>
            {t.nav.benefits}
          </NavLink>
          <NavLink to="/about" className={linkClass} onClick={closeMenu}>
            {t.nav.about}
          </NavLink>
          {isAuthenticated && user?.role === 'admin' && (
            <NavLink
              to="/admin"
              onClick={closeMenu}
              className={({ isActive }) => `rounded-md px-3 py-2 text-base font-semibold ${isActive ? 'bg-saffron-500 text-white' : 'text-saffron-600 hover:bg-saffron-500/10'}`}
            >
              ⚙ Admin
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'central_admin' && (
            <NavLink
              to="/admin"
              onClick={closeMenu}
              className={({ isActive }) => `rounded-md px-3 py-2 text-base font-semibold ${isActive ? 'bg-saffron-500 text-white' : 'text-saffron-600 hover:bg-saffron-500/10'}`}
            >
              🏛 Central Admin
            </NavLink>
          )}
          {isAuthenticated && user?.role === 'state_admin' && (
            <NavLink
              to="/state-admin"
              onClick={closeMenu}
              className={({ isActive }) => `rounded-md px-3 py-2 text-base font-semibold ${isActive ? 'bg-leaf-700 text-white' : 'text-leaf-700 hover:bg-leaf-600/10'}`}
            >
              🗺 State Admin
            </NavLink>
          )}

          <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-3">
            <label className="sr-only" htmlFor="lang-mobile">
              {t.nav.language}
            </label>
            <select
              id="lang-mobile"
              className="flex-1 rounded-md border border-slate-300 px-2 py-2 text-base"
              value={languages.some((item) => item.code === lang) ? lang : 'en'}
              onChange={(e) => setLang(e.target.value)}
            >
              {languages.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {isAuthenticated ? (
            <button type="button" className="btn-secondary mt-2 py-2" onClick={handleLogout}>
              {t.nav.logout}
            </button>
          ) : (
            <div className="mt-2 flex gap-2">
              <NavLink to="/login" className="btn-secondary flex-1 py-2 text-center" onClick={closeMenu}>
                {t.nav.login}
              </NavLink>
              <NavLink to="/register" className="btn-primary flex-1 py-2 text-center" onClick={closeMenu}>
                {t.nav.register}
              </NavLink>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
