import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Order Issue','Points/Rewards','Coupon Problem','Store Feedback','Account Help','Other'];

export default function SupportPage() {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);

  const { data: contactInfo, isLoading: isLoadingContact } = useQuery({
    queryKey: ['supportContact'],
    queryFn: () => axiosInstance.get('/support/contact').then(r => r.data),
  });

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => axiosInstance.get('/profile').then(r => r.data),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const src = profileData || user;
    if (src?.name) setName(src.name);
    if (src?.mobile_number) setContact(src.mobile_number);
    else if (src?.email) setContact(src.email);
  }, [profileData, user]);

  const ticketMutation = useMutation({
    mutationFn: (t) => axiosInstance.post('/support/ticket', t).then(r => r.data),
    onSuccess: (data) => { setTicketDetails(data); setDescription(''); setCategory(''); setErrors({}); setSubmitError(''); },
    onError: (err) => setSubmitError(err.response?.data?.detail || err.response?.data?.message || 'Failed to submit ticket. Please try again.'),
  });

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!contact.trim()) e.contact = 'Contact is required';
    else if (!/^[0-9]{10}$/.test(contact.trim()) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())) e.contact = 'Enter a valid mobile number or email';
    if (!category) e.category = 'Please select a category';
    if (!description.trim()) e.description = 'Description is required';
    else if (description.trim().length < 10) e.description = 'Minimum 10 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    ticketMutation.mutate({
      name: name.trim(),
      contact: contact.trim(),
      issue_category: category === 'Points/Rewards' ? 'Points / Rewards' : category,
      description: description.trim(),
    });
  };

  const s = {
    page: { padding: '0 0 24px' },
    heading: { fontSize: '22px', fontWeight: '800', color: '#782B90', margin: '0 0 4px' },
    sub: { fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' },
    grid: { display: 'flex', flexDirection: 'column', gap: '16px' },
    card: { background: 'white', borderRadius: '12px', border: '1px solid #f0e6f5', padding: '20px', boxShadow: '0 1px 4px rgba(120,43,144,0.08)' },
    cardTitle: { fontSize: '15px', fontWeight: '700', color: '#782B90', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    contactRow: { display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' },
    contactIcon: { width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(120,43,144,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
    contactLabel: { fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' },
    contactValue: { fontSize: '13px', fontWeight: '600', color: '#1f2937' },
    tipCard: { background: 'linear-gradient(135deg,#782B90,#5a1f6e)', borderRadius: '12px', padding: '16px', color: 'white' },
    label: { fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px', display: 'block' },
    input: { width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', color: '#1f2937', outline: 'none', boxSizing: 'border-box', background: 'white' },
    inputError: { width: '100%', padding: '10px 12px', border: '1.5px solid #ef4444', borderRadius: '8px', fontSize: '14px', color: '#1f2937', outline: 'none', boxSizing: 'border-box', background: 'white' },
    errorText: { fontSize: '11px', color: '#ef4444', marginTop: '4px' },
    field: { marginBottom: '14px' },
    btn: { width: '100%', padding: '13px', background: '#782B90', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '4px' },
    btnDisabled: { width: '100%', padding: '13px', background: '#d1d5db', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '700', cursor: 'not-allowed', marginTop: '4px' },
    successCard: { background: 'white', borderRadius: '12px', border: '1px solid #f0e6f5', borderTop: '4px solid #22c55e', padding: '24px', boxShadow: '0 1px 4px rgba(120,43,144,0.08)', textAlign: 'center' },
    ticketBox: { background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', margin: '16px 0' },
  };

  if (ticketDetails) return (
    <div style={s.page}>
      <h1 style={s.heading}>Support Center</h1>
      <p style={s.sub}>We're here to help.</p>
      <div style={s.successCard}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#1f2937', marginBottom: '8px' }}>Ticket Submitted!</h2>
        <div style={s.ticketBox}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: '#166534', textTransform: 'uppercase', marginBottom: '4px' }}>Ticket ID</p>
          <p style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: '800', color: '#782B90' }}>{ticketDetails.id}</p>
          <p style={{ fontSize: '11px', color: '#166534', marginTop: '6px' }}>Status: {ticketDetails.status || 'Open'}</p>
        </div>
        <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>We'll respond within 24 hours. Keep your ticket ID for reference.</p>
        <button onClick={() => setTicketDetails(null)} style={{ ...s.btn, width: 'auto', padding: '10px 24px' }}>Submit Another Ticket</button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <h1 style={s.heading}>Support Center</h1>
      <p style={s.sub}>Get in touch or submit a support ticket.</p>

      <div style={s.grid}>
        {/* Contact Info Card */}
        <div style={s.card}>
          <div style={s.cardTitle}><span>📞</span> Contact Information</div>
          {isLoadingContact ? (
            <div>
              {[1,2,3].map(i => <div key={i} style={{ height: '36px', background: '#f3e8f7', borderRadius: '8px', marginBottom: '12px' }} />)}
            </div>
          ) : contactInfo ? (
            <div>
              <div style={s.contactRow}>
                <div style={s.contactIcon}>📱</div>
                <div><p style={s.contactLabel}>Call Us</p><p style={s.contactValue}>{contactInfo.phone}</p></div>
              </div>
              <div style={s.contactRow}>
                <div style={s.contactIcon}>✉️</div>
                <div><p style={s.contactLabel}>Email</p><p style={s.contactValue}>{contactInfo.email}</p></div>
              </div>
              <div style={s.contactRow}>
                <div style={s.contactIcon}>🕒</div>
                <div><p style={s.contactLabel}>Hours</p><p style={s.contactValue}>{contactInfo.operating_hours}</p></div>
              </div>
            </div>
          ) : <p style={{ fontSize: '13px', color: '#9ca3af' }}>Contact details unavailable.</p>}
        </div>

        {/* Tip Card */}
        <div style={s.tipCard}>
          <p style={{ fontWeight: '700', marginBottom: '6px', fontSize: '14px' }}>💡 Quick Tip</p>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5' }}>Points take up to 2 hours after purchase to reflect in your balance.</p>
        </div>

        {/* Form Card */}
        <div style={s.card}>
          <div style={s.cardTitle}><span>✉️</span> Submit a Ticket</div>
          <form onSubmit={handleSubmit}>
            <div style={s.field}>
              <label style={s.label}>Name</label>
              <input style={errors.name ? s.inputError : s.input} value={name} onChange={e => { setName(e.target.value); setErrors(p => ({...p, name:''})); }} placeholder="Your full name" />
              {errors.name && <p style={s.errorText}>{errors.name}</p>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Mobile or Email</label>
              <input style={errors.contact ? s.inputError : s.input} value={contact} onChange={e => { setContact(e.target.value); setErrors(p => ({...p, contact:''})); }} placeholder="10-digit mobile or email" />
              {errors.contact && <p style={s.errorText}>{errors.contact}</p>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Issue Category</label>
              <select style={errors.category ? s.inputError : s.input} value={category} onChange={e => { setCategory(e.target.value); setErrors(p => ({...p, category:''})); }}>
                <option value="">-- Select Category --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p style={s.errorText}>{errors.category}</p>}
            </div>
            <div style={s.field}>
              <label style={s.label}>Description <span style={{ color: '#9ca3af', textTransform: 'none', fontWeight: '400' }}>({description.length} chars, min 10)</span></label>
              <textarea style={{ ...(errors.description ? s.inputError : s.input), resize: 'none', minHeight: '100px' }} value={description} onChange={e => { setDescription(e.target.value); setErrors(p => ({...p, description:''})); }} placeholder="Describe your issue in detail..." rows={4} />
              {errors.description && <p style={s.errorText}>{errors.description}</p>}
            </div>
            {submitError && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#dc2626', marginBottom: '12px' }}>⚠️ {submitError}</div>}
            <button type="submit" disabled={ticketMutation.isPending} style={ticketMutation.isPending ? s.btnDisabled : s.btn}>
              {ticketMutation.isPending ? 'Submitting...' : 'Submit Ticket →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
