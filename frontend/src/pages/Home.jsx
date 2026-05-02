import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BedDouble, Bell, CreditCard, LineChart, Users, Wrench } from 'lucide-react';

const Home = () => {
  const features = [
    { icon: <BedDouble size={22} />, title: 'Room Allocation', text: 'Assign rooms, track capacity, and manage resident check-ins with clear records.' },
    { icon: <CreditCard size={22} />, title: 'Online Billing', text: 'Generate invoices and collect PhonePe UAT payments with verified payment status.' },
    { icon: <Wrench size={22} />, title: 'Maintenance Desk', text: 'Residents raise requests and staff update status without manual paperwork.' },
    { icon: <Bell size={22} />, title: 'Smart Alerts', text: 'Send announcements, payment reminders, and maintenance updates instantly.' }
  ];

  const bars = [62, 78, 48, 86, 70, 92];

  return (
    <div className="bg-slate-50 text-slate-900">
      <section className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 mb-6">
                <LineChart size={16} /> College hostel management dashboard
              </div>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight text-slate-950">
                A clean, modern way to manage your hostel.
              </h1>
              <p className="mt-6 text-lg text-slate-600 max-w-2xl leading-8">
                HostelCore brings rooms, residents, maintenance, billing, announcements, and role dashboards into one fast and professional web app.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-blue-600 px-6 py-3 font-black text-white hover:bg-blue-700 transition">
                  Apply as Resident <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 border border-slate-300 bg-white px-6 py-3 font-black text-slate-800 hover:bg-slate-50 transition">
                  Login to Dashboard
                </Link>
              </div>
            </div>

            <div className="bg-white border border-slate-200 shadow-xl p-6">
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  ['128', 'Residents'],
                  ['42', 'Rooms'],
                  ['₹84k', 'Collected'],
                  ['9', 'Tickets']
                ].map(([value, label]) => (
                  <div key={label} className="border border-slate-200 bg-slate-50 p-4">
                    <p className="text-3xl font-black text-slate-950">{value}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-black text-slate-900">Monthly Operations</p>
                    <p className="text-xs text-slate-500">Sample activity chart</p>
                  </div>
                  <Users className="text-blue-600" />
                </div>
                <div className="h-44 flex items-end gap-3 border-b border-l border-slate-200 px-2">
                  {bars.map((height, index) => (
                    <div key={index} className="flex-1 bg-blue-600" style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-blue-600 font-black uppercase tracking-[0.25em] text-xs">Core Modules</p>
            <h2 className="text-3xl sm:text-4xl font-black mt-3">Everything your hostel office needs</h2>
            <p className="text-slate-500 mt-3">Designed to look professional in your college demo and still work practically for real hostel workflows.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white p-6 border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="font-black text-lg">{feature.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-6">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
