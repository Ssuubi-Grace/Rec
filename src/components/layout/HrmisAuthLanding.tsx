import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  CircleCheck,
  FilePenLine,
  Handshake,
  LogIn,
  ScanSearch,
  Search,
  ShieldCheck,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PortalSessionUser } from './Header';
import { Requisition } from '../../types';

interface HrmisAuthLandingProps {
  onSignIn: (user: PortalSessionUser) => void;
  onSignInAsCandidate?: () => void;
  onViewAllVacancies?: () => void;
  onSignInToTrackApplication?: () => void;
  allVacanciesLabel?: string;
  featuredVacancies?: Requisition[];
  openVacancyCount?: number;
}

const HERO_SLIDES = [
  {
    src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    caption: 'Collaborative hiring teams',
  },
  {
    src: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80',
    caption: 'Structured interviews & scoring',
  },
  {
    src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    caption: 'Governance & approvals in one place',
  },
];

const FLOW_STEPS = [
  { label: 'Request', icon: FilePenLine, hint: 'Requisition' },
  { label: 'Approve', icon: CircleCheck, hint: 'Governance' },
  { label: 'Attract', icon: Briefcase, hint: 'Vacancy & apply' },
  { label: 'Evaluate', icon: ScanSearch, hint: 'Shortlist & interview' },
  { label: 'Hire', icon: Handshake, hint: 'Offer & onboard' },
];

const FEATURE_TILES = [
  { icon: Briefcase, title: 'Requisitions', desc: 'Raise and track staff requests with approvals.' },
  { icon: Users, title: 'Candidates', desc: 'Pipeline visibility from application to offer.' },
  { icon: ShieldCheck, title: 'Approvals', desc: 'Configurable governance and SLA alerts.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Reports, exports, and time-to-hire insights.' },
  { icon: Search, title: 'Vacancies', desc: 'Published roles synced to the career portal.' },
  { icon: CheckCircle2, title: 'Interviews', desc: 'Board scoring and selection matrix.' },
];

export const HrmisAuthLanding: React.FC<HrmisAuthLandingProps> = ({
  onSignIn,
  onSignInAsCandidate,
  onViewAllVacancies,
  onSignInToTrackApplication,
  allVacanciesLabel = 'Current Vacancies',
  featuredVacancies = [],
  openVacancyCount = 0,
}) => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [signInMode, setSignInMode] = useState<'hr' | 'candidate'>('hr');
  const [email, setEmail] = useState('grace.ssuubi@promise.ug');
  const [password, setPassword] = useState('');
  const [jobQuery, setJobQuery] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    document.title = 'HRMIS Recruitment · ProMISe';
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  const resolveName = (addr: string) => {
    if (addr.includes('grace')) return 'Grace Ssuubi';
    if (addr.includes('admin')) return 'System Administrator';
    const local = addr.split('@')[0]?.replace(/\./g, ' ');
    return local?.replace(/\b\w/g, (c) => c.toUpperCase()) || 'ProMISe User';
  };

  const submitSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (signInMode === 'candidate') {
      onSignInAsCandidate?.();
      onViewAllVacancies?.();
      setShowSignIn(false);
      return;
    }
    onSignIn({
      email: email.trim() || 'user@promise.ug',
      name: resolveName(email.trim().toLowerCase()),
    });
    setShowSignIn(false);
  };

  const formatClosing = (req: Requisition) => {
    if (!req.applicationDeadline) return 'Not specified';
    const normalized = req.applicationDeadline.replace(/-/g, ' ');
    const d = new Date(normalized);
    return Number.isNaN(d.getTime())
      ? req.applicationDeadline
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const jobs = featuredVacancies.filter((j) => {
    if (!jobQuery.trim()) return true;
    const q = jobQuery.toLowerCase();
    return j.position.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
  }).slice(0, 3);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="hrmis-landing">
      <nav className="hrmis-landing-nav">
        <div className="hrmis-landing-nav-inner">
          <div className="min-w-0">
            <p className="hrmis-landing-logo">ProMISe Recruit</p>
            <p className="hrmis-landing-nav-tagline">One workspace from requisition to onboarding</p>
          </div>
          <div className="hidden sm:flex hrmis-landing-nav-links">
            <button type="button" onClick={() => scrollTo('benefits')}>For HR teams</button>
            <button type="button" onClick={() => scrollTo('vacancies')}>Vacancies</button>
            <button type="button" onClick={() => scrollTo('process')}>How it works</button>
            <button type="button" onClick={() => scrollTo('candidate-journey')}>For applicants</button>
          </div>
          <button type="button" className="hrmis-landing-btn-nav cursor-pointer shrink-0" onClick={() => { setSignInMode('hr'); setShowSignIn(true); }}>
            Sign in
          </button>
        </div>
      </nav>

      <section className="hrmis-landing-hero">
        <div>
          <span className="hrmis-landing-eyebrow">ProMISe recruitment module</span>
          <h1 className="hrmis-landing-headline">
            Recruit smarter.
            <br />
            From requisition to onboarding.
          </h1>
          <p className="hrmis-landing-sub">
            One recruitment workspace for institutional HR teams — plus a public career portal for applicants.
          </p>
          <div className="hrmis-landing-journey-inner hrmis-landing-journey-hero">
            <div className="hrmis-landing-journey-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">For job seekers</p>
              <p className="text-xs text-slate-600 mt-1">Search → Apply → Track application</p>
              <div className="flex flex-col gap-2 mt-3">
                <button type="button" className="hrmis-landing-btn-primary cursor-pointer text-xs w-full sm:w-auto justify-center" onClick={() => onViewAllVacancies?.()}>
                  Explore vacancies
                </button>
                {onSignInToTrackApplication && (
                  <button
                    type="button"
                    className="hrmis-landing-btn-outline cursor-pointer text-xs w-full sm:w-auto justify-center"
                    onClick={() => onSignInToTrackApplication()}
                  >
                    Sign in to track application
                  </button>
                )}
              </div>
            </div>
            <div className="hrmis-landing-journey-card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#001b48]">For HR teams</p>
              <p className="text-xs text-slate-600 mt-1">Sign in → Requisition → Select → Hire</p>
              <button type="button" className="hrmis-landing-btn-outline mt-3 cursor-pointer text-xs w-full sm:w-auto justify-center" onClick={() => { setSignInMode('hr'); setShowSignIn(true); }}>
                HR staff sign in
              </button>
            </div>
          </div>
          <div className="hrmis-landing-stats">
            <div className="hrmis-landing-stat">
              <strong>Centralized</strong>
              <span>recruitment hub</span>
            </div>
            <div className="hrmis-landing-stat">
              <strong>Configurable</strong>
              <span>approvals & roles</span>
            </div>
            <div className="hrmis-landing-stat">
              <strong>Live</strong>
              <span>{openVacancyCount} open roles</span>
            </div>
          </div>
        </div>

        <div className="hrmis-landing-visual hrmis-landing-carousel">
          {HERO_SLIDES.map((slide, i) => (
            <img
              key={slide.src}
              src={slide.src}
              alt={slide.caption}
              className={`hrmis-landing-carousel-slide ${i === slideIndex ? 'is-active' : ''}`}
            />
          ))}
          <div className="hrmis-landing-carousel-controls">
            <button
              type="button"
              aria-label="Previous slide"
              className="hrmis-landing-carousel-btn cursor-pointer"
              onClick={() => setSlideIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  className={`hrmis-landing-carousel-dot ${i === slideIndex ? 'is-active' : ''}`}
                  onClick={() => setSlideIndex(i)}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next slide"
              className="hrmis-landing-carousel-btn cursor-pointer"
              onClick={() => setSlideIndex((i) => (i + 1) % HERO_SLIDES.length)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="hrmis-landing-visual-card">
            <p className="font-bold text-[#001b48] text-xs">{HERO_SLIDES[slideIndex].caption}</p>
            <p className="text-slate-500 mt-1">
              {openVacancyCount > 0 ? `${openVacancyCount} open roles` : 'Pipeline tracking'} · Approvals · Shortlists · Offers
            </p>
          </div>
        </div>
      </section>

      <section id="benefits" className="hrmis-landing-section">
        <h2 className="hrmis-landing-section-title">Hiring, in one view.</h2>
        <div className="hrmis-landing-features">
          {FEATURE_TILES.map(({ icon: Icon, title, desc }) => (
            <article key={title} className="hrmis-landing-feature-card">
              <div className="w-9 h-9 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#001b48]">{title}</h3>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="process" className="hrmis-landing-flow-panel">
        <div className="hrmis-landing-section text-center max-w-3xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-primary)] mb-2">A simple flow</p>
          <h2 className="hrmis-landing-section-title mb-10">From need to new hire.</h2>
          <div className="hrmis-landing-flow-timeline">
            {FLOW_STEPS.map(({ label, icon: Icon, hint }) => (
              <div key={label} className="hrmis-landing-flow-node" title={hint}>
                <div className="hrmis-landing-flow-circle">
                  <Icon className="w-6 h-6 text-[var(--color-primary)]" strokeWidth={1.75} />
                </div>
                <p className="text-sm font-bold text-[#001b48] mt-3">{label}</p>
                <p className="text-[10px] text-slate-500">{hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="vacancies" className="hrmis-landing-section">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--color-primary)] mb-2">Featured vacancies</p>
        <div className="hrmis-landing-jobs">
          <h2 className="hrmis-landing-section-title mb-0">Find your next role.</h2>
          <p className="text-sm text-slate-500 mt-1">Featured openings from the ProMISe career catalog.</p>
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={jobQuery}
                onChange={(e) => setJobQuery(e.target.value)}
                placeholder="Search role or department"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
              />
            </div>
            <button type="button" className="hrmis-landing-btn-primary justify-center cursor-pointer sm:px-8">
              Search
            </button>
          </div>
          <div className="hrmis-landing-job-grid">
            {(jobs.length > 0 ? jobs : featuredVacancies.slice(0, 3)).map((job) => (
              <article key={job.id} className="hrmis-landing-job-card">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-primary)]">
                  {job.department}
                </span>
                <h3 className="font-bold text-[#001b48] mt-2">{job.position}</h3>
                <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                  <li>📍 {job.region || 'Kampala, Uganda'}</li>
                  <li>💼 {job.type || 'Full-time'}</li>
                  <li>🏢 {job.department}</li>
                  <li>📅 Closes {formatClosing(job)}</li>
                </ul>
                <button
                  type="button"
                  className="mt-3 text-xs font-bold text-[var(--color-primary)] inline-flex items-center gap-1 cursor-pointer"
                  onClick={() => onViewAllVacancies?.()}
                >
                  View vacancy
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </article>
            ))}
            {featuredVacancies.length === 0 && (
              <p className="text-sm text-slate-500 col-span-full py-4">Sign in to browse the full vacancy register.</p>
            )}
          </div>
          {onViewAllVacancies && (
            <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-sm text-slate-600">
                Browse the full public register with filters, adverts, and online applications.
              </p>
              <button
                type="button"
                onClick={onViewAllVacancies}
                className="hrmis-landing-vacancies-link cursor-pointer inline-flex items-center justify-center gap-2"
              >
                View all vacancies
                <span className="hrmis-landing-vacancies-badge">{allVacanciesLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section id="candidate-journey" className="hrmis-landing-section pt-0">
        <div className="hrmis-landing-jobs">
          <h2 className="hrmis-landing-section-title">Your application journey</h2>
          <p className="text-sm text-slate-600">Find a role → Apply online → Receive confirmation → Track your application in the career portal.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {['Find a role', 'Apply online', 'Confirmation', 'Track status'].map((step, i) => (
              <div key={step} className="hrmis-landing-feature-card text-center">
                <div className="text-lg font-black text-[var(--color-primary)]">{i + 1}</div>
                <p className="text-xs font-bold text-slate-800 mt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="hrmis-landing-cta-band">
        <div className="hrmis-landing-cta-inner">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Recruitment that stays on track.</h2>
            <p className="text-sm text-white/85 mt-1 max-w-md">
              Reduce approval delays, publish vacancies automatically, and give hiring teams one place to decide.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="hrmis-landing-btn-primary cursor-pointer" onClick={() => setShowSignIn(true)}>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </button>
            <button type="button" className="hrmis-landing-btn-outline border-white/30 text-white bg-white/10 cursor-pointer">
              Talk to support
            </button>
          </div>
        </div>
      </div>

      <footer className="hrmis-landing-footer">
        <p className="font-bold text-slate-700 mb-1">ProMISe HRMIS · Recruitment</p>
        DataCare Uganda Limited · Enterprise Release v4.8.2
      </footer>

      {showSignIn && (
        <div className="hrmis-landing-signin-overlay" role="dialog" aria-modal="true" aria-labelledby="signin-title">
          <div className="hrmis-landing-signin-panel">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center">
                  <LogIn className="w-5 h-5" />
                </div>
                <div>
                  <h2 id="signin-title" className="text-sm font-bold text-slate-900">Sign in to ProMISe</h2>
                  <p className="text-[10px] text-slate-500">Choose how you are using the portal</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowSignIn(false)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <button type="button" className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${signInMode === 'hr' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'bg-slate-100 text-slate-600'}`} onClick={() => setSignInMode('hr')}>HR staff</button>
              <button type="button" className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${signInMode === 'candidate' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : 'bg-slate-100 text-slate-600'}`} onClick={() => setSignInMode('candidate')}>Job seeker</button>
            </div>
            <form onSubmit={submitSignIn} className="space-y-3">
              {signInMode === 'hr' ? (
                <>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-1 uppercase">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-[var(--color-primary)]/30 focus:outline-none"
                  placeholder="Demo: any password"
                />
              </div>
              <button type="submit" className="hrmis-landing-btn-primary w-full justify-center cursor-pointer">
                Continue to HR workspace
                <CheckCircle2 className="w-4 h-4" />
              </button>
                </>
              ) : (
                <p className="text-sm text-slate-600">Continue to the career portal to browse {allVacanciesLabel} and apply without an HR account.</p>
              )}
              {signInMode === 'candidate' && (
                <button type="submit" className="hrmis-landing-btn-primary w-full justify-center cursor-pointer">
                  Open career portal
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
