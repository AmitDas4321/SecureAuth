import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Shield, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_NAME } from '../constants';

export default function Login() {
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const countries = [
    { code: '+91', label: 'IN (+91)' },
    { code: '+1', label: 'US/CA (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+61', label: 'AU (+61)' },
    { code: '+971', label: 'AE (+971)' },
    { code: '+49', label: 'DE (+49)' },
    { code: '+33', label: 'FR (+33)' },
    { code: '+81', label: 'JP (+81)' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setLoading(true);
    const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, '')}`;
    try {
      const { verificationId } = await login(fullPhone);
      navigate('/verify-otp', { state: { verificationId, phoneNumber: fullPhone } });
    } catch (err) {
      alert('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-main text-text-primary">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-center mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center shadow-xl shadow-brand/20">
            <Shield className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] mb-2">{APP_NAME}</h1>
          <p className="text-sm text-text-secondary font-medium lowercase tracking-tight">Identity Management Protocol</p>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e5e5e5] space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary ml-1">WhatsApp Phone Number</label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 px-3 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all text-sm font-medium cursor-pointer"
                >
                  {countries.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
                <div className="relative group flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-brand transition-colors" />
                  <input
                    type="tel"
                    placeholder="9123456789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-brand/10 focus:border-brand outline-none transition-all placeholder:text-text-muted/50 text-sm font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-brand text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-brand-hover disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Send OTP via WhatsApp <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[10px] text-center text-text-muted font-medium leading-relaxed px-4">
            Security verification required. A temporary access code will be transmitted to your registered device.
          </p>
        </div>

        <div className="mt-12 flex justify-center gap-8 opacity-20">
           <div className="w-4 h-4 bg-text-muted rounded-full" />
           <div className="w-4 h-4 bg-text-muted rounded-full" />
           <div className="w-4 h-4 bg-text-muted rounded-full" />
        </div>
      </motion.div>
    </div>
  );
}
