import React from 'react';
import { Building2, CheckCircle2, GraduationCap, Users } from 'lucide-react';

const About = () => {
  const values = [
    'Transparent resident records and billing',
    'Fast room allocation and occupancy tracking',
    'Better communication between residents and staff',
    'Cleaner operations for college hostel teams'
  ];

  return (
    <div className="bg-slate-50">
      <section className="bg-slate-950 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-blue-300 font-bold uppercase tracking-[0.25em] text-xs">About HostelCore</p>
            <h1 className="text-4xl sm:text-5xl font-black mt-4">A hostel management system designed for real campus work.</h1>
            <p className="text-slate-300 mt-6 text-lg leading-8">
              HostelCore helps college administrators manage rooms, residents, maintenance, billing, and announcements from a single modern interface.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: <Building2 />, label: 'Rooms' },
                { icon: <Users />, label: 'Residents' },
                { icon: <GraduationCap />, label: 'College Ready' }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-5 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mb-3">
                    {item.icon}
                  </div>
                  <p className="font-black">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black text-slate-900">Why this project matters</h2>
            <p className="text-slate-600 mt-4 leading-7">
              Manual hostel work often becomes slow, repetitive, and hard to audit. This system converts those workflows into searchable records, simple dashboards, and role-based actions.
            </p>
            <div className="mt-6 space-y-3">
              {values.map((value) => (
                <div key={value} className="flex items-center gap-3 text-slate-700">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
