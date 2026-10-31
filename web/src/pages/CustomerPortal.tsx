import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  User,
  ArrowRight,
  CreditCard,
  Banknote,
  Send,
  MessageSquare,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface CustomerPortalProps {
  initialCategory?: string;
  selectedProviderForBooking?: any;
  onClearSelectedProvider?: () => void;
  onOpenAI: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  initialCategory = 'All',
  selectedProviderForBooking,
  onClearSelectedProvider,
  onOpenAI,
}) => {
  const { user, updatePassword } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'browse' | 'bookings' | 'complaints' | 'profile'>('browse');
  
  // Browse / Search State
  const [providers, setProviders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [targetProvider, setTargetProvider] = useState<any>(null);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('10:00 AM');
  const [serviceAddress, setServiceAddress] = useState(user?.address || '123 Downtown Street, Apt 4B');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [aiHelperLoading, setAiHelperLoading] = useState(false);

  // Bookings List State
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTargetBooking, setReviewTargetBooking] = useState<any>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Complaint State
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [myComplaints, setMyComplaints] = useState<any[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);

  // Profile Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    fetchProviders();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedProviderForBooking) {
      setTargetProvider(selectedProviderForBooking);
      setBookingModalOpen(true);
      if (onClearSelectedProvider) onClearSelectedProvider();
    }
  }, [selectedProviderForBooking]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchMyBookings();
    } else if (activeTab === 'complaints') {
      fetchMyComplaints();
    }
  }, [activeTab]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/providers/nearby', {
        params: { lat: 13.0418, lng: 80.2337, radius: 100 },
      });
      setProviders(res.data.data || []);
    } catch (e) {
      console.warn('Could not load providers', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data || []);
    } catch (e) {
      console.warn('Could not load categories', e);
    }
  };

  const fetchMyBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await api.get('/bookings/my');
      setMyBookings(res.data.data || []);
    } catch (e) {
      console.warn('Could not load bookings', e);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchMyComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const res = await api.get('/complaints/my');
      setMyComplaints(res.data.data || []);
    } catch (e) {
      console.warn('Could not load complaints', e);
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Refine Description with AI Assistant
  const handleAiRefine = async () => {
    if (!description.trim()) {
      showToast('Please type a brief issue first.', 'info');
      return;
    }
    setAiHelperLoading(true);
    try {
      const res = await api.post('/ai/helper', { input: description });
      const refinedText = res.data?.refined || res.data?.refinedText || res.data?.data;
      if (refinedText) {
        setDescription(refinedText);
        showToast('Problem description formatted with AI!', 'success');
      } else {
        showToast('Could not format text. Using your original description.', 'info');
      }
    } catch (e) {
      showToast('Could not format text. Using your original description.', 'info');
    } finally {
      setAiHelperLoading(false);
    }
  };

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate || !scheduledTime || !description.trim() || !serviceAddress.trim()) {
      showToast('Please fill in all booking fields.', 'error');
      return;
    }

    setBookingSubmitting(true);
    try {
      const providerId = targetProvider?.userId?._id || targetProvider?.userId || targetProvider?._id;
      const totalAmount = (targetProvider?.hourlyRate || 40) * 2;
      await api.post('/bookings', {
        providerId,
        categoryName: targetProvider?.category || 'General Service',
        scheduledDate,
        scheduledTime,
        serviceAddress: serviceAddress.trim(),
        location: { address: serviceAddress.trim() },
        description: description.trim(),
        paymentMethod: paymentMethod === 'card' ? 'online' : 'cash',
        totalAmount,
        hourlyRate: targetProvider?.hourlyRate || 40,
        estimatedHours: 2,
      });

      showToast('Booking requested successfully! The provider will confirm shortly.', 'success');
      setBookingModalOpen(false);
      setDescription('');
      setActiveTab('bookings');
      fetchMyBookings();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit booking request.';
      showToast(msg, 'error');
    } finally {
      setBookingSubmitting(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.put(`/bookings/${id}/status`, { status: 'cancelled' });
      showToast('Booking cancelled.', 'info');
      fetchMyBookings();
    } catch (err: any) {
      showToast('Could not cancel booking.', 'error');
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTargetBooking) return;
    setReviewSubmitting(true);
    try {
      await api.post('/reviews', {
        bookingId: reviewTargetBooking._id,
        providerId: reviewTargetBooking.providerId?._id || reviewTargetBooking.providerId,
        rating: ratingScore,
        reviewText,
      });
      showToast('Thank you for rating your service!', 'success');
      setReviewModalOpen(false);
      setReviewText('');
      fetchMyBookings();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Could not submit review.', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Submit Complaint
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) {
      showToast('Please fill in subject and description.', 'error');
      return;
    }
    try {
      await api.post('/complaints', {
        subject: complaintSubject,
        description: complaintDesc,
      });
      showToast('Dispute ticket raised. An admin will review it.', 'success');
      setComplaintSubject('');
      setComplaintDesc('');
      fetchMyComplaints();
    } catch (e: any) {
      showToast('Failed to file dispute.', 'error');
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    setPasswordUpdating(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setPasswordUpdating(false);
    }
  };

  // Filtered providers
  const filteredProviders = providers.filter((p) => {
    const matchCategory =
      selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();
    const name = p.userId?.name || '';
    const matchSearch =
      !searchQuery.trim() ||
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[80vh]">
      {/* Top Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borderSubtle mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Customer Portal</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Book verified local technicians, track active jobs, and manage your account
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'browse' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Find Services
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'complaints' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Support & Disputes
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Profile & Security
          </button>
        </div>
      </div>

      {/* TAB 1: BROWSE PROVIDERS */}
      {activeTab === 'browse' && (
        <div>
          {/* AI Banner for quick advice */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Need diagnostic assistance?</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Our assistant helps you diagnose repair issues and match with the top available specialist.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenAI}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
            >
              Open Diagnostic Assistant
            </button>
          </div>

          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-borderSubtle shadow-xs mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by provider name, specialty, or keywords..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-borderSubtle bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === 'All'
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              {['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Appliances', 'Painting'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory.toLowerCase() === cat.toLowerCase()
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">Loading verified professionals...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-borderSubtle">
              <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No technicians found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No verified providers matched your search criteria. Try selecting another category or clearing your search.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-primary text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProviders.map((p, idx) => {
                const name = p.userId?.name || 'Verified Professional';
                const img = p.userId?.profileImage;
                const isOnline = p.isAvailable !== false;
                return (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 border border-borderSubtle card-hover flex flex-col justify-between shadow-card"
                  >
                    <div>
                      <div className="flex items-center gap-3.5 mb-4">
                        <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary overflow-hidden shrink-0 relative">
                          {img ? (
                            <img src={img} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-7 h-7 stroke-[2]" />
                          )}
                          {isOnline && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-base font-bold text-slate-900 truncate">{name}</h4>
                            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                          </div>
                          <p className="text-xs text-slate-500">{p.category} Specialist</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{p.averageRating || 4.8}</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-500">{p.totalReviews || 94} reviews</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                        {p.bio || 'Experienced technician providing certified repair and installation services.'}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{p.location?.address || 'Metro Service Area'}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-borderSubtle flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Hourly Rate</span>
                        <p className="text-base font-extrabold text-slate-900">${p.hourlyRate}/hr</p>
                      </div>
                      <button
                        onClick={() => {
                          setTargetProvider(p);
                          setBookingModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY BOOKINGS */}
      {activeTab === 'bookings' && (
        <div>
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
            {['all', 'pending', 'accepted', 'ongoing', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-primary text-white'
                    : 'bg-white text-slate-600 border border-borderSubtle hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {bookingsLoading ? (
            <div className="py-20 text-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-slate-500 font-medium">Loading your bookings...</p>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-borderSubtle">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No bookings found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You haven't requested any services yet. Explore our verified providers to book your first appointment.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings
                .filter((b) => statusFilter === 'all' || b.status?.toLowerCase() === statusFilter.toLowerCase())
                .map((booking) => {
                  const providerName = booking.providerId?.userId?.name || booking.providerName || 'Certified Technician';
                  const statusColors: Record<string, { bg: string; text: string }> = {
                    pending: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
                    accepted: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                    ongoing: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
                    completed: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
                    cancelled: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
                  };
                  const color = statusColors[booking.status] || { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' };

                  return (
                    <div
                      key={booking._id}
                      className="bg-white rounded-2xl p-5 sm:p-6 border border-borderSubtle shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 max-w-xl">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase border ${color.bg} ${color.text}`}>
                            {booking.status}
                          </span>
                          <span className="text-xs text-slate-400">Order #{booking._id?.slice(-6)}</span>
                        </div>
                        <h4 className="text-base font-bold text-slate-900">{booking.description}</h4>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-medium text-slate-700">
                            <User className="w-3.5 h-3.5 text-primary" />
                            {providerName}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {booking.scheduledDate} • {booking.scheduledTime}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {booking.location?.address}
                          </span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Estimated Amount</span>
                          <p className="text-lg font-black text-slate-900">${booking.totalAmount || 80}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {booking.status === 'pending' && (
                            <button
                              onClick={() => handleCancelBooking(booking._id)}
                              className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}

                          {booking.status === 'completed' && (
                            <button
                              onClick={() => {
                                setReviewTargetBooking(booking);
                                setReviewModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-50 text-primary hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Leave Review
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLAINTS & DISPUTES */}
      {activeTab === 'complaints' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* New Ticket Form */}
          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-borderSubtle shadow-xs h-fit">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">File a Dispute or Complaint</h3>
            <p className="text-xs text-slate-500 mb-5">
              Have an issue with a completed service or billing? Our mediation desk will resolve it promptly.
            </p>

            <form onSubmit={handleSubmitComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={complaintSubject}
                  onChange={(e) => setComplaintSubject(e.target.value)}
                  placeholder="e.g. Technician arrived late, billing issue"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Details & Description
                </label>
                <textarea
                  rows={4}
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  placeholder="Explain what went wrong in detail..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          </div>

          {/* Past Complaints List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Your Support Tickets</h3>
            {complaintsLoading ? (
              <p className="text-xs text-slate-500">Loading tickets...</p>
            ) : myComplaints.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-borderSubtle">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No active disputes</h4>
                <p className="text-xs text-slate-400 mt-1">All your service requests are in good standing.</p>
              </div>
            ) : (
              myComplaints.map((c) => (
                <div key={c._id} className="bg-white rounded-2xl p-5 border border-borderSubtle shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      {c.status}
                    </span>
                    <span className="text-[11px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{c.subject}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-3">{c.description}</p>
                  {c.adminResponse && (
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
                      <strong>Support Resolution:</strong> {c.adminResponse}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PROFILE & SECURITY */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-borderSubtle shadow-xs">
          <div className="flex items-center gap-4 pb-6 border-b border-borderSubtle mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-primary border border-blue-100">
                {user?.role}
              </span>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span>Update Account Password</span>
          </h4>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={passwordUpdating}
              className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {passwordUpdating ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingModalOpen && targetProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg bg-white rounded-3xl shadow-floating border border-borderSubtle p-6 sm:p-8 relative overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Direct Booking</span>
              <h2 className="text-xl font-extrabold text-slate-900">
                Book with {targetProvider.userId?.name || targetProvider.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {targetProvider.category} Specialist • ${targetProvider.hourlyRate}/hr fixed rate
              </p>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Service Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Time Slot
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Service Address
                </label>
                <input
                  type="text"
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  placeholder="Street, apartment or flat number"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Issue Description
                  </label>
                  <button
                    type="button"
                    onClick={handleAiRefine}
                    disabled={aiHelperLoading}
                    className="text-xs font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{aiHelperLoading ? 'Optimizing...' : 'AI Format'}</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your issue (e.g. Kitchen tap dripping under the sink valve)"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold cursor-pointer transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-borderSubtle bg-white text-slate-600'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Cash on Service</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-bold cursor-pointer transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-blue-50 text-primary'
                        : 'border-borderSubtle bg-white text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / UPI</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs space-y-1.5 mt-2">
                <div className="flex justify-between text-slate-600">
                  <span>Hourly Base Rate</span>
                  <span>${targetProvider.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Time</span>
                  <span>2 Hours</span>
                </div>
                <div className="flex justify-between font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Estimated Total</span>
                  <span className="text-primary">${(targetProvider.hourlyRate || 40) * 2}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingSubmitting}
                className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 mt-2"
              >
                {bookingSubmitting ? 'Submitting Request...' : 'Confirm Booking Request'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewModalOpen && reviewTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-floating border border-borderSubtle p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Rate Your Experience</h3>
            <p className="text-xs text-slate-500 mb-5">
              Your verified review helps maintain exceptional service quality standards.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div className="flex justify-center gap-2 my-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="p-1 cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= ratingScore ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Comments
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your experience..."
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {reviewSubmitting ? 'Posting Review...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
