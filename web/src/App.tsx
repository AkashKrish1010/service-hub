import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { SmartAIChatDrawer } from './components/SmartAIChatDrawer';
import { LandingPage } from './pages/LandingPage';
import { CustomerPortal } from './pages/CustomerPortal';
import { ProviderPortal } from './pages/ProviderPortal';
import { AdminPortal } from './pages/AdminPortal';
import { useAuth } from './context/AuthContext';
import { Sparkles, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const { user } = useAuth();

  const [currentView, setCurrentView] = useState<string>('landing');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedProviderForBooking, setSelectedProviderForBooking] = useState<any>(null);

  // Modals & Drawers
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'customer' | 'provider' | 'admin'>('customer');
  const [isAIOpen, setIsAIOpen] = useState(false);

  const handleOpenAuth = (role: 'customer' | 'provider' | 'admin' = 'customer') => {
    setAuthRole(role);
    setIsAuthOpen(true);
  };

  const handleNavigate = (view: string) => {
    if (view === 'how_it_works') {
      if (currentView === 'landing') {
        const el = document.getElementById('how-it-works');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      setCurrentView('how_it_works');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Role protection hints
    if (view === 'provider_console' && (!user || user.role !== 'provider')) {
      handleOpenAuth('provider');
      return;
    }
    if (view === 'admin_console' && (!user || user.role !== 'admin')) {
      handleOpenAuth('admin');
      return;
    }

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentView('customer_services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProvider = (provider: any) => {
    setSelectedProviderForBooking(provider);
    setCurrentView('customer_services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookFromAI = (provider: any) => {
    setIsAIOpen(false);
    setSelectedProviderForBooking(provider);
    setCurrentView('customer_services');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-textMain font-sans antialiased selection:bg-blue-100 selection:text-primary">
      {/* Global Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
        onOpenAI={() => setIsAIOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onSelectCategory={handleSelectCategory}
            onSelectProvider={handleSelectProvider}
            onOpenAI={() => setIsAIOpen(true)}
            onOpenAuth={handleOpenAuth}
            onNavigate={handleNavigate}
          />
        )}

        {(currentView === 'customer_services' ||
          currentView === 'customer_bookings' ||
          currentView === 'customer_complaints' ||
          currentView === 'customer_profile') && (
          <CustomerPortal
            initialCategory={selectedCategory}
            selectedProviderForBooking={selectedProviderForBooking}
            onClearSelectedProvider={() => setSelectedProviderForBooking(null)}
            onOpenAI={() => setIsAIOpen(true)}
          />
        )}

        {currentView === 'provider_console' && <ProviderPortal />}

        {currentView === 'admin_console' && <AdminPortal />}

        {currentView === 'how_it_works' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-primary uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Simple 3-Step Process
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                How Service Hub Works
              </h1>
              <p className="text-base text-slate-600">
                From finding a licensed technician to completing the job with our 100% Satisfaction Guarantee.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative">
                <span className="text-5xl font-black text-blue-100 absolute top-4 right-4">01</span>
                <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-primary font-bold text-lg mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Choose Your Service</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Browse verified pros in plumbing, electrical, HVAC, cleaning, and carpentry. Use our Smart Assistant to pinpoint your exact repair requirements.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Transparent upfront hourly rates
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative">
                <span className="text-5xl font-black text-blue-100 absolute top-4 right-4">02</span>
                <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-accent font-bold text-lg mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Book & Confirm Fast</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Pick your preferred date and time slot. Our licensed local specialists receive instant dispatch alerts and confirm in real-time.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-accent">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Instant confirmation & tracking
                </div>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative">
                <span className="text-5xl font-black text-blue-100 absolute top-4 right-4">03</span>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-lg mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Job Done & Protected</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Your technician arrives equipped, executes precision work, and checks off quality standards. Payment is settled securely only upon your approval.
                </p>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Satisfaction Guarantee
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setCurrentView('customer_services')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Find a Verified Specialist Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Smart Assistant Shortcut Button (visible if not on landing or if drawer closed) */}
      <button
        onClick={() => setIsAIOpen(true)}
        aria-label="Open Smart Assistant"
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-primary to-blue-700 text-white p-3.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 flex items-center gap-2.5 group cursor-pointer border border-white/20"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <Sparkles className="w-5 h-5 text-amber-300" />
        <span className="hidden sm:inline text-xs font-bold tracking-wide pr-1">
          Smart Assistant
        </span>
      </button>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialRole={authRole}
      />

      {/* Smart Assistant Slide-In Drawer */}
      <SmartAIChatDrawer
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onBookProvider={handleBookFromAI}
      />
    </div>
  );
};

export default App;
