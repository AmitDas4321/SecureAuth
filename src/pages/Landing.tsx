import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Smartphone, Zap, Globe, Github, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_NAME } from '../constants';

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Lock,
      title: 'Military-Grade Encryption',
      description: 'Your secrets are encrypted locally using AES-GCM 256-bit encryption before ever leaving your device.'
    },
    {
      icon: Smartphone,
      title: 'Offline First',
      description: 'Generate codes without an internet connection. Your security shouldn\'t depend on the cloud.'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built for speed with a minimal footprint. Get your codes in milliseconds, every time.'
    }
  ];

  const stats = [
    { label: 'Users Protected', value: '10K+' },
    { label: 'Codes Generated', value: '1M+' },
    { label: 'Uptime', value: '99.9%' }
  ];

  return (
    <div className="min-h-screen bg-bg-main selection:bg-brand selection:text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tighter text-text-primary uppercase">{APP_NAME}</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-bold text-text-muted hover:text-brand transition-colors uppercase tracking-widest">Features</a>
              <a href="#security" className="text-sm font-bold text-text-muted hover:text-brand transition-colors uppercase tracking-widest">Security</a>
              <button 
                onClick={() => navigate('/login')}
                className="bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all active:scale-95 uppercase tracking-widest"
              >
                Access Vault
              </button>
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="md:hidden bg-brand text-white p-2.5 rounded-xl text-sm font-bold shadow-lg shadow-brand/20"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 bg-brand/10 text-brand text-[10px] md:text-xs font-black uppercase tracking-[0.2em] rounded-full mb-6 border border-brand/20">
              The Gold Standard of 2FA
            </span>
            <h1 className="text-5xl md:text-8xl font-black text-text-primary tracking-tighter leading-[0.9] mb-8">
              SECURE YOUR <br />
              <span className="text-brand">DIGITAL WORLD.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary font-medium leading-relaxed mb-12">
              A private, fast, and encrypted authenticator vault. Keep your multi-factor accounts safe with local-first security.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-10 py-5 bg-brand text-white rounded-2xl text-base md:text-lg font-black uppercase tracking-widest hover:bg-brand-hover shadow-2xl shadow-brand/30 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                Get Started Now <ArrowRight className="w-5 h-5" />
              </button>
              <a 
                href="https://github.com/AmitDas4321/SecureAuth"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-10 py-5 bg-white text-text-primary border-2 border-border rounded-2xl text-base md:text-lg font-black uppercase tracking-widest hover:border-brand transition-all flex items-center justify-center gap-3"
              >
                <Github className="w-5 h-5" /> GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-bg-main border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-black text-text-primary tracking-tighter mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-text-muted uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black text-text-primary tracking-tighter uppercase mb-4">Powerful Security.</h2>
            <p className="text-text-secondary font-medium uppercase tracking-widest text-sm">Everything you need to stay safe online.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-10 bg-bg-main rounded-[2.5rem] border border-border hover:border-brand transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-8 border border-border group-hover:bg-brand group-hover:text-white transition-all shadow-sm">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-4">{feature.title}</h3>
                <p className="text-text-secondary font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Detail */}
      <section id="security" className="py-24 md:py-32 bg-bg-main overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter leading-[1.1] uppercase">
                YOUR KEYS. <br />
                YOUR DEVICE. <br />
                <span className="text-brand">YOUR CONTROL.</span>
              </h2>
              <p className="text-lg text-text-secondary leading-relaxed font-medium">
                Unlike other authenticators, we believe in radical transparency. Our architecture is designed so that even if our servers were compromised, your data remains secure behind your personal encryption.
              </p>
              <ul className="space-y-4">
                {[
                  'Zero-knowledge architecture',
                  'Local encryption with AES-GCM',
                  'Secure backup and recovery flows',
                  'No trackers or analytics on your secrets'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-bold text-text-primary uppercase tracking-tight text-sm">
                    <CheckCircle2 className="w-5 h-5 text-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 relative">
              <div className="absolute -inset-10 bg-brand/10 blur-[100px] rounded-full" />
              <div className="relative bg-white p-4 rounded-[3rem] border border-border shadow-2xl skew-y-3">
                <div className="bg-bg-main rounded-[2.5rem] p-8 border border-border">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center text-white">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-text-primary tracking-tight">ENCRYPTION ACTIVE</div>
                      <div className="text-[10px] font-bold text-brand uppercase tracking-widest">Protocol V2.4</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-4 bg-white rounded-full border border-border w-[80%] even:w-full" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-brand relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-white/10 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-8 leading-[0.9] uppercase">
            READY TO SECURE <br /> YOUR ACCOUNTS?
          </h2>
          <button 
            onClick={() => navigate('/login')}
            className="px-12 py-6 bg-white text-brand rounded-[2rem] text-lg font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95"
          >
            Start Encrypting
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-black tracking-tighter text-text-primary uppercase text-sm">{APP_NAME}</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-xs font-bold text-text-muted hover:text-brand uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-xs font-bold text-text-muted hover:text-brand uppercase tracking-widest">Terms</a>
            <a href="#" className="text-xs font-bold text-text-muted hover:text-brand uppercase tracking-widest">Twitter</a>
          </div>
          <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
            © {new Date().getFullYear()} {APP_NAME.toUpperCase()} VAULT. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
