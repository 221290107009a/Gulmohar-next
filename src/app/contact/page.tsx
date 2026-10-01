'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, Sparkles } from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">

      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e63946] flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Get in Touch
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-serif mt-1">
          Gulmohar Footwear& Support
        </h1>
        <p className="text-xs text-gray-500 mt-2">
          Have an inquiry regarding footwear sizing, customized orders, or order tracking? We are here to assist you.
        </p>
        <div className="w-16 h-1 bg-[#d4af37] mx-auto mt-3 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#e63946]/10 text-[#e63946] flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Phone Hotline</h3>
              <p className="text-xs text-gray-500 mt-1">+91 9898798322</p>
              <p className="text-xs text-gray-500">+91 9824868605 (WhatsApp)</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#d4af37]/10 text-[#d4af37] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Email Inquiries</h3>
              <p className="text-xs text-gray-500 mt-1">support@footweargulmohar.com</p>

            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Our Location</h3>
              <p className="text-xs text-gray-500 mt-1">Gulmohar Footwear, Vadla RTO Road,Gujrat 364002, India</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Working Hours</h3>
              <p className="text-xs text-gray-500 mt-1">Monday – Sunday: 10:00 AM – 8:00 PM</p>
            </div>
          </div>
        </div>

        {/* Interactive Inquiry Form */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 font-serif mb-6">
            Send Us a Message
          </h2>

          {isSubmitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-emerald-900">Message Received!</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Thank you for reaching out. Our customer care team will respond within 24 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 9898798322"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Sizing Advice / Order Query"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Your Message *</label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we assist your style journey today?..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#d4af37]"
                />
              </div>

              <button
                type="submit"
                className="px-8 py-3.5 bg-[#e63946] hover:bg-[#c1121f] text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>Send Message</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}
