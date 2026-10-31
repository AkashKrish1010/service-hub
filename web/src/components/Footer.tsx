import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC<{
  onNavigate: (view: string) => void;
  onOpenAuth?: (role?: 'customer' | 'provider' | 'admin') => void;
}> = ({ onNavigate, onOpenAuth }) => {
  return (
    <footer className="bg-white border-t border-borderSubtle text-slate-600 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-borderSubtle">
          
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/logo.png"
                alt="Service Hub Logo"
                className="w-9 h-9 object-contain"
              />
              <span className="text-xl font-extrabold text-slate-900">Service Hub</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm">
              The on-demand home service marketplace connecting homeowners with verified, background-checked plumbers, electricians, cleaners, and carpenters with upfront pricing.
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span>24/7 Dispatch Hotline: +1 (800) 555-SERV</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>support@servicehub.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Serving all major metropolitan districts</span>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('customer_services')} className="hover:text-primary transition-colors cursor-pointer">
                  Plumbing Repairs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer_services')} className="hover:text-primary transition-colors cursor-pointer">
                  Electrical & Wiring
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer_services')} className="hover:text-primary transition-colors cursor-pointer">
                  Full Home Deep Cleaning
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer_services')} className="hover:text-primary transition-colors cursor-pointer">
                  Custom Carpentry
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer_services')} className="hover:text-primary transition-colors cursor-pointer">
                  Smart Appliance Repair
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer_services')} className="hover:text-primary transition-colors cursor-pointer">
                  Interior Painting
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('how_it_works')} className="hover:text-primary transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer_services')} className="hover:text-primary transition-colors cursor-pointer">
                  Find Verified Pros
                </button>
              </li>
              <li>
                <span className="text-slate-400">100% Satisfaction Guarantee</span>
              </li>
              <li>
                <span className="text-slate-400">Safety Standards</span>
              </li>
              <li>
                <span className="text-slate-400">Pricing Transparency</span>
              </li>
            </ul>
          </div>

          {/* For Professionals */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">For Providers</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400">Apply as a Partner</span>
              </li>
              <li>
                <span className="text-slate-400">Partner Guidelines</span>
              </li>
              <li>
                <span className="text-slate-400">Payout Schedules</span>
              </li>
              <li>
                <span className="text-slate-400">Insurance & Bonding</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Service Hub Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-600 transition-colors">Terms of Service</span>
            <span className="hover:text-slate-600 transition-colors">Trust & Safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
