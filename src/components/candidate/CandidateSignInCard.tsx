import React from 'react';
import { LogIn } from 'lucide-react';

export interface CandidateSignInCardProps {
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  rememberMe: boolean;
  setRememberMe: (v: boolean) => void;
  onLoginSubmit: (e: React.FormEvent) => void;
  onRegister: () => void;
  className?: string;
}

/** Candidate sign-in form — same UI as the career portal landing login card. */
export const CandidateSignInCard: React.FC<CandidateSignInCardProps> = ({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  rememberMe,
  setRememberMe,
  onLoginSubmit,
  onRegister,
  className = '',
}) => (
  <div className={`portal-landing-login w-full max-w-md ${className}`}>
    <div className="flex items-center gap-2 mb-1">
      <div className="w-9 h-9 rounded-xl bg-[#e8eef6] text-[#001b48] flex items-center justify-center">
        <LogIn className="w-4 h-4" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900">Candidate sign in</h2>
        <p className="text-[11px] text-slate-500">Access your profile and applications</p>
      </div>
    </div>

    <form onSubmit={onLoginSubmit} className="space-y-3.5 mt-5">
      <div>
        <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
          Email / Username <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          placeholder="your.email@example.com"
          className="portal-landing-input"
          autoComplete="username"
          required
        />
      </div>
      <div>
        <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          placeholder="Enter password"
          className="portal-landing-input"
          autoComplete="current-password"
          required
        />
      </div>
      <div className="flex items-center justify-between text-[11px]">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded text-[#001b48]"
          />
          <span className="text-slate-600">Remember me</span>
        </label>
        <button
          type="button"
          className="text-[#001b48] font-semibold hover:underline cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            alert('Password reset link sent to your registered email.');
          }}
        >
          Forgot password?
        </button>
      </div>
      <button type="submit" className="portal-landing-login-btn cursor-pointer">
        <LogIn className="w-3.5 h-3.5" />
        Sign In to Portal
      </button>
      <p className="text-center text-[11px] text-slate-500 pt-1">
        New candidate?{' '}
        <button type="button" onClick={onRegister} className="text-[#001b48] font-bold hover:underline cursor-pointer">
          Register here
        </button>
      </p>
    </form>
  </div>
);
