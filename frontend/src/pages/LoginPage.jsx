import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef([]);

  const validateMobile = (num) => /^[0-9]{10}$/.test(num);

  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobile(value);
    setError('');
  };

  const handleSendOtp = async () => {
    if (!validateMobile(mobile)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/auth/send-otp', { mobile_number: mobile });
      setDevOtp(response.data.dev_otp || '');
      setStep(2);
      setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Enter all 6 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axiosInstance.post('/auth/verify-otp', {
        mobile_number: mobile,
        otp_code: otpCode,
      });
      
      login(response.data.access_token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.post('/auth/send-otp', { mobile_number: mobile });
      setDevOtp(response.data.dev_otp || '');
      setResendCooldown(30);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {step === 1 ? (
        <div className="w-full max-w-sm">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold text-brand-purple mb-2">Savomart</h1>
          </div>

          <h2 className="text-2xl font-bold text-brand-purple mb-1 text-center">Welcome to Savomart</h2>
          <p className="text-muted text-center text-sm mb-8">Sign in with your mobile number</p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-ink mb-3">Mobile Number</label>
            <div className="flex items-center border-b-2 border-brand-purple">
              <span className="text-ink font-medium mr-2">+91</span>
              <input
                type="tel"
                value={mobile}
                onChange={handleMobileChange}
                placeholder="10-digit number"
                className="flex-1 py-3 bg-transparent outline-none text-lg text-ink placeholder-muted"
                maxLength="10"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

          <button
            onClick={handleSendOtp}
            disabled={loading || mobile.length !== 10}
            className="w-full py-3 bg-brand-purple text-white font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-brand-purple/90"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </div>
      ) : (
        <div className="w-full max-w-sm">
          <button
            onClick={() => {
              setStep(1);
              setOtp(['', '', '', '', '', '']);
              setError('');
              setDevOtp('');
            }}
            className="mb-8 text-brand-purple text-sm font-medium hover:opacity-80"
          >
            ← Change number
          </button>

          <h2 className="text-2xl font-bold text-brand-purple mb-1 text-center">Enter OTP</h2>
          <p className="text-muted text-center text-sm mb-8">Sent to +91 {mobile.slice(0, 2)}****{mobile.slice(6)}</p>

          {devOtp && (
            <div className="mb-6 p-3 bg-brand-yellow/20 border border-brand-yellow rounded text-sm text-ink">
              <span className="font-semibold">Dev mode:</span> OTP is <span className="font-mono font-bold">{devOtp}</span>
            </div>
          )}

          <div className="mb-6">
            <div className="flex gap-2 justify-between mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputRefs.current[index] = el)}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  maxLength="1"
                  inputMode="numeric"
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg focus:border-brand-purple focus:outline-none transition-colors"
                />
              ))}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-6 text-center">{error}</p>}

          <button
            onClick={handleVerifyOtp}
            disabled={loading || otp.join('').length !== 6}
            className="w-full py-3 bg-brand-purple text-white font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-brand-purple/90 mb-4"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <div className="text-center">
            <p className="text-sm text-muted mb-2">Didn't receive OTP?</p>
            <button
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || loading}
              className="text-brand-purple font-semibold text-sm hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}