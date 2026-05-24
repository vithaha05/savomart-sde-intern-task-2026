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
    if (!validateMobile(mobile)) { setError('Enter a valid 10-digit mobile number'); return; }
    setLoading(true); setError('');
    try {
      const response = await axiosInstance.post('/auth/send-otp', { mobile_number: mobile });
      setDevOtp(response.data.dev_otp || '');
      setStep(2); setResendCooldown(30);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp]; newOtp[index] = value.slice(-1); setOtp(newOtp); setError('');
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputRefs.current[index - 1]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) { setError('Enter all 6 digits'); return; }
    setLoading(true); setError('');
    try {
      const response = await axiosInstance.post('/auth/verify-otp', { mobile_number: mobile, otp_code: otpCode });
      login(response.data.access_token, response.data.user);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.');
    } finally { setLoading(false); }
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
      setDevOtp(response.data.dev_otp || ''); setResendCooldown(30); setError('');
    } catch (err) { setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally { setLoading(false); }
  };

  const s = {
    page: {minHeight:'100vh',background:'#f9f5fb',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'},
    card: {background:'white',borderRadius:'20px',padding:'40px 32px',width:'100%',maxWidth:'400px',boxShadow:'0 4px 24px rgba(120,43,144,0.12)'},
    logo: {textAlign:'center',marginBottom:'32px'},
    logoText: {fontSize:'28px',fontWeight:'800',color:'#782B90'},
    logoSub: {fontSize:'14px',color:'#9ca3af',marginTop:'4px'},
    label: {fontSize:'13px',fontWeight:'600',color:'#374151',marginBottom:'8px',display:'block'},
    inputRow: {display:'flex',alignItems:'center',border:'2px solid #e5e7eb',borderRadius:'10px',overflow:'hidden',marginBottom:'8px'},
    prefix: {padding:'12px 12px',background:'#f9f5fb',color:'#782B90',fontWeight:'700',fontSize:'14px',borderRight:'2px solid #e5e7eb'},
    input: {flex:1,padding:'12px',border:'none',outline:'none',fontSize:'16px',color:'#1f2937'},
    btn: {width:'100%',padding:'14px',background:'#782B90',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'pointer',marginTop:'8px'},
    btnDisabled: {width:'100%',padding:'14px',background:'#d1d5db',color:'white',border:'none',borderRadius:'10px',fontSize:'15px',fontWeight:'700',cursor:'not-allowed',marginTop:'8px'},
    error: {color:'#ef4444',fontSize:'13px',marginBottom:'8px'},
    devBanner: {background:'#fffde7',border:'1px solid #FFF200',borderRadius:'8px',padding:'10px 14px',marginBottom:'16px',fontSize:'13px',color:'#782B90'},
    otpGrid: {display:'flex',gap:'8px',justifyContent:'center',marginBottom:'16px'},
    otpBox: {width:'44px',height:'52px',border:'2px solid #e5e7eb',borderRadius:'10px',textAlign:'center',fontSize:'22px',fontWeight:'700',color:'#782B90',outline:'none'},
    otpBoxFocus: {border:'2px solid #782B90'},
    back: {background:'none',border:'none',color:'#782B90',fontSize:'14px',fontWeight:'600',cursor:'pointer',marginBottom:'24px',padding:0},
    resend: {background:'none',border:'none',color:'#782B90',fontSize:'13px',fontWeight:'600',cursor:'pointer',padding:0},
  };

  if (step === 1) return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <div style={s.logoText}>Savomart</div>
          <div style={s.logoSub}>Your loyalty companion</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <label style={s.label}>Mobile Number</label>
          <div style={s.inputRow}>
            <span style={s.prefix}>+91</span>
            <input style={s.input} type="tel" value={mobile} onChange={handleMobileChange} placeholder="10-digit number" maxLength="10" />
          </div>
          {error && <p style={s.error}>{error}</p>}
        </div>
        <button style={mobile.length === 10 && !loading ? s.btn : s.btnDisabled} onClick={handleSendOtp} disabled={loading || mobile.length !== 10}>
          {loading ? 'Sending...' : 'Send OTP'}
        </button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={s.card}>
        <button style={s.back} onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); setDevOtp(''); }}>← Change number</button>
        <div style={s.logo}>
          <div style={s.logoText}>Enter OTP</div>
          <div style={s.logoSub}>Sent to +91 {mobile.slice(0,2)}****{mobile.slice(6)}</div>
        </div>
        {devOtp && (
          <div style={s.devBanner}>
            <strong>Dev mode OTP:</strong> <span style={{fontFamily:'monospace',fontWeight:'800',fontSize:'16px'}}>{devOtp}</span>
          </div>
        )}
        <div style={s.otpGrid}>
          {otp.map((digit, index) => (
            <input key={index} ref={(el) => (otpInputRefs.current[index] = el)} type="text" value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleOtpKeyDown(index, e)}
              maxLength="1" inputMode="numeric"
              style={{...s.otpBox, borderColor: digit ? '#782B90' : '#e5e7eb'}}
            />
          ))}
        </div>
        {error && <p style={{...s.error, textAlign:'center'}}>{error}</p>}
        <button style={otp.join('').length === 6 && !loading ? s.btn : s.btnDisabled} onClick={handleVerifyOtp} disabled={loading || otp.join('').length !== 6}>
          {loading ? 'Verifying...' : 'Verify & Login'}
        </button>
        <div style={{textAlign:'center',marginTop:'16px'}}>
          <p style={{fontSize:'13px',color:'#9ca3af',marginBottom:'6px'}}>Didn't receive OTP?</p>
          <button style={{...s.resend, opacity: resendCooldown > 0 ? 0.5 : 1}} onClick={handleResendOtp} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
