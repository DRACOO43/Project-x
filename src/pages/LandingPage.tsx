import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, switchDemo } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
              Project <span className="text-blue-600">X</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              MERN Stack
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-2"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 lg:px-12 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Production-Ready MERN Internship Project
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15] mb-6">
          Smart Platform for <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500">
            Project & Team Management
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Centralize your projects, organize tasks with Kanban workflows, track team progress with dynamic formulas, and monitor deadlines with rule-based recommendations.
        </p>

        {/* Quick Launch Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            to="/register"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-slate-400" />
            Explore Live Demo
          </Link>
        </div>

        {/* 1-Click Examiner Demo Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-3xl mx-auto text-left">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1-Click Demonstration Login (Evaluation Ready)
              </span>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              MongoDB Pre-Seeded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={async () => {
                await switchDemo('admin');
                window.location.href = '/dashboard';
              }}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                  Administrator
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-semibold">
                  Full RBAC
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                admin@smartpm.local
              </p>
            </button>

            <button
              onClick={async () => {
                await switchDemo('project_manager');
                window.location.href = '/dashboard';
              }}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                  Project Manager
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-semibold">
                  PM Lead
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                pm@smartpm.local
              </p>
            </button>

            <button
              onClick={async () => {
                await switchDemo('team_member');
                window.location.href = '/dashboard';
              }}
              className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-800 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600">
                  Team Member
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                  Developer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                member@smartpm.local
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Core Modules & Architectural Highlights
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Built strictly according to full-stack engineering standards with modular Express controllers, Mongoose schemas, and reactive UI states.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Automated Progress Calculation
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Dynamically derived completion percentage: (Completed Tasks / Total Tasks) × 100 with zero conflicting state redundancy.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Deadline Alerts & Health Status
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Detects overdue milestones and identifies at-risk projects due within 3 days using deterministic health state evaluations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Rule-Based Recommendations
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Deterministic priority ranking engine that flags critical overdue tasks and upcoming milestones without black-box models.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Server-Enforced RBAC
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Three-tier permission matrix (Admin, Project Manager, Team Member) verified at controller layers with JWT & Bcrypt password hashing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Calendar & Timeline Matrix
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Unified monthly schedule displaying project kickoff milestones, task deadlines, and overdue highlights.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 mb-4">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Reports & Safe CSV Exports
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Interactive Recharts analytics, team productivity statistics, and sanitized CSV exports preventing formula injection.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8 px-6 lg:px-12 text-center text-xs text-slate-400">
        <p>© 2026 Smart Platform for Project Management • Full-Stack MERN Architecture</p>
      </footer>
    </div>
  );
};
