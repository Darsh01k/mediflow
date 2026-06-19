"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, FileText } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="relative z-50">
      <div className="max-w-page mx-auto px-4 pt-4 flex items-center justify-center">
        <nav className="nav-capsule inline-flex items-center h-11 gap-0">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 text-carbon"
          >
            <span className="font-polysans text-[22px] font-normal leading-none tracking-[-0.02em] relative">
              StudyDraft
              <span className="absolute -right-3 -top-1 text-signal-orange text-[14px]">~</span>
            </span>
          </Link>

          <div className="h-4 w-px bg-chalk mx-1" />

          <Link href="/features" className="px-3 py-1.5 text-[14px] font-inter font-medium text-carbon hover:bg-fog rounded-[20px] transition-colors">
            Features
          </Link>

          <div className="relative group">
            <button className="flex items-center gap-1 px-3 py-1.5 text-[14px] font-inter font-medium text-carbon hover:bg-fog rounded-[20px] transition-colors">
              Services
              <ChevronDown className="h-3 w-3 text-slate" />
            </button>
          </div>

          <Link href="/pricing" className="px-3 py-1.5 text-[14px] font-inter font-medium text-carbon hover:bg-fog rounded-[20px] transition-colors">
            Pricing
          </Link>

          <div className="h-4 w-px bg-chalk mx-1" />

          {session ? (
            <>
              <Link href="/dashboard" className="px-3 py-1.5 text-[14px] font-inter font-medium text-carbon hover:bg-fog rounded-[20px] transition-colors">
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="px-3 py-1.5 text-[14px] font-inter font-medium text-carbon hover:bg-fog rounded-[20px] transition-colors"
              >
                Logout
              </button>
              <span className="px-2 text-[13px] font-inter text-slate">
                {session.user?.name || session.user?.email}
              </span>
            </>
          ) : (
            <>
              <Link href="/login" className="px-3 py-1.5 text-[14px] font-inter font-medium text-carbon hover:bg-fog rounded-[20px] transition-colors">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-[18px] py-[7px] text-[14px] font-inter font-medium text-paper bg-carbon hover:bg-carbon/90 rounded-[20px] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}

          <div className="h-4 w-px bg-chalk mx-1" />

          <Link href="#" className="px-3 py-1.5 text-[14px] font-inter font-medium text-carbon hover:bg-fog rounded-[20px] transition-colors">
            FR
          </Link>
        </nav>
      </div>
    </header>
  );
}
