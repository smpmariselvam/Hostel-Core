import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="bg-slate-50 min-h-[calc(100vh-8rem)]">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-8">
          <div className="rounded-3xl bg-slate-950 text-white p-8 lg:p-10">
            <p className="text-blue-300 font-bold uppercase tracking-[0.25em] text-xs">Contact Us</p>
            <h1 className="text-4xl font-black mt-4">Need hostel assistance?</h1>
            <p className="text-slate-300 mt-4 leading-7">
              Reach out to the hostel administration for room allocation, billing, maintenance, or application support.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: <Phone size={18} />, text: '+91 98765 43210' },
                { icon: <Mail size={18} />, text: 'support@hostelcore.edu' },
                { icon: <MapPin size={18} />, text: 'Campus Hostel Office, College Road' }
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                  <span className="text-blue-300">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-8 lg:p-10">
            <h2 className="text-2xl font-black text-slate-900">Send a Message</h2>
            <p className="text-slate-500 mt-2">This form is UI-ready for your college demo and can later be connected to email or notifications.</p>
            <form className="mt-8 grid sm:grid-cols-2 gap-5" onSubmit={(e) => {
              e.preventDefault();
              alert('Thanks! Your message has been noted for the hostel office.');
            }}>
              <input required className="rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Full name" />
              <input required type="email" className="rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email address" />
              <input className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Subject" />
              <textarea required rows="5" className="sm:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="How can we help?" />
              <button className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 font-black text-white hover:bg-blue-700 transition">
                <Send size={18} /> Submit Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
