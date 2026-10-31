import React, { useState } from 'react';
import { Sparkles, User as UserIcon, LogOut, ChevronDown, Wrench, Calendar, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenAuth: (role?: 'customer' | 'provider' | 'admin') => void;
  onOpenAI: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth, onOpenAI }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-borderSubtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-2.5 group cursor-pointer text-left"
            >
              <img
                src="/logo.png"
                alt="Service Hub Logo"
                className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">Service Hub</span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-400 mt-1">Verified Marketplace</span>
              </div>
            </button>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button
                onClick={() => onNavigate('landing')}
                className={`transition-colors cursor-pointer ${
                  currentView === 'landing' ? 'text-primary font-semibold' : 'hover:text-primary'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('customer_services')}
                className={`transition-colors cursor-pointer ${
                  currentView === 'customer_services' ? 'text-primary font-semibold' : 'hover:text-primary'
                }`}
              >
                Find Services
              </button>
              <button
                onClick={() => onNavigate('how_it_works')}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={onOpenAI}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-primary border border-blue-100 hover:bg-blue-100 transition-colors text-xs font-semibold cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Smart Diagnostic</span>
              </button>
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full border border-borderSubtle bg-white hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary border border-blue-100 overflow-hidden">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-4 h-4 stroke-[2.2]" />
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-floating border border-borderSubtle p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-borderSubtle mb-1">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    </div>

                    {user.role === 'customer' && (
                      <>
                        <button
                          onClick={() => onNavigate('customer_services')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                        >
                          <Wrench className="w-3.5 h-3.5 text-primary" />
                          <span>Browse Services</span>
                        </button>
                        <button
                          onClick={() => onNavigate('customer_bookings')}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>My Bookings</span>
                        </button>
                      </>
                    )}

                    {user.role === 'provider' && (
                      <button
                        onClick={() => onNavigate('provider_console')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                        <span>Provider Console</span>
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => onNavigate('admin_console')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl text-left cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-primary" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <div className="border-t border-borderSubtle my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => onOpenAuth()}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('customer')}
                  className="px-4 py-2 text-sm font-semibold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-sm transition-all shadow-blue-500/20 cursor-pointer"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
