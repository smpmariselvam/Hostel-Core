import React, { useState, useContext } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  LogOut, 
  Wrench, 
  Receipt, 
  Home, 
  BedDouble, 
  Megaphone,
  Menu,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import NotificationBell from '../components/NotificationBell';

// ── Soft pastel role palettes ─────────────────────────────────────────────
const ROLE_THEME = {
  admin: {
    // Soft sky blue
    sidebar: 'bg-gradient-to-b from-sky-50 to-blue-50',
    sidebarBorder: 'border-blue-100',
    topStripe: 'bg-gradient-to-r from-sky-400 to-blue-500',
    logoRing: 'ring-blue-200',
    logoBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
    logoShadow: 'shadow-blue-200',
    navActive: 'bg-white text-blue-700 font-semibold shadow-sm border border-blue-100',
    navHover: 'hover:bg-white/70 hover:text-blue-700',
    navText: 'text-slate-500',
    navIcon: 'text-blue-300',
    navIconActive: 'text-blue-500',
    badge: 'bg-blue-100 text-blue-600 ring-1 ring-blue-200',
    badgeDot: 'bg-blue-400',
    sectionLabel: 'text-blue-400',
    headerStripe: 'bg-gradient-to-r from-sky-400 to-blue-500',
    headerBorder: 'border-blue-100',
    pageTitle: 'text-blue-700',
    avatarBg: 'bg-gradient-to-br from-sky-400 to-blue-500',
    avatarShadow: 'shadow-blue-200',
    userCardBg: 'bg-white/80',
    userCardBorder: 'border-blue-100',
    userName: 'text-slate-800',
    userRole: 'text-blue-400',
    logoutHover: 'hover:bg-red-50 hover:text-red-500',
    contentBg: 'bg-gradient-to-br from-sky-50/60 to-blue-50/40',
    sparkle: 'text-blue-400',
  },
  staff: {
    // Blush rose / pink
    sidebar: 'bg-gradient-to-b from-rose-50 to-pink-50',
    sidebarBorder: 'border-pink-100',
    topStripe: 'bg-gradient-to-r from-rose-400 to-pink-400',
    logoRing: 'ring-pink-200',
    logoBg: 'bg-gradient-to-br from-rose-400 to-pink-500',
    logoShadow: 'shadow-pink-200',
    navActive: 'bg-white text-rose-600 font-semibold shadow-sm border border-pink-100',
    navHover: 'hover:bg-white/70 hover:text-rose-600',
    navText: 'text-slate-500',
    navIcon: 'text-rose-300',
    navIconActive: 'text-rose-500',
    badge: 'bg-rose-100 text-rose-600 ring-1 ring-rose-200',
    badgeDot: 'bg-rose-400',
    sectionLabel: 'text-rose-400',
    headerStripe: 'bg-gradient-to-r from-rose-400 to-pink-400',
    headerBorder: 'border-pink-100',
    pageTitle: 'text-rose-600',
    avatarBg: 'bg-gradient-to-br from-rose-400 to-pink-500',
    avatarShadow: 'shadow-pink-200',
    userCardBg: 'bg-white/80',
    userCardBorder: 'border-pink-100',
    userName: 'text-slate-800',
    userRole: 'text-rose-400',
    logoutHover: 'hover:bg-red-50 hover:text-red-500',
    contentBg: 'bg-gradient-to-br from-rose-50/60 to-pink-50/40',
    sparkle: 'text-rose-400',
  },
  resident: {
    // Warm cream / amber
    sidebar: 'bg-gradient-to-b from-amber-50 to-orange-50',
    sidebarBorder: 'border-amber-100',
    topStripe: 'bg-gradient-to-r from-amber-400 to-orange-400',
    logoRing: 'ring-amber-200',
    logoBg: 'bg-gradient-to-br from-amber-400 to-orange-400',
    logoShadow: 'shadow-amber-200',
    navActive: 'bg-white text-amber-700 font-semibold shadow-sm border border-amber-100',
    navHover: 'hover:bg-white/70 hover:text-amber-700',
    navText: 'text-slate-500',
    navIcon: 'text-amber-300',
    navIconActive: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
    badgeDot: 'bg-amber-400',
    sectionLabel: 'text-amber-400',
    headerStripe: 'bg-gradient-to-r from-amber-400 to-orange-400',
    headerBorder: 'border-amber-100',
    pageTitle: 'text-amber-700',
    avatarBg: 'bg-gradient-to-br from-amber-400 to-orange-400',
    avatarShadow: 'shadow-amber-200',
    userCardBg: 'bg-white/80',
    userCardBorder: 'border-amber-100',
    userName: 'text-slate-800',
    userRole: 'text-amber-500',
    logoutHover: 'hover:bg-red-50 hover:text-red-500',
    contentBg: 'bg-gradient-to-br from-amber-50/60 to-orange-50/40',
    sparkle: 'text-amber-400',
  },
};

const DashboardLayout = () => {
  const { user, authLoading, logout } = useContext(AuthContext);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="w-9 h-9 mb-4 rounded-full border-[3px] border-slate-200 border-t-sky-400 animate-spin" />
        <p className="text-slate-400 text-sm font-medium tracking-wide">Loading your workspace…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const theme = ROLE_THEME[user.role] || ROLE_THEME.resident;
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const getNavItems = () => {
    const base = [{ path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }];
    if (user.role === 'admin') {
      base.push(
        { path: '/dashboard/staff', label: 'Manage Staff', icon: UserCog },
        { path: '/dashboard/residents', label: 'Residents', icon: Users },
        { path: '/dashboard/rooms', label: 'Room Allocation', icon: Home },
        { path: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/dashboard/announcements', label: 'Announcements', icon: Megaphone },
        { path: '/dashboard/billing', label: 'Billing', icon: Receipt }
      );
    } else if (user.role === 'staff') {
      base.push(
        { path: '/dashboard/residents', label: 'Residents', icon: Users },
        { path: '/dashboard/rooms', label: 'Room Allocation', icon: Home },
        { path: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/dashboard/announcements', label: 'Announcements', icon: Megaphone }
      );
    } else if (user.role === 'resident') {
      base.push(
        { path: '/dashboard/my-room', label: 'My Room', icon: BedDouble },
        { path: '/dashboard/maintenance', label: 'Maintenance', icon: Wrench },
        { path: '/dashboard/billing', label: 'My Bills', icon: Receipt }
      );
    }
    return base;
  };

  const navItems = getNavItems();
  const pageLabel =
    location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Dashboard';

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-700/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 flex flex-col
        w-[260px] ${theme.sidebar} border-r ${theme.sidebarBorder}
        transform transition-transform duration-300 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Colored top accent stripe */}
        <div className={`h-1 w-full ${theme.topStripe} shrink-0`} />

        {/* Logo */}
        <div className={`px-5 py-4 flex items-center justify-between border-b ${theme.sidebarBorder}`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 ${theme.logoBg} rounded-2xl flex items-center justify-center shadow-md ${theme.logoShadow} ring-2 ${theme.logoRing}`}>
              <span className="text-white font-black text-base leading-none">H</span>
            </div>
            <div>
              <h1 className="text-slate-800 font-black text-[15px] tracking-tight leading-none">HostelCore</h1>
              <p className="text-[10px] text-slate-400 mt-0.5 tracking-wide font-medium">Smart operations</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/80 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Section label */}
        <div className="px-5 pt-5 pb-2">
          <span className={`text-[10px] font-bold tracking-widest uppercase ${theme.sectionLabel}`}>
            Navigation
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                  transition-all duration-150
                  ${isActive
                    ? theme.navActive
                    : `${theme.navText} ${theme.navHover}`}
                `}
              >
                <Icon
                  size={17}
                  className={`shrink-0 transition-colors ${isActive ? theme.navIconActive : theme.navIcon}`}
                />
                <span className="flex-1 font-medium">{item.label}</span>
                {isActive && (
                  <ChevronRight size={13} className={theme.navIconActive} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card + logout */}
        <div className={`p-4 border-t ${theme.sidebarBorder}`}>
          <div className={`flex items-center gap-3 mb-3 p-3 rounded-2xl ${theme.userCardBg} border ${theme.userCardBorder} shadow-sm`}>
            <div className={`w-9 h-9 rounded-xl ${theme.avatarBg} flex items-center justify-center text-white font-black text-sm shadow ${theme.avatarShadow} ring-2 ring-white shrink-0`}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate leading-tight ${theme.userName}`}>{user.name}</p>
              <p className={`text-[11px] capitalize font-medium ${theme.userRole}`}>{user.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-slate-400 rounded-xl transition-all duration-150 ${theme.logoutHover}`}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── FANCY NAVBAR ─────────────────────────────────────────────── */}
        <header className={`shrink-0 bg-white border-b ${theme.headerBorder}`}>
          {/* Thin gradient top stripe */}
          <div className={`h-[3px] w-full ${theme.headerStripe}`} />

          <div className="h-14 flex items-center justify-between px-4 lg:px-6 gap-3">

            {/* Left: hamburger + breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Hamburger button — mobile only */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 border border-slate-200 transition-colors shrink-0"
              >
                <Menu size={18} />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-slate-300 text-xs font-semibold hidden sm:inline tracking-wide">HostelCore</span>
                <span className="text-slate-200 hidden sm:inline text-sm">›</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <Sparkles size={13} className={`${theme.sparkle} shrink-0`} />
                  <h2 className={`text-sm font-bold capitalize truncate ${theme.pageTitle}`}>
                    {pageLabel}
                  </h2>
                </div>
              </div>
            </div>

            {/* Right: date pill + bell + role badge + avatar */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Date pill — md+ */}
              <span className="hidden md:inline-flex items-center text-[11px] text-slate-400 font-medium bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full whitespace-nowrap">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>

              <NotificationBell />

              {/* Role badge */}
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full capitalize whitespace-nowrap ${theme.badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${theme.badgeDot}`} />
                {user.role}
              </span>

              {/* Mini avatar */}
              <div className={`hidden sm:flex w-8 h-8 rounded-xl ${theme.avatarBg} items-center justify-center text-white font-black text-xs shadow-sm ${theme.avatarShadow} ring-2 ring-white shrink-0`}>
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className={`flex-1 overflow-auto p-4 lg:p-6 ${theme.contentBg}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;