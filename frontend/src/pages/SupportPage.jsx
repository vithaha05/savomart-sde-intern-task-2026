import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SupportPage() {
  const { user } = useAuth();

  // Form states
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [ticketDetails, setTicketDetails] = useState(null);

  // Fetch support contact info
  const { data: contactInfo, isLoading: isLoadingContact } = useQuery({
    queryKey: ['supportContact'],
    queryFn: () => axiosInstance.get('/support/contact').then((res) => res.data),
  });

  // Fetch profile to prefill
  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => axiosInstance.get('/profile').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  // Prefill form values from profile or auth context
  useEffect(() => {
    if (profileData) {
      if (profileData.name) setName(profileData.name);
      if (profileData.mobile_number) setContact(profileData.mobile_number);
      else if (profileData.email) setContact(profileData.email);
    } else if (user) {
      if (user.name) setName(user.name);
      if (user.mobile_number) setContact(user.mobile_number);
      else if (user.email) setContact(user.email);
    }
  }, [profileData, user]);

  // Support ticket mutation
  const ticketMutation = useMutation({
    mutationFn: (newTicket) => axiosInstance.post('/support/ticket', newTicket).then((res) => res.data),
    onSuccess: (data) => {
      setTicketDetails(data);
      // Reset description and category only
      setDescription('');
      setCategory('');
      setErrors({});
      setSubmitError('');
    },
    onError: (err) => {
      setSubmitError(err.response?.data?.detail || err.response?.data?.message || 'Failed to submit support ticket. Please try again.');
    },
  });

  // Form Validation
  const validateForm = () => {
    const tempErrors = {};
    if (!name.trim()) {
      tempErrors.name = 'Name is required';
    }

    if (!contact.trim()) {
      tempErrors.contact = 'Contact info is required';
    } else {
      const isMobile = /^[0-9]{10}$/.test(contact.trim());
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim());
      if (!isMobile && !isEmail) {
        tempErrors.contact = 'Enter a valid 10-digit mobile number or email address';
      }
    }

    if (!category) {
      tempErrors.category = 'Please select an issue category';
    }

    if (!description.trim()) {
      tempErrors.description = 'Description is required';
    } else if (description.trim().length < 10) {
      tempErrors.description = 'Description must be at least 10 characters long';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Map Category label to backend expectations
    // dropdown labels are "Points/Rewards" -> backend expects "Points / Rewards"
    let mappedCategory = category;
    if (category === 'Points/Rewards') {
      mappedCategory = 'Points / Rewards';
    }

    ticketMutation.mutate({
      name: name.trim(),
      contact: contact.trim(),
      issue_category: mappedCategory,
      description: description.trim(),
    });
  };

  const handleResetSuccess = () => {
    setTicketDetails(null);
  };

  // Categories list as requested
  const categories = [
    'Order Issue',
    'Points/Rewards',
    'Coupon Problem',
    'Store Feedback',
    'Account Help',
    'Other',
  ];

  return (
    <div className="min-h-screen bg-page-bg py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-ink tracking-tight mb-2">
            Support Center
          </h1>
          <p className="text-muted text-sm md:text-base">
            We are here to help. Get in touch with our team or submit a support ticket.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          {/* Contact Info (Left column, span 2) */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
                <span>📞</span> Contact Information
              </h2>

              {isLoadingContact ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="w-10 h-10 rounded-full bg-border"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-border rounded w-16"></div>
                        <div className="h-4 bg-border rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : contactInfo ? (
                <div className="space-y-6">
                  {/* Phone Row */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple flex-shrink-0">
                      📱
                    </div>
                    <div>
                      <p className="text-xs text-muted font-semibold uppercase tracking-wider">
                        Call Us
                      </p>
                      <a
                        href={`tel:${contactInfo.phone}`}
                        className="text-base text-ink font-bold hover:text-brand-purple transition-colors"
                      >
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  {/* Email Row */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple flex-shrink-0">
                      ✉️
                    </div>
                    <div>
                      <p className="text-xs text-muted font-semibold uppercase tracking-wider">
                        Email Support
                      </p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        className="text-base text-ink font-bold hover:text-brand-purple transition-colors"
                      >
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Hours Row */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-purple/10 flex items-center justify-center text-brand-purple flex-shrink-0">
                      🕒
                    </div>
                    <div>
                      <p className="text-xs text-muted font-semibold uppercase tracking-wider">
                        Operating Hours
                      </p>
                      <p className="text-sm text-ink font-semibold leading-relaxed">
                        {contactInfo.operating_hours}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">Contact details unavailable at the moment.</p>
              )}
            </div>

            {/* Nice help card */}
            <div className="bg-gradient-to-br from-brand-purple to-brand-purple-dark text-white rounded-2xl p-6 shadow-md">
              <h3 className="font-bold text-lg mb-2">FAQ Quick Tip</h3>
              <p className="text-white/80 text-xs md:text-sm leading-relaxed">
                Before submitting a ticket, check your Loyalty points page. Points take up to 2 hours after purchase to reflect in your account balance.
              </p>
            </div>
          </div>

          {/* Form / Success Card (Right column, span 3) */}
          <div className="md:col-span-3">
            {ticketDetails ? (
              /* Success card state */
              <div className="bg-white rounded-2xl border-t-4 border-t-green-500 border border-border p-6 md:p-8 shadow-sm">
                <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mb-5">
                  ✅
                </div>
                <h2 className="text-2xl font-bold text-ink mb-2">Support Ticket Submitted!</h2>
                <div className="bg-green-50/50 border border-green-200/50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-green-800 font-bold uppercase tracking-wider">
                    Ticket ID
                  </p>
                  <p className="text-sm font-mono font-bold text-ink mt-0.5 select-all">
                    {ticketDetails.id}
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Status: <span className="font-semibold">{ticketDetails.status || 'Open'}</span>
                  </p>
                </div>
                <p className="text-muted text-sm leading-relaxed mb-6">
                  We'll get back to you within 24 hours. A copy of this ticket reference has been logged to your support logs.
                </p>
                <button
                  onClick={handleResetSuccess}
                  className="px-6 py-2.5 bg-brand-purple text-white font-semibold rounded-full hover:bg-brand-purple/90 transition-all text-sm"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              /* Support ticket form */
              <div className="bg-white rounded-2xl border border-border p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-ink mb-6 flex items-center gap-2">
                  <span>✉️</span> Get Help
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      placeholder="Your full name"
                      className="w-full py-2.5 px-3 bg-white border border-border rounded-xl focus:border-brand-purple focus:outline-none text-sm text-ink transition-colors"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
                  </div>

                  {/* Contact field */}
                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                      Contact Mobile or Email
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => {
                        setContact(e.target.value);
                        if (errors.contact) setErrors({ ...errors, contact: '' });
                      }}
                      placeholder="10-digit mobile or email address"
                      className="w-full py-2.5 px-3 bg-white border border-border rounded-xl focus:border-brand-purple focus:outline-none text-sm text-ink transition-colors"
                    />
                    {errors.contact && <p className="text-red-500 text-xs mt-1.5">{errors.contact}</p>}
                  </div>

                  {/* Dropdown field */}
                  <div>
                    <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                      Issue Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (errors.category) setErrors({ ...errors, category: '' });
                      }}
                      className="w-full py-2.5 px-3 bg-white border border-border rounded-xl focus:border-brand-purple focus:outline-none text-sm text-ink transition-colors appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236d6576' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundSize: '1.25rem',
                        backgroundRepeat: 'no-repeat',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.category}</p>
                    )}
                  </div>

                  {/* Description field */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                        Issue Description
                      </label>
                      <span className="text-[10px] text-muted font-bold">
                        {description.length} chars (min 10)
                      </span>
                    </div>
                    <textarea
                      rows="4"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) setErrors({ ...errors, description: '' });
                      }}
                      placeholder="Please explain the problem you are facing in detail..."
                      className="w-full py-2.5 px-3 bg-white border border-border rounded-xl focus:border-brand-purple focus:outline-none text-sm text-ink transition-colors resize-none"
                    ></textarea>
                    {errors.description && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.description}</p>
                    )}
                  </div>

                  {/* API Mutate errors */}
                  {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs">
                      ⚠️ {submitError}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={ticketMutation.isPending}
                    className="w-full py-3 bg-brand-purple text-white font-semibold rounded-full hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm md:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {ticketMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
