import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QrScanner from 'qr-scanner';
import { useAccountStore } from '../store/accountStore';
import { useToastStore } from '../store/toastStore';
import { ChevronLeft, Camera, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_NAME } from '../constants';

export default function QRImport() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addAccount } = useAccountStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!videoRef.current) return;

    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        handleScan(result.data);
        scanner.stop();
      },
      {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      }
    );

    scanner.start().catch((err) => {
      console.error(err);
      setError('Camera access denied. Please enable camera permissions.');
    });

    return () => scanner.destroy();
  }, []);

  const handleScan = async (data: string) => {
    const isTotp = data.startsWith('otpauth://totp/');
    const isOracle = data.startsWith('oraclemobileauthenticator://totp/');

    if (!isTotp && !isOracle) {
      setError('Invalid QR Code. Only TOTP and Oracle Authenticator codes are supported.');
      return;
    }

    setLoading(true);
    try {
      const url = new URL(data);
      const labelPart = decodeURIComponent(url.pathname.split('/').pop() || '');
      const [issuerFromPath, accountLabel] = labelPart.includes(':') 
        ? labelPart.split(':') 
        : [url.searchParams.get('issuer') || '', labelPart];

      const secretParam = url.searchParams.get('secret');
      const otpParam = url.searchParams.get('OTP');
      const rsaParam = url.searchParams.get('RSA');
      const sseParam = url.searchParams.get('SSE');

      // Helper to validate and normalize a Base32 secret
      const isValidBase32 = (str: string) => /^[A-Z2-7]+=*$/.test(str.toUpperCase()) && str.length >= 10;
      
      let finalSecret = '';

      if (secretParam && isValidBase32(secretParam)) {
        finalSecret = secretParam;
        console.log('Strategy 1: Secret extracted from "secret" param');
      } else if (otpParam && isValidBase32(otpParam)) {
        finalSecret = otpParam;
        console.log('Strategy 2: Secret extracted from "OTP" param');
      } else if (rsaParam && isValidBase32(rsaParam)) {
        finalSecret = rsaParam;
        console.log('Strategy 3: Secret extracted from "RSA" param');
      } else if (sseParam === 'Base32' && otpParam) {
        // Specifically check if SSE indicates the OTP field is Base32
        finalSecret = otpParam;
        console.log('Strategy 4: SSE=Base32, using OTP param');
      } else {
        // Last-ditch: Look for any param that looks like a Base32 secret
        for (const [key, value] of url.searchParams.entries()) {
          if (key.toLowerCase() !== 'issuer' && key.toLowerCase() !== 'label' && isValidBase32(value)) {
            finalSecret = value;
            console.log(`Strategy 5: Secret found in param "${key}"`);
            break;
          }
        }
      }

      const payload: any = {
        issuer: url.searchParams.get('issuer') || issuerFromPath || (isOracle ? 'Oracle' : 'Other'),
        label: accountLabel || labelPart,
        secret: finalSecret,
        digits: parseInt(url.searchParams.get('digits') || '6'),
        period: parseInt(url.searchParams.get('period') || '30'),
        algorithm: url.searchParams.get('algorithm') || 'SHA1',
        provider: isOracle ? 'oracle_mobile_authenticator' : 'totp',
        rawQrData: data,
      };

      if (isOracle) {
        payload.oracleMetadata = {
          deviceId: url.searchParams.get('Deviceid') || undefined,
          domainName: url.searchParams.get('domainName') || undefined,
          tenantName: url.searchParams.get('tenantName') || undefined,
          cloudAccountName: url.searchParams.get('cloudAccountName') || undefined,
          loginUrl: url.searchParams.get('LoginURL') || undefined,
          otp: otpParam || undefined,
          rsa: rsaParam || undefined,
          requestId: url.searchParams.get('RequestId') || undefined,
          keyPairLength: url.searchParams.get('KeyPairLength') || undefined,
          serviceType: url.searchParams.get('ServiceType') || undefined,
          sse: sseParam || undefined,
        };
      }

      await addAccount(payload);

      if (isOracle && !finalSecret) {
        addToast("Oracle QR imported successfully. No standard TOTP secret could be extracted, so code generation is disabled for this factor.", 'warning');
      }

      navigate('/dashboard');
    } catch (err) {
      console.error('Scan Error:', err);
      addToast('Failed to import account from QR.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <header className="sticky top-0 z-40 bg-white border-b border-border px-4 md:px-8 py-4 md:py-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-bg-main rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h1 className="font-bold tracking-tight text-xl text-text-primary">Optical Scan</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-8 max-w-2xl mx-auto w-full overflow-y-auto">
        <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-[2.5rem] border-8 border-white shadow-2xl bg-black group">
          <video ref={videoRef} className="w-full h-full object-cover" />
          <div className="absolute inset-0 border-[60px] border-black/60 pointer-events-none transition-all group-hover:border-black/40">
             <div className="w-full h-full border-2 border-brand rounded-3xl animate-pulse shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          </div>
          
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center p-8 text-center z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand" />
                <p className="text-xs font-bold text-text-primary uppercase tracking-widest">Parsing Security Token...</p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12 text-center space-y-6">
          <div className="flex items-center justify-center gap-3 text-text-muted">
            <div className="p-2 bg-white rounded-full shadow-sm border border-border">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">Visual Alignment Required</span>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center justify-center gap-3 border border-red-200 shadow-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </motion.div>
          )}

          <div className="text-[10px] text-text-muted font-medium lowercase leading-relaxed max-w-xs mx-auto px-6 opacity-60">
            Center the authentication QR code within the highlighted viewfinder. {APP_NAME} will automatically detect and register the security factor.
          </div>
        </div>
      </main>
    </div>
  );
}
