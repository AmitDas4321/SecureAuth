import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { Lock, ArrowRight, Loader2, Timer } from 'lucide-react';
import { motion } from 'motion/react';

export default function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 mins
  const location = useLocation();
  const navigate = useNavigate();
  const { verify } = useAuthStore();
  const { addToast } = useToastStore();
  const { verificationId, phoneNumber } = location.state || {};

  useEffect(() => {
    if (!verificationId) navigate('/login');
    
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [verificationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;

    setLoading(true);
    try {
      const { isNewUser } = await verify(verificationId, otp);
      addToast('Identity verified. Nexus link status: ONLINE', 'success');
      if (isNewUser) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Verification protocol rejected or expired', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-bg-main text-text-primary">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <div className="w-12 h-12 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center shadow-sm">
            <Lock className="w-6 h-6 text-brand" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] mb-2 uppercase">Verify Account</h1>
        <p className="text-sm text-text-secondary font-medium mb-10 lowercase">
          Code transmitted to <span className="text-brand font-bold">{phoneNumber}</span>
        </p>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#e5e5e5]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-2">
              <input
                type="text"
                pattern="\d*"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                className="text-center text-4xl font-mono tracking-[0.2em] w-full bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl py-6 focus:border-brand focus:ring-4 focus:ring-brand/5 outline-none transition-all placeholder:text-text-muted/20"
              />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-text-muted uppercase">
              <Timer className="w-4 h-4" /> Valid for {formatTime(timer)}
            </div>

            <button
              disabled={loading || otp.length < 6}
              className="w-full bg-brand text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-brand-hover disabled:opacity-20 transition-all shadow-md active:scale-95"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Authenticate Factor <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <button 
          onClick={() => navigate('/login')}
          className="mt-10 text-xs font-bold text-text-muted hover:text-brand transition-colors uppercase tracking-[0.1em]"
        >
          &larr; Return to gateway
        </button>
      </motion.div>
    </div>
  );
}
