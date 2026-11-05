import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  Sparkles,
  MapPin,
  Calendar,
  AlertCircle,
  AlertTriangle,
  ThumbsUp,
  Lightbulb,
  X,
  RefreshCw,
  Zap,
  Save,
  User,
  ShieldAlert,
  Award,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProviderPortal: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const isApproved = user?.isApproved !== false;
  const [activeTab, setActiveTab] = useState<'console' | 'profile'>('console');
  const [isOnline, setIsOnline] = useState(isApproved);
  const [stats, setStats] = useState<any>({
    totalEarnings: 0,
    activeBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    totalReviews: 0,
  });

  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [ongoingBookings, setOngoingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pro Insights
  const [aiCoach, setAiCoach] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Profile Edit State
  const [category, setCategory] = useState(user?.providerProfile?.category || 'Plumbing');
  const [hourlyRate, setHourlyRate] = useState(user?.providerProfile?.hourlyRate?.toString() || '40');
  const [bio, setBio] = useState(user?.providerProfile?.bio || 'Experienced certified technician delivering prompt, high-grade service.');
  const [experience, setExperience] = useState(user?.providerProfile?.experience || '5+ years');
  const [address, setAddress] = useState(user?.providerProfile?.location?.address || 'Metro Service District');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchAiCoach();
  }, []);

  useEffect(() => {
    if (user?.isApproved === false) {
      setIsOnline(false);
    }
  }, [user?.isApproved]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await refreshUser().catch(() => null);
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/provider/dashboard-stats').catch(() => null),
        api.get('/bookings/provider').catch(() => null),
      ]);

      if (statsRes?.data?.data) {
        setStats(statsRes.data.data);
      }

      if (bookingsRes?.data?.data) {
        const list = bookingsRes.data.data;
        setPendingBookings(list.filter((b: any) => b.status === 'pending'));
        setOngoingBookings(list.filter((b: any) => b.status === 'ongoing' || b.status === 'accepted'));
      }
    } catch (e) {
      console.warn('Could not load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiCoach = async () => {
    setAiLoading(true);
    try {
      const res = await api.get('/ai/provider-insights');
      if (res.data?.data) {
        setAiCoach(res.data.data);
      }
    } catch (e) {
      console.warn('Could not fetch coach insights', e);
    } finally {
      setAiLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status: newStatus });
      showToast(`Booking marked as ${newStatus.toUpperCase()}`, 'success');
      fetchDashboardData();
    } catch (e: any) {
      showToast('Failed to update booking status.', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/provider/profile', {
        category,
        hourlyRate: Number(hourlyRate),
        bio,
        experience,
        location: { address },
      });
      showToast('Provider profile updated successfully!', 'success');
      refreshUser();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[80vh]">
      {/* Pending Admin Approval Banner */}
      {user?.isApproved === false && (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-amber-900">Account Verification Pending</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-200/80 text-amber-900 border border-amber-300/60">
                  Waiting for Admin Approval
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1 max-w-2xl leading-relaxed">
                Waiting for admin to verify and approve. You cannot receive bookings or toggle online status until your profile credentials and trade category have been approved by our administrative team.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              refreshUser();
              fetchDashboardData();
              showToast('Refreshed account approval status.', 'info');
            }}
            className="px-4 py-2 rounded-xl bg-amber-200/70 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Check Approval Status</span>
          </button>
        </div>
      )}

      {/* Top Console Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borderSubtle mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Provider Console</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                user?.isApproved === false
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-blue-100 text-primary border-blue-200'
              }`}
            >
              {user?.isApproved === false ? 'Pending Approval' : 'Verified Partner'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong>{user?.name}</strong> • Dispatch status & job management
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 px-3 bg-white rounded-2xl border border-borderSubtle shadow-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                user?.isApproved === false ? 'bg-amber-400' : isOnline ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            ></span>
            <span className="text-xs font-bold text-slate-700">
              {user?.isApproved === false
                ? 'Approval Required'
                : isOnline
                ? 'Accepting Jobs'
                : 'Offline'}
            </span>
            <button
              onClick={() => {
                if (user?.isApproved === false) {
                  showToast('Waiting for admin to verify and approve before going online.', 'error');
                  return;
                }
                setIsOnline(!isOnline);
              }}
              disabled={user?.isApproved === false}
              title={user?.isApproved === false ? 'Requires admin approval' : 'Toggle online status'}
              className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                user?.isApproved === false
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  : isOnline
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              Toggle
            </button>
          </div>

          <div className="flex p-1 bg-slate-200/70 rounded-2xl">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'console' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Rates & Bio
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'console' ? (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Earnings</span>
              <p className="text-2xl font-black text-slate-900 mt-1">${stats.totalEarnings || 0}</p>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Verified Direct Payouts</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span>
              <p className="text-2xl font-black text-primary mt-1">{ongoingBookings.length || stats.activeBookings || 0}</p>
              <p className="text-xs text-slate-500 mt-2">In-progress service orders</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Jobs</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completedBookings || 0}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lifetime Total</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</span>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-black text-slate-900">
                  {stats.averageRating ? Number(stats.averageRating).toFixed(1) : '0.0'}
                </p>
                <div className="flex text-amber-400">
                  <Star
                    className={`w-5 h-5 ${
                      Number(stats.averageRating || 0) === 0
                        ? 'text-amber-400 stroke-1 fill-none'
                        : 'fill-amber-400 text-amber-400'
                    }`}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats.totalReviews && Number(stats.totalReviews) > 0
                  ? `from ${stats.totalReviews} reviews`
                  : 'New Provider (0 reviews)'}
              </p>
            </div>
          </div>

          {/* Smart Insights & Performance Coach Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderSubtle shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderSubtle mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-slate-900">Pro Insights</h3>
                    {aiCoach && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Award className="w-3 h-3 text-emerald-600" />
                        {aiCoach.sentimentPercentage != null ? `${aiCoach.sentimentPercentage}%` : '96%'} {aiCoach.sentiment || 'Positive'} Sentiment
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">Automated quality coaching & customer review sentiment analysis</p>
                </div>
              </div>
              <button
                onClick={fetchAiCoach}
                disabled={aiLoading}
                className="px-3.5 py-1.5 rounded-xl border border-borderSubtle text-xs font-bold text-slate-700 hover:text-primary flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Analyzing...' : 'Re-analyze'}</span>
              </button>
            </div>

            {aiLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Analyzing customer reviews and ratings...</p>
            ) : aiCoach ? (
              <div className="space-y-6">
                {/* Sentiment Meter Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-borderSubtle">
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-slate-600 uppercase tracking-wider text-[11px]">Customer Feedback Sentiment Index</span>
                    <span className="text-emerald-700 font-extrabold text-sm">
                      {aiCoach.sentimentPercentage != null ? `${aiCoach.sentimentPercentage}%` : '96%'} Positive
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(5, aiCoach.sentimentPercentage != null ? aiCoach.sentimentPercentage : 96))}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Derived from automated natural language processing (NLP) analysis of customer review comments and ratings.
                  </p>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed font-medium bg-canvas p-4 rounded-2xl border border-borderSubtle">
                  {aiCoach.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  {aiCoach.strengths && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase mb-3">
                        <ThumbsUp className="w-4 h-4 text-emerald-600" />
                        <span>Customer Praised Strengths</span>
                      </div>
                      <ul className="space-y-2 text-xs text-emerald-950">
                        {aiCoach.strengths.map((s: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {aiCoach.areasForImprovement && (
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase mb-3">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Areas to Optimize</span>
                      </div>
                      <ul className="space-y-2 text-xs text-amber-950">
                        {aiCoach.areasForImprovement.map((a: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Tap Re-analyze to generate tailored performance coaching tips.</p>
            )}
          </div>

          {/* Pending Booking Requests (Accept / Reject) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-slate-900">
                New Service Requests ({pendingBookings.length})
              </h3>
              <span className="text-xs text-slate-400">Respond promptly to preserve rating</span>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-borderSubtle">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">Queue is clear</h4>
                <p className="text-xs text-slate-400 mt-0.5">No pending customer requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingBookings.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white p-5 rounded-2xl border border-borderSubtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                          Pending Confirmation
                        </span>
                        <span className="text-xs text-slate-400">Customer: {b.customerId?.name || 'Customer'}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{b.description}</h4>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {b.scheduledDate} • {b.scheduledTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-primary" />
                          {b.location?.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        onClick={() => handleStatusUpdate(b._id, 'accepted')}
                        className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Accept Request
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(b._id, 'cancelled')}
                        className="px-4 py-2.5 rounded-xl border border-borderSubtle text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ongoing Bookings (Mark Complete) */}
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-4">
              Accepted & Ongoing Jobs ({ongoingBookings.length})
            </h3>

            {ongoingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-borderSubtle">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">No jobs currently in progress.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ongoingBookings.map((b) => (
                  <div
                    key={b._id}
                    className="bg-white p-5 rounded-2xl border border-borderSubtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-primary border border-blue-200">
                          {b.status}
                        </span>
                        <span className="text-xs text-slate-400">Order #{b._id?.slice(-6)}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{b.description}</h4>
                      <p className="text-xs text-slate-500">
                        {b.scheduledDate} • {b.scheduledTime} | {b.location?.address}
                      </p>
                    </div>

                    <button
                      onClick={() => handleStatusUpdate(b._id, 'completed')}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Mark as Completed</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TAB: PROVIDER PROFILE & RATES */
        <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-borderSubtle shadow-card">
          <h3 className="text-lg font-extrabold text-slate-900 mb-1">Provider Service Setup</h3>
          <p className="text-xs text-slate-500 mb-6">
            Configure your trade category, hourly rates, bio, and dispatch radius
          </p>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Trade Specialty / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderSubtle bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="Electrical">Electrical</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Appliances">Appliances</option>
                <option value="Painting">Painting</option>
                <option value="Gardening">Gardening</option>
                <option value="General Services">General Services</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hourly Rate ($ USD)
              </label>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                required
                min={15}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderSubtle bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Years of Experience
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. 5+ years"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderSubtle bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Professional Bio & Specializations
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderSubtle bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Service Area / Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Metro District or specific zip codes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderSubtle bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="py-3 px-6 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Settings'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
