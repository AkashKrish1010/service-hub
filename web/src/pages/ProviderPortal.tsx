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
  ThumbsUp,
  Lightbulb,
  X,
  RefreshCw,
  Zap,
  Save,
  User,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProviderPortal: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'console' | 'profile'>('console');
  const [isOnline, setIsOnline] = useState(true);
  const [stats, setStats] = useState<any>({
    totalEarnings: 2840,
    activeBookings: 2,
    completedBookings: 18,
    averageRating: 4.8,
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/provider/stats').catch(() => null),
        api.get('/provider/bookings').catch(() => null),
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
      {/* Top Console Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borderSubtle mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Provider Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-primary border border-blue-200">
              Verified Partner
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong>{user?.name}</strong> • Dispatch status & job management
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 p-1.5 px-3 bg-white rounded-2xl border border-borderSubtle shadow-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            <span className="text-xs font-bold text-slate-700">{isOnline ? 'Accepting Jobs' : 'Offline'}</span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                isOnline ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600'
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
              <p className="text-2xl font-black text-emerald-600 mt-1">{stats.completedBookings || 18}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% On-Time Completion</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Rating</span>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-black text-slate-900">{stats.averageRating || 4.9}</p>
                <div className="flex text-amber-400">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Top 5% Service Provider</p>
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
                  <h3 className="text-base font-extrabold text-slate-900">Pro Insights</h3>
                  <p className="text-xs text-slate-500">Automated quality coaching & customer review analysis</p>
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
