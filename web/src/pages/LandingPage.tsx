import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Cpu,
  Paintbrush,
  Search,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  User,
  MapPin,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import GhostFibers from '../components/GhostFibers';

interface LandingPageProps {
  onSelectCategory: (cat: string) => void;
  onSelectProvider: (provider: any) => void;
  onOpenAI: () => void;
  onOpenAuth: (role?: 'customer' | 'provider' | 'admin') => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectCategory,
  onSelectProvider,
  onOpenAI,
  onOpenAuth,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredProviders, setFeaturedProviders] = useState<any[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // GSAP animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLDivElement>(null);
  const categoryGridRef = useRef<HTMLDivElement>(null);
  const providersSectionRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Entrance Animations
    const ctx = gsap.context(() => {
      gsap.from('.gsap-hero-text', {
        opacity: 0,
        y: 35,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
      });

      if (searchBoxRef.current) {
        gsap.from(searchBoxRef.current, {
          opacity: 0,
          y: 25,
          duration: 0.8,
          delay: 0.35,
          ease: 'power3.out',
        });
      }

      if (categoryGridRef.current) {
        gsap.from('.gsap-cat-card', {
          opacity: 0,
          scale: 0.94,
          y: 20,
          duration: 0.6,
          delay: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
        });
      }
    }, heroRef);

    // Fetch live providers from backend
    fetchTopProviders();

    return () => ctx.revert();
  }, []);

  const fetchTopProviders = async () => {
    try {
      const res = await api.get('/providers/nearby', {
        params: { lat: 13.0418, lng: 80.2337, radius: 50 },
      });
      if (res.data.data && res.data.data.length > 0) {
        setFeaturedProviders(res.data.data.slice(0, 3));
      }
    } catch (e) {
      console.warn('Could not load nearby providers from backend', e);
    } finally {
      setLoadingProviders(false);
    }
  };

  const categories = [
    {
      name: 'Plumbing',
      icon: Wrench,
      desc: 'Pipe leaks, faucet repairs, water heaters & drains',
      badge: 'High Demand',
      rate: '$40/hr',
    },
    {
      name: 'Electrical',
      icon: Zap,
      desc: 'Wiring, panel upgrades, lighting & breaker safety',
      badge: 'Certified Pros',
      rate: '$45/hr',
    },
    {
      name: 'Cleaning',
      icon: Sparkles,
      desc: 'Deep home cleaning, sanitation & carpet care',
      badge: 'Popular',
      rate: '$35/hr',
    },
    {
      name: 'Carpentry',
      icon: Hammer,
      desc: 'Furniture repair, door locks, custom cabinets',
      badge: 'Craftsmen',
      rate: '$55/hr',
    },
    {
      name: 'Appliances',
      icon: Cpu,
      desc: 'Refrigerators, washing machines, dryers & ovens',
      badge: 'Same Day',
      rate: '$48/hr',
    },
    {
      name: 'Painting',
      icon: Paintbrush,
      desc: 'Interior/exterior walls, touchups & trims',
      badge: 'Guaranteed',
      rate: '$42/hr',
    },
  ];

  return (
    <div ref={heroRef} className="overflow-hidden">
      {/* HERO SECTION WITH GHOST FIBERS LIGHT-THEMED BACKGROUND */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 min-h-[600px] flex items-center">
        {/* Ghost Fibers Background Canvas */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <GhostFibers
            lineColor="#1A6BFF"
            glowColor="#3B82F6"
            speed={0.25}
            scale={2.2}
            rotation={12}
            rotationSpeed={0.3}
            layers={6}
            waveAmplitude={0.022}
            waveFrequency={3.5}
            waveSpeed={0.18}
            layerSpeed={0.1}
            twist={0.16}
            twistFrequency={6}
            twistSpeed={1.4}
            lineFrequency={8}
            lineSpacing={2.5}
            lineSharpness={18}
            glowFalloff={8}
            glowIntensity={2.4}
            brightness={2.4}
            blueBoost={1.35}
            vignette={0.65}
            grain={0.03}
            dpr={1}
            lightMode={true}
            fps={60}
            paused={false}
          />
          {/* Subtle bottom edge blend to transition smoothly into the service categories */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-canvas to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-3xl mx-auto text-center">
            
            {/* Top Badge */}
            <div className="gsap-hero-text inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-primary text-xs font-bold mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Home Repair & Utility Network</span>
            </div>

            {/* Headline */}
            <h1 className="gsap-hero-text text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12] mb-6">
              Book Verified Local Home Pros in <span className="text-primary">60 Seconds</span>
            </h1>

            {/* Subhead */}
            <p className="gsap-hero-text text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              Connect directly with background-checked plumbers, electricians, deep cleaners, and technicians with transparent hourly rates and instant service booking.
            </p>

            {/* Interactive Search Bar Card */}
            <div
              ref={searchBoxRef}
              className="bg-white p-3 sm:p-4 rounded-3xl shadow-floating border border-borderSubtle max-w-2xl mx-auto text-left"
            >
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 w-full">
                  <Search className="w-5 h-5 text-primary shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="What service do you need? (e.g. Faucet leak, AC repair)"
                    className="w-full text-sm text-slate-900 placeholder-slate-400 focus:outline-none bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSelectCategory(searchTerm || 'All');
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => onSelectCategory(searchTerm || 'All')}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
                >
                  <span>Find Pros</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick tags */}
              <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-slate-400">Popular:</span>
                {['Plumbing', 'Electrical', 'Cleaning', 'Appliances'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onSelectCategory(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-primary transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Trust Counters */}
            <div className="gsap-hero-text mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto text-center">
              <div>
                <p className="text-2xl font-black text-slate-900">15,000+</p>
                <p className="text-xs text-slate-500 mt-0.5">Jobs Completed</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">4.9 / 5</p>
                <p className="text-xs text-slate-500 mt-0.5">Customer Rating</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-xs text-slate-500 mt-0.5">Background Checked</p>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">45 Min</p>
                <p className="text-xs text-slate-500 mt-0.5">Avg Response Time</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICE CATEGORIES GRID */}
      <section className="py-16 bg-white border-y border-borderSubtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">On-Demand Catalog</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Explore Services by Category</h2>
            </div>
            <button
              onClick={() => onSelectCategory('All')}
              className="mt-3 sm:mt-0 text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
            >
              <span>View All Categories</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div ref={categoryGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const IconComp = cat.icon;
              return (
                <div
                  key={idx}
                  onClick={() => onSelectCategory(cat.name)}
                  className="gsap-cat-card p-6 rounded-2xl bg-canvas hover:bg-white border border-borderSubtle hover:border-blue-200 card-hover cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors shadow-xs">
                        <IconComp className="w-6 h-6 stroke-[2]" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white border border-borderSubtle text-slate-600">
                        {cat.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5">{cat.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{cat.desc}</p>
                  </div>
                  <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">Starting from <strong className="text-primary font-bold">{cat.rate}</strong></span>
                    <span className="font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      Book Now <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SMART ASSISTANT SPOTLIGHT BANNER */}
      <section className="py-14 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-primary to-blue-700 text-white p-8 sm:p-12 shadow-floating relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Ghost Fibers inside Smart Assistant Spotlight */}
            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
              <GhostFibers
                lineColor="#93C5FD"
                glowColor="#60A5FA"
                speed={0.25}
                scale={1.8}
                layers={5}
                lineFrequency={7}
                glowIntensity={2.0}
                lightMode={false}
                fps={60}
              />
            </div>
            <div className="max-w-xl z-10 relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-4 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Diagnostic Assistant</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-3">
                Unsure What Repair You Need? Let Our Assistant Help.
              </h2>
              <p className="text-sm text-blue-100 leading-relaxed mb-6">
                Describe your issue in plain words (e.g. "faucet leaking under kitchen sink" or "circuit tripping") and our smart diagnostic assistant will recommend the right certified specialist with instant rates.
              </p>
              <button
                onClick={onOpenAI}
                className="px-6 py-3.5 rounded-2xl bg-white text-primary hover:bg-blue-50 text-sm font-extrabold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Try Diagnostic Assistant</span>
              </button>
            </div>

            <div className="w-full md:w-80 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-white z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div>
                  <p className="text-xs font-bold">Smart Diagnostic</p>
                  <p className="text-[10px] text-blue-200">Online & Ready</p>
                </div>
              </div>
              <p className="text-xs bg-black/10 rounded-xl p-3 border border-white/10 mb-2 leading-relaxed">
                "Water heater is making rumbling noise and leaking from valve..."
              </p>
              <p className="text-xs bg-white/20 rounded-xl p-3 text-blue-50 leading-relaxed font-medium">
                Recommendation: Master Plumber required for pressure relief inspection. Matched Kumar Plumbing ($40/hr).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION WITH GHOST FIBERS ACCENT */}
      <section ref={howItWorksRef} className="relative py-20 bg-white border-b border-borderSubtle overflow-hidden">
        {/* Luminous Light Themed Ghost Fibers Field */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <GhostFibers
            lineColor="#1A6BFF"
            glowColor="#93C5FD"
            speed={0.18}
            scale={2.4}
            rotation={35}
            rotationSpeed={0.2}
            layers={5}
            waveAmplitude={0.018}
            twist={0.14}
            lineFrequency={7}
            lineSpacing={2.2}
            glowIntensity={2.0}
            lightMode={true}
            fps={60}
            paused={false}
          />
          <div className="absolute inset-0 bg-white/75 pointer-events-none" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Simple 3-Step Process</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How Service Hub Works</h2>
            <p className="text-sm text-slate-500 mt-2">
              From inquiry to verified completion, we ensure transparency and quality every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="bg-canvas rounded-2xl p-8 border border-borderSubtle relative">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg mb-6 shadow-sm shadow-blue-500/20">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Select Service & Schedule</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose the service category you need, select preferred appointment date and time, and input your address.
              </p>
            </div>

            <div className="bg-canvas rounded-2xl p-8 border border-borderSubtle relative">
              <div className="w-12 h-12 rounded-xl bg-accent text-white flex items-center justify-center font-black text-lg mb-6 shadow-sm shadow-orange-500/20">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Match with Verified Pro</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our platform alerts nearby certified technicians who accept your job request with clear upfront pricing.
              </p>
            </div>

            <div className="bg-canvas rounded-2xl p-8 border border-borderSubtle relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg mb-6 shadow-sm shadow-green-500/20">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Job Done & Guaranteed</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The technician finishes the repair. You inspect the work, approve payment, and leave a verified review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED VERIFIED TECHNICIANS */}
      <section ref={providersSectionRef} className="py-20 bg-canvas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Top Rated Experts</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Featured Verified Professionals</h2>
            </div>
            <button
              onClick={() => onSelectCategory('All')}
              className="mt-3 sm:mt-0 text-sm font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
            >
              <span>Explore All Providers</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProviders.map((p, idx) => {
              const name = p.userId?.name || 'Verified Professional';
              const img = p.userId?.profileImage;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-borderSubtle card-hover flex flex-col justify-between shadow-card"
                >
                  <div>
                    <div className="flex items-center gap-3.5 mb-4">
                      <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary overflow-hidden shrink-0">
                        {img ? (
                          <img src={img} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 stroke-[2]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-bold text-slate-900 truncate">{name}</h4>
                          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                        </div>
                        <p className="text-xs text-slate-500">{p.category} Specialist</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{p.averageRating || 4.9}</span>
                          </div>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs text-slate-500">{p.totalReviews || 94} reviews</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {p.bio || 'Experienced technician providing certified repair and installation services.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-borderSubtle flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">Hourly Rate</span>
                      <p className="text-base font-extrabold text-slate-900">${p.hourlyRate}/hr</p>
                    </div>
                    <button
                      onClick={() => onSelectProvider(p)}
                      className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* BECOME A PARTNER CTA BANNER WITH GHOST FIBERS */}
      <section className="py-16 bg-white border-t border-borderSubtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 border border-blue-200/90 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/50 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Luminous Light Themed Ghost Fibers inside banner */}
            <div className="absolute inset-0 w-full h-full pointer-events-none">
              <GhostFibers
                lineColor="#1A6BFF"
                glowColor="#3B82F6"
                speed={0.25}
                scale={2.0}
                layers={5}
                twist={0.16}
                lineFrequency={7}
                glowIntensity={2.2}
                lightMode={true}
                fps={60}
              />
              <div className="absolute inset-0 bg-white/70 pointer-events-none" />
            </div>

            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/90 text-primary text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Join Service Hub Network
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 mb-3">
                Are You a Licensed Technician or Contractor?
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Connect with thousands of nearby customers looking for plumbing, electrical, carpentry, and home maintenance work. Receive direct booking requests, manage your schedule, and get paid securely.
              </p>
            </div>
            <button
              onClick={() => onOpenAuth('provider')}
              className="relative z-10 px-8 py-4 rounded-2xl bg-primary hover:bg-blue-600 text-white text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shrink-0"
            >
              <span>Join as a Verified Pro</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
