"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center overflow-hidden">
        <div className="h-[420px] w-[800px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/10 blur-[100px] dark:from-indigo-600/25 dark:via-purple-600/20" />
      </div>

      {/* Hero Section */}
      <section className="mx-auto flex w-full max-w-7xl flex-col items-center px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24 lg:px-8">
        {/* Streak Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-xs transition hover:bg-indigo-100/80 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
          <span>Keep your competitive programming streak alive</span>
        </div>

        {/* Hero Title */}
        <h1 className="mt-8 max-w-4xl text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-6xl dark:text-white">
          Level up your consistency with{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            CPNudge
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300 sm:text-xl">
          Track your coding activity across Codeforces, LeetCode, and CodeChef. Receive timely
          nudges before inactivity breaks your momentum.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {loading ? (
            <div className="h-12 w-48 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />
          ) : isAuthenticated && user ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Logged in as{" "}
                <strong className="text-zinc-900 dark:text-white">{user.username}</strong>
              </span>
              <Link
                href="/#features"
                className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-indigo-500/35"
              >
                View Features &amp; Stats
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link
                href="/signup"
                className="flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-95 hover:shadow-xl hover:shadow-indigo-500/35 active:scale-95"
              >
                Get Started Free
              </Link>
              <Link
                href="/login"
                className="flex h-12 items-center justify-center rounded-xl border border-zinc-300 bg-white/80 px-7 font-semibold text-zinc-800 backdrop-blur-xs transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Log In
              </Link>
            </div>
          )}
        </div>

        {/* Platform Badges */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">
          <span>Supported Platforms:</span>
          <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            Codeforces
          </span>
          <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            LeetCode
          </span>
          <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            CodeChef
          </span>
          <span className="rounded-md border border-zinc-200 bg-white px-2.5 py-1 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            AtCoder
          </span>
        </div>
      </section>

      {/* Feature Cards */}
      <section id="features" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Designed for serious problem solvers
          </h2>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Everything you need to turn sporadic practice into an unbreakable daily discipline.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Card 1 */}
          <div className="rounded-2xl border border-zinc-200 bg-white/70 p-7 shadow-xs backdrop-blur-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-white">
              Aggregated Practice Stats
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Sync submissions from top algorithmic contest platforms automatically. No more
              manually tracking across different profiles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl border border-zinc-200 bg-white/70 p-7 shadow-xs backdrop-blur-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-white">
              Smart Inactivity Nudges
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Customizable reminders delivered before your streak lapses, nudging you back to solve
              problems when life gets busy.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl border border-zinc-200 bg-white/70 p-7 shadow-xs backdrop-blur-xs transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600 dark:bg-pink-950/60 dark:text-pink-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-white">
              Live Contest Calendar
            </h3>
            <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              Stay ahead of upcoming Div 1, 2, and 3 rounds and weekly LeetCode contests all in a
              unified schedule.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
