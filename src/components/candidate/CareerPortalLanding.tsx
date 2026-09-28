import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Building2,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Requisition } from '../../types';
import { CandidateSignInCard } from './CandidateSignInCard';

interface CareerPortalLandingProps {
  featuredJobs: Requisition[];
  vacancyCount: number;
  onViewJobs: () => void;
  onRegister: () => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  onLoginSubmit: (e: React.FormEvent) => void;
}

export const CareerPortalLanding: React.FC<CareerPortalLandingProps> = ({
  featuredJobs,
  vacancyCount,
  onViewJobs,
  onRegister,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  rememberMe,
  setRememberMe,
  onLoginSubmit,
}) => {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [vacancyDisplay, setVacancyDisplay] = useState(0);

  useEffect(() => {
    if (vacancyCount <= 0) return undefined;
    let frame = 0;
    const start = performance.now();
    const duration = 1000;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setVacancyDisplay(Math.round(vacancyCount * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [vacancyCount]);

  return (
    <div className="portal-landing animate-in fade-in duration-500">
      <section
        className="portal-landing-hero relative overflow-hidden rounded-2xl border border-slate-200 shadow-xl"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setMouse({
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height,
          });
        }}
      >
        <div
          className="portal-landing-orb portal-landing-orb-a"
          style={{ transform: `translate(${(mouse.x - 0.5) * 20}px, ${(mouse.y - 0.5) * 14}px)` }}
        />
        <div
          className="portal-landing-orb portal-landing-orb-b"
          style={{ transform: `translate(${(0.5 - mouse.x) * 16}px, ${(0.5 - mouse.y) * 12}px)` }}
        />
        <div className="portal-landing-grid" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 sm:p-10 lg:p-12 items-center">
          {/* Brand & CTA */}
          <div className="space-y-6 text-white">
            <span className="portal-landing-pill inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              ProMISe HRMIS · Recruitment Portal
            </span>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
                Your gateway to institutional careers
              </h1>
              <p className="text-sm sm:text-base text-sky-100/90 max-w-lg leading-relaxed">
                Sign in to apply for vacancies, complete assessments, and track every stage of your
                recruitment journey — from application to onboarding.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={onViewJobs} className="portal-landing-cta group cursor-pointer">
                <Briefcase className="w-4 h-4" />
                View Job Opportunities
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button type="button" onClick={onRegister} className="portal-landing-cta-secondary cursor-pointer">
                <UserPlus className="w-4 h-4" />
                Create Account
              </button>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div>
                <p className="text-2xl font-black">{vacancyDisplay}</p>
                <p className="text-[10px] uppercase tracking-wider text-sky-200/80 font-semibold">Live vacancies</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div>
                <p className="text-2xl font-black">24/7</p>
                <p className="text-[10px] uppercase tracking-wider text-sky-200/80 font-semibold">Online access</p>
              </div>
            </div>
          </div>

          <CandidateSignInCard
            className="mx-auto lg:ml-auto"
            loginEmail={loginEmail}
            setLoginEmail={setLoginEmail}
            loginPassword={loginPassword}
            setLoginPassword={setLoginPassword}
            rememberMe={rememberMe}
            setRememberMe={setRememberMe}
            onLoginSubmit={onLoginSubmit}
            onRegister={onRegister}
          />
        </div>
      </section>

      {featuredJobs.length > 0 && (
        <section className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#001b48]" />
              Featured openings
            </h3>
            <button
              type="button"
              onClick={onViewJobs}
              className="text-[11px] font-bold text-[#001b48] flex items-center gap-1 hover:gap-2 transition-all cursor-pointer"
            >
              See all roles
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {featuredJobs.slice(0, 3).map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={onViewJobs}
                className="portal-landing-job-card text-left cursor-pointer"
              >
                <span className="portal-landing-job-badge">{job.reqNo}</span>
                <p className="font-bold text-slate-900 text-xs mt-2 mb-0.5">{job.position}</p>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {job.department}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
