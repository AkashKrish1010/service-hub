import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Lightbulb,
  TrendingUp,
  MessageSquare,
  Wrench,
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminPortal: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'providers' | 'categories' | 'complaints'>('overview');

  // KPI Dashboard data
  const [dashboardData, setDashboardData] = useState<any>({
    totalUsers: 142,
    totalProviders: 18,
    pendingProviders: 3,
    totalBookings: 84,
    openComplaints: 1,
  });

  // Smart Analytics
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Providers Queue
  const [providers, setProviders] = useState<any[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);

  // Categories
  const [categories, setCategories] = useState<any[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // Complaints
  const [complaints, setComplaints] = useState<any[]>([]);
  const [resolutionText, setResolutionText] = useState('');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardKPIs();
    fetchSmartAnalytics();
  }, []);

  useEffect(() => {
    if (activeTab === 'providers') fetchProviders();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'complaints') fetchComplaints();
  }, [activeTab]);

  const fetchDashboardKPIs = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data?.data) {
        setDashboardData(res.data.data);
      }
    } catch (e) {
      console.warn('Could not load admin KPIs', e);
    }
  };

  const fetchSmartAnalytics = async () => {
    setAiLoading(true);
    try {
      const res = await api.get('/ai/admin-revenue-insights');
      if (res.data?.data) {
        setAiInsights(res.data.data);
      }
    } catch (e) {
      console.warn('Could not load smart analytics', e);
    } finally {
      setAiLoading(false);
    }
  };

  const fetchProviders = async () => {
    setProvidersLoading(true);
    try {
      const res = await api.get('/admin/providers');
      setProviders(res.data?.data || []);
    } catch (e) {
      console.warn('Could not load provider queue', e);
    } finally {
      setProvidersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data?.data || []);
    } catch (e) {
      console.warn('Could not load categories', e);
    }
  };

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data?.data || []);
    } catch (e) {
      console.warn('Could not load complaints', e);
    }
  };

  const handleApproveProvider = async (id: string, isApproved: boolean) => {
    try {
      await api.put(`/admin/providers/${id}/approve`, { isApproved });
      showToast(isApproved ? 'Provider application approved!' : 'Provider application rejected.', 'success');
      fetchProviders();
      fetchDashboardKPIs();
    } catch (e) {
      showToast('Could not update provider approval status.', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAddingCat(true);
    try {
      await api.post('/categories', {
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        icon: 'wrench',
      });
      showToast('New service category added!', 'success');
      setNewCatName('');
      setNewCatDesc('');
      fetchCategories();
    } catch (e) {
      showToast('Failed to add category.', 'error');
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast('Category deleted.', 'info');
      fetchCategories();
    } catch (e) {
      showToast('Could not delete category.', 'error');
    }
  };

  const handleResolveComplaint = async (id: string) => {
    if (!resolutionText.trim()) {
      showToast('Please type a resolution note.', 'error');
      return;
    }
    try {
      await api.put(`/complaints/${id}`, {
        status: 'resolved',
        adminResponse: resolutionText,
      });
      showToast('Complaint resolved successfully!', 'success');
      setSelectedComplaintId(null);
      setResolutionText('');
      fetchComplaints();
    } catch (e) {
      showToast('Failed to resolve complaint.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 min-h-[80vh]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borderSubtle mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Admin Console</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
              Platform Governance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervise provider credentials, platform disputes, categories & system analytics
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & KPI
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'providers' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Approvals ({dashboardData.pendingProviders || 0})
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'categories' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'complaints' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Disputes
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-black text-slate-900">{dashboardData.totalUsers || 142}</p>
              <p className="text-xs text-slate-500 mt-1">Verified customers & providers</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Providers</span>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600">{dashboardData.totalProviders || 18}</p>
              <p className="text-xs text-slate-500 mt-1">Licensed technicians active</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bookings Volume</span>
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900">{dashboardData.totalBookings || 84}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">100% Guaranteed settlements</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-borderSubtle shadow-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Disputes</span>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600">{dashboardData.openComplaints || 0}</p>
              <p className="text-xs text-slate-500 mt-1">Customer mediation queue</p>
            </div>
          </div>

          {/* Smart Analytics Strategy Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-borderSubtle shadow-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-borderSubtle mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-primary flex items-center justify-center border border-blue-100 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Smart Analytics</h3>
                  <p className="text-xs text-slate-500">Automated platform revenue optimization & demand balancing</p>
                </div>
              </div>
              <button
                onClick={fetchSmartAnalytics}
                disabled={aiLoading}
                className="px-3.5 py-1.5 rounded-xl border border-borderSubtle text-xs font-bold text-slate-700 hover:text-primary flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${aiLoading ? 'animate-spin' : ''}`} />
                <span>{aiLoading ? 'Analyzing...' : 'Re-analyze'}</span>
              </button>
            </div>

            {aiLoading ? (
              <p className="text-xs text-slate-400 py-4 text-center">Generating growth strategies...</p>
            ) : aiInsights ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-canvas p-4 rounded-2xl border border-borderSubtle">
                  <p className="text-xs sm:text-sm text-slate-700 font-medium">{aiInsights.summary}</p>
                  {aiInsights.growthPotential && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap ml-4">
                      {aiInsights.growthPotential} Growth
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(aiInsights.strategies || []).map((st: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">{st.recommendation}</p>
                      <div className="bg-white p-2.5 rounded-xl border border-borderSubtle text-[11px] text-slate-700">
                        <strong>Action:</strong> {st.action}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Tap Re-analyze to generate revenue optimization recommendations.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PROVIDER APPROVALS */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 mb-2">Provider Credential Verification Queue</h3>
          {providersLoading ? (
            <p className="text-xs text-slate-400">Loading applications...</p>
          ) : providers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-borderSubtle">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">All provider applications have been processed.</p>
            </div>
          ) : (
            providers.map((p) => {
              const name = p.userId?.name || 'Applicant';
              const email = p.userId?.email;
              const isApproved = p.userId?.isApproved;
              return (
                <div
                  key={p._id}
                  className="bg-white p-5 rounded-2xl border border-borderSubtle shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900">{name}</h4>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          isApproved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{email} • Category: {p.category} • Rate: ${p.hourlyRate}/hr</p>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">{p.bio}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isApproved ? (
                      <button
                        onClick={() => handleApproveProvider(p._id, true)}
                        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        Approve & Verify
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveProvider(p._id, false)}
                        className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Revoke Approval
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-6 border border-borderSubtle shadow-card h-fit">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">Create Service Category</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new trade or utility specialty to the catalog</p>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Pest Control, Roofing"
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Short description of services..."
                  className="w-full px-3.5 py-2 rounded-xl border border-borderSubtle text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={addingCat}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{addingCat ? 'Adding...' : 'Add Category'}</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 mb-3">Live Service Categories ({categories.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((c) => (
                <div
                  key={c._id}
                  className="bg-white p-4 rounded-2xl border border-borderSubtle shadow-xs flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{c.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">{c.description || 'Verified services'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(c._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DISPUTES & COMPLAINTS */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 mb-2">Customer Disputes Queue</h3>
          {complaints.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-borderSubtle">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-400">All customer disputes have been mediated.</p>
            </div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="bg-white p-5 rounded-2xl border border-borderSubtle shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                      {c.status}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{c.subject}</span>
                  </div>
                  <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-600">{c.description}</p>

                {c.adminResponse ? (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-xs text-emerald-900">
                    <strong>Resolution Record:</strong> {c.adminResponse}
                  </div>
                ) : (
                  <div>
                    {selectedComplaintId === c._id ? (
                      <div className="space-y-2 mt-2">
                        <textarea
                          rows={2}
                          value={resolutionText}
                          onChange={(e) => setResolutionText(e.target.value)}
                          placeholder="Type mediation decision or resolution..."
                          className="w-full px-3 py-2 rounded-xl border border-borderSubtle text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveComplaint(c._id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
                          >
                            Save Resolution
                          </button>
                          <button
                            onClick={() => setSelectedComplaintId(null)}
                            className="px-3 py-1.5 rounded-lg border border-borderSubtle text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedComplaintId(c._id)}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-primary text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        Issue Resolution
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
