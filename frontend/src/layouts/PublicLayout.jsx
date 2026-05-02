import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Building2, Menu, X, ArrowRight } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
  { to: '/login', label: 'Login' },
];

const PublicLayout = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => setIsOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] font-sans">

      {/* NAVBAR */}
      <nav className={`
        sticky top-0 z-50 transition-all duration-300
        ${scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80'
          : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
        }
      `}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[60px] items-center">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="HostelCore home">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
                <Building2 size={16} className="text-white" />
              </div>
              <span className="font-bold text-[17px] text-slate-900 tracking-tight">
                Hostel<span className="text-indigo-600">Core</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150
                    ${location.pathname === to
                      ? 'text-indigo-600 bg-indigo-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }
                  `}
                >
                  {label}
                </Link>
              ))}
              <div className="w-px h-5 bg-slate-200 mx-2" />
              <Link
                to="/signup"
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 hover:shadow-indigo-300 transition-all duration-150"
              >
                Apply Now
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-300 ease-out
          ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="bg-white border-t border-slate-100 px-4 pt-3 pb-5 space-y-1">
            {navLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === to
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-700 hover:bg-slate-50'
                  }
                `}
              >
                {label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                to="/signup"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                Apply Now <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-md flex items-center justify-center">
                <Building2 size={13} className="text-white" />
              </div>
              <span className="text-sm font-bold text-slate-800">
                Hostel<span className="text-indigo-600">Core</span>
              </span>
            </div>
            <div className="flex gap-5 text-sm text-slate-500">
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="hover:text-indigo-600 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-400">
            <span>&copy; {new Date().getFullYear()} HostelCore Management. All rights reserved.</span>
            <span>Built for smarter campus living.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;