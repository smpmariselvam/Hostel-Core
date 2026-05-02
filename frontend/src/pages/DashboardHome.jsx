import React, { useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  AlertTriangle, BedDouble, CheckCircle, Home,
  IndianRupee, Receipt, Users, Wrench, TrendingUp,
  Sparkles, Clock, ArrowUpRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

// ── Role palettes (mirrors DashboardLayout) ───────────────────────────────
const ROLE_THEME = {
  admin: {
    gradient: 'from-sky-400 to-blue-500',
    welcomeBg: 'bg-gradient-to-br from-sky-50 to-blue-50',
    welcomeBorder: 'border-blue-100',
    welcomeLabel: 'text-blue-500',
    welcomeTitle: 'text-blue-800',
    welcomeSub: 'text-blue-400',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-600',
    badgeDot: 'bg-blue-400',
    cardAccent: 'border-t-blue-400',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    chartTitle: 'text-slate-700',
    ringColor: 'ring-blue-100',
  },
  staff: {
    gradient: 'from-rose-400 to-pink-400',
    welcomeBg: 'bg-gradient-to-br from-rose-50 to-pink-50',
    welcomeBorder: 'border-pink-100',
    welcomeLabel: 'text-rose-400',
    welcomeTitle: 'text-rose-800',
    welcomeSub: 'text-rose-400',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-600',
    badgeDot: 'bg-rose-400',
    cardAccent: 'border-t-rose-400',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-400',
    chartTitle: 'text-slate-700',
    ringColor: 'ring-pink-100',
  },
  resident: {
    gradient: 'from-amber-400 to-orange-400',
    welcomeBg: 'bg-gradient-to-br from-amber-50 to-orange-50',
    welcomeBorder: 'border-amber-100',
    welcomeLabel: 'text-amber-500',
    welcomeTitle: 'text-amber-800',
    welcomeSub: 'text-amber-400',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    badgeDot: 'bg-amber-400',
    cardAccent: 'border-t-amber-400',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    chartTitle: 'text-slate-700',
    ringColor: 'ring-amber-100',
  },
};

// ── Stat accent palettes ──────────────────────────────────────────────────
const ACCENTS = {
  blue:   { bg: 'bg-sky-50',     icon: 'bg-sky-100 text-sky-500',     val: 'text-sky-700',     bar: 'bg-sky-400',     border: 'border-sky-100'   },
  green:  { bg: 'bg-emerald-50', icon: 'bg-emerald-100 text-emerald-500', val: 'text-emerald-700', bar: 'bg-emerald-400', border: 'border-emerald-100' },
  amber:  { bg: 'bg-amber-50',   icon: 'bg-amber-100 text-amber-500',  val: 'text-amber-700',   bar: 'bg-amber-400',   border: 'border-amber-100'  },
  red:    { bg: 'bg-rose-50',    icon: 'bg-rose-100 text-rose-500',    val: 'text-rose-700',    bar: 'bg-rose-400',    border: 'border-rose-100'   },
  purple: { bg: 'bg-violet-50',  icon: 'bg-violet-100 text-violet-500',val: 'text-violet-700',  bar: 'bg-violet-400',  border: 'border-violet-100' },
};

// ── Components ────────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, hint, accent = 'blue' }) => {
  const a = ACCENTS[accent];
  return (
    <div className={`${a.bg} border ${a.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 group`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className={`text-3xl font-black mt-2 ${a.val}`}>{value}</p>
          {hint && <p className="text-xs text-slate-400 mt-1.5 font-medium">{hint}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${a.icon} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
          {icon}
        </div>
      </div>
      {/* Bottom accent bar */}
      <div className={`mt-4 h-1 w-full rounded-full bg-white/60`}>
        <div className={`h-1 rounded-full ${a.bar} w-2/3`} />
      </div>
    </div>
  );
};

const ChartCard = ({ title, subtitle, children, className = '' }) => (
  <div className={`bg-white border border-slate-100 rounded-2xl p-5 shadow-sm ${className}`}>
    <div className="mb-5 flex items-start justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
      </div>
      <TrendingUp size={15} className="text-slate-300 mt-0.5" />
    </div>
    {children}
  </div>
);

const BarChart = ({ items }) => {
  const maxValue = Math.max(...items.map(i => i.value), 1);
  return (
    <div className="h-52 flex items-end gap-3 border-b border-l border-slate-100 px-2 pt-4">
      {items.map((item) => (
        <div key={item.label} className="flex-1 h-full flex flex-col justify-end items-center gap-2">
          <span className="text-xs font-black text-slate-500">{item.value}</span>
          <div
            className={`w-full max-w-12 rounded-t-xl ${item.color} transition-all duration-500`}
            style={{ height: `${Math.max((item.value / maxValue) * 78, item.value ? 12 : 2)}%` }}
          />
          <p className="text-[10px] font-bold text-slate-400 text-center leading-tight">{item.label}</p>
        </div>
      ))}
    </div>
  );
};

const PieChart = ({ paid, pending }) => {
  const total = paid + pending || 1;
  const paidPct = Math.round((paid / total) * 100);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative shrink-0">
        <div
          className="w-36 h-36 rounded-full shadow-inner"
          style={{ background: `conic-gradient(#10b981 0 ${paidPct}%, #fbbf24 ${paidPct}% 100%)` }}
        />
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-sm">
          <span className="text-lg font-black text-slate-700">{paidPct}%</span>
        </div>
      </div>
      <div className="space-y-2.5 flex-1 w-full">
        {[
          { label: 'Paid', count: paid,    bg: 'bg-emerald-400', text: 'text-emerald-600', light: 'bg-emerald-50 border-emerald-100' },
          { label: 'Pending', count: pending, bg: 'bg-amber-400',   text: 'text-amber-600',  light: 'bg-amber-50 border-amber-100'   },
        ].map(item => (
          <div key={item.label} className={`flex items-center justify-between border ${item.light} rounded-xl px-3 py-2.5`}>
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
              <span className="text-xs font-bold text-slate-600">{item.label}</span>
            </div>
            <span className={`text-sm font-black ${item.text}`}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AreaLineChart = ({ values }) => {
  const safe = values.length ? values : [0, 0, 0, 0, 0, 0];
  const max = Math.max(...safe, 1);
  const pts = safe.map((v, i) => {
    const x = (i / Math.max(safe.length - 1, 1)) * 100;
    const y = 100 - (v / max) * 80 - 10;
    return `${x},${y}`;
  });
  const area = `0,100 ${pts.join(' ')} 100,100`;
  return (
    <div className="h-52 bg-gradient-to-b from-sky-50/80 to-white rounded-xl overflow-hidden border border-sky-100">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#areaGrad)" />
        <polyline points={pts.join(' ')} fill="none" stroke="#0ea5e9" strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState({ rooms: [], room: null, residents: [], staff: [], bills: [], maintenance: [] });
  const [loading, setLoading] = useState(true);

  const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      try {
        const isAdmin = user.role === 'admin';
        const isManager = user.role === 'admin' || user.role === 'staff';
        const requests = [
          axios.get(isManager ? `${API_BASE_URL}/rooms` : `${API_BASE_URL}/rooms/my`, getConfig()),
          axios.get(isManager ? `${API_BASE_URL}/maintenance` : `${API_BASE_URL}/maintenance/my`, getConfig()),
          axios.get(isManager ? `${API_BASE_URL}/billing` : `${API_BASE_URL}/billing/my`, getConfig()),
        ];
        if (isManager) requests.push(axios.get(`${API_BASE_URL}/users/residents`, getConfig()));
        if (isAdmin) requests.push(axios.get(`${API_BASE_URL}/users/staff`, getConfig()));

        const [roomRes, maintenanceRes, billsRes, residentsRes, staffRes] = await Promise.all(requests);
        setData({
          rooms: isManager ? roomRes.data || [] : [],
          room: isManager ? null : roomRes.data,
          maintenance: maintenanceRes.data || [],
          bills: billsRes.data || [],
          residents: residentsRes?.data || [],
          staff: staffRes?.data || [],
        });
      } catch (err) {
        console.error('Dashboard load failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user]);

  const summary = useMemo(() => {
    const paidBills    = data.bills.filter(b => b.status === 'Paid');
    const pendingBills = data.bills.filter(b => b.status !== 'Paid');
    const pendingAmount   = pendingBills.reduce((s, b) => s + Number(b.totalAmount || 0), 0);
    const collectedAmount = paidBills.reduce((s, b) => s + Number(b.totalAmount || 0), 0);
    const openMaintenance = data.maintenance.filter(m => m.status !== 'Resolved');
    const totalBeds    = data.rooms.reduce((s, r) => s + Number(r.capacity || 0), 0);
    const occupiedBeds = data.rooms.reduce((s, r) => s + Number(r.occupants?.length || 0), 0);
    return { paidBills, pendingBills, pendingAmount, collectedAmount, openMaintenance, totalBeds, occupiedBeds };
  }, [data]);

  const theme = ROLE_THEME[user?.role] || ROLE_THEME.resident;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className={`w-9 h-9 rounded-full border-[3px] border-slate-200 border-t-sky-400 animate-spin`} />
        <p className="text-slate-400 text-sm font-medium">Loading dashboard insights…</p>
      </div>
    );
  }

  const maintenanceItems = [
    { label: 'Pending',  value: data.maintenance.filter(m => m.status === 'Pending').length,     color: 'bg-rose-400' },
    { label: 'Progress', value: data.maintenance.filter(m => m.status === 'In Progress').length,  color: 'bg-sky-400' },
    { label: 'Resolved', value: data.maintenance.filter(m => m.status === 'Resolved').length,     color: 'bg-emerald-400' },
  ];
  const billTrend = data.bills.slice(0, 6).reverse().map(b => Number(b.totalAmount || 0));

  return (
    <div className="space-y-5">

      {/* ── Welcome Banner ─────────────────────────────────────────────── */}
      <div className={`${theme.welcomeBg} border ${theme.welcomeBorder} rounded-2xl p-6 shadow-sm relative overflow-hidden`}>
        {/* decorative circle */}
        <div className={`absolute -right-8 -top-8 w-36 h-36 rounded-full bg-gradient-to-br ${theme.gradient} opacity-10`} />
        <div className={`absolute -right-2 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-br ${theme.gradient} opacity-10`} />

        <div className="relative">
          <div className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase ${theme.welcomeLabel} mb-3`}>
            <Sparkles size={11} />
            Dashboard Overview
          </div>
          <h1 className={`text-2xl font-black ${theme.welcomeTitle}`}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className={`text-sm mt-1.5 font-medium ${theme.welcomeSub}`}>
            Here's what's happening in your {user?.role} workspace today.
          </p>

          {/* Role badge */}
          <span className={`inline-flex items-center gap-1.5 mt-3 text-[11px] font-bold px-3 py-1.5 rounded-full capitalize ${theme.badgeBg} ${theme.badgeText}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.badgeDot}`} />
            {user?.role}
          </span>
        </div>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4">
        {(user.role === 'admin' || user.role === 'staff') && (<>
          <StatCard icon={<Users size={20} />}    label="Residents"    value={data.residents.length}       hint="Registered residents"                              accent="blue"   />
          <StatCard icon={<BedDouble size={20} />} label="Rooms"       value={data.rooms.length}           hint={`${summary.occupiedBeds}/${summary.totalBeds} beds`} accent="purple" />
        </>)}
        {user.role === 'admin' && (
          <StatCard icon={<Users size={20} />}    label="Staff"        value={data.staff.length}           hint="Active staff accounts"                             accent="green"  />
        )}
        {user.role === 'resident' && (<>
          <StatCard icon={<Receipt size={20} />}  label="My Bills"     value={data.bills.length}           hint={`${summary.pendingBills.length} pending`}          accent="amber"  />
          <StatCard icon={<Home size={20} />}     label="My Room"      value={data.room?.roomNumber || '—'} hint={data.room ? `${data.room.roomType} room` : 'Not assigned'} accent="blue" />
        </>)}
        <StatCard icon={<Wrench size={20} />}     label="Open Tickets" value={summary.openMaintenance.length} hint="Unresolved issues"                             accent="red"    />
        <StatCard icon={<IndianRupee size={20} />} label="Pending Dues" value={`₹${summary.pendingAmount.toLocaleString('en-IN')}`} hint={`₹${summary.collectedAmount.toLocaleString('en-IN')} collected`} accent="amber" />
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid xl:grid-cols-3 gap-4">
        <ChartCard title="Payment Split" subtitle="Paid vs pending invoices">
          <PieChart paid={summary.paidBills.length} pending={summary.pendingBills.length} />
        </ChartCard>
        <ChartCard title="Maintenance Status" subtitle="Tickets by state">
          <BarChart items={maintenanceItems} />
        </ChartCard>
        <ChartCard title="Billing Trend" subtitle="Recent invoice amounts">
          <AreaLineChart values={billTrend} />
        </ChartCard>
      </div>

      {/* ── Recent Lists ───────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Recent Billing */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Recent Billing</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Latest invoices</p>
            </div>
            <Receipt size={15} className="text-slate-300" />
          </div>
          <div className="divide-y divide-slate-50">
            {data.bills.slice(0, 5).map(bill => (
              <div key={bill._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${bill.status === 'Paid' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <IndianRupee size={14} className={bill.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{bill.month}</p>
                    <p className="text-xs text-slate-400 truncate">{bill.resident?.name || 'My invoice'}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className="text-sm font-black text-slate-800">₹{Number(bill.totalAmount).toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${bill.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {bill.status}
                  </span>
                </div>
              </div>
            ))}
            {data.bills.length === 0 && (
              <p className="text-slate-400 text-sm px-5 py-6 text-center font-medium">No billing records yet.</p>
            )}
          </div>
        </div>

        {/* Recent Maintenance */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-700">Recent Maintenance</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Latest tickets</p>
            </div>
            <Wrench size={15} className="text-slate-300" />
          </div>
          <div className="divide-y divide-slate-50">
            {data.maintenance.slice(0, 5).map(item => (
              <div key={item._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/70 transition-colors">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item.status === 'Resolved' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  {item.status === 'Resolved'
                    ? <CheckCircle size={15} className="text-emerald-500" />
                    : <AlertTriangle size={15} className="text-rose-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{item.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.priority === 'High'   ? 'bg-rose-50 text-rose-500' :
                      item.priority === 'Medium' ? 'bg-amber-50 text-amber-500' :
                                                   'bg-slate-100 text-slate-400'
                    }`}>{item.priority}</span>
                    <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <Clock size={9} /> {item.status}
                    </span>
                  </div>
                </div>
                <ArrowUpRight size={14} className="text-slate-300 shrink-0" />
              </div>
            ))}
            {data.maintenance.length === 0 && (
              <p className="text-slate-400 text-sm px-5 py-6 text-center font-medium">No maintenance records yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardHome;