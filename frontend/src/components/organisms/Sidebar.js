'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Award,
  DollarSign,
  Calendar,
  Users,
  Shield,
  Bell,
  User,
  CreditCard,
  LogOut,
  X,
  UserCheck,
} from 'lucide-react';

export default function Sidebar({ isOpen = false, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;

  // Role-based navigation items
  const navByRole = {
    ADMIN: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Expenses', href: '/expenses', icon: Receipt },
      { label: 'Income', href: '/income', icon: DollarSign },
      { label: 'Sponsors', href: '/sponsors', icon: Award },
      { label: 'Events', href: '/events', icon: Calendar },
      { label: 'Users & Approvals', href: '/users', icon: Users },
      { label: 'Audit Logs', href: '/audit-logs', icon: Shield },
    ],
    FACULTY_COORDINATOR: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Expenses', href: '/expenses', icon: Receipt },
      { label: 'Income', href: '/income', icon: DollarSign },
      { label: 'Sponsors', href: '/sponsors', icon: Award },
      { label: 'Events', href: '/events', icon: Calendar },
      { label: 'Users & Approvals', href: '/users', icon: Users },
      { label: 'Audit Logs', href: '/audit-logs', icon: Shield },
    ],
    TREASURER: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Expenses', href: '/expenses', icon: Receipt },
      { label: 'Income', href: '/income', icon: DollarSign },
      { label: 'Sponsors', href: '/sponsors', icon: Award },
      { label: 'Events', href: '/events', icon: Calendar },
      { label: 'Users & Approvals', href: '/users', icon: Users },
    ],
    FINANCER: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Payment Queue', href: '/payment-queue', icon: Clock },
      { label: 'Income', href: '/income', icon: DollarSign },
      { label: 'Sponsor Payments', href: '/sponsors?paymentStatus=PENDING', icon: Award },
    ],
    MEMBER: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'My Expenses', href: '/expenses', icon: Receipt },
      { label: 'Notifications', href: '/notifications', icon: Bell },
    ],
  };

  const navItems = navByRole[role] || navByRole.MEMBER;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 inset-y-0 left-0 z-50 w-64 h-screen max-h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header with Original Club Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400 shadow-md flex-shrink-0 bg-slate-950">
              <img
                src="/logo.jpg"
                alt="Data Science Club Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-white leading-tight">
                DSCLUB
              </h1>
              <p className="text-[10px] font-extrabold text-cyan-400 tracking-wider uppercase">
                EXPENSE TRACKER
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>


        {/* Navigation Links */}
        <nav className="flex-1 min-h-0 p-3 space-y-1 overflow-y-auto sidebar-scroll">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const itemBase = item.href.split('?')[0];
            const isActive =
              pathname === itemBase ||
              (itemBase !== '/dashboard' && pathname.startsWith(itemBase + '/'));

            return (
              <Link
                key={idx}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile & Logout at the bottom of the menu bar */}
        <div className="p-3 border-t border-slate-800 flex-shrink-0 space-y-1 bg-slate-900/90">
          <Link
            href="/profile"
            onClick={onClose}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === '/profile'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <User className={`w-4 h-4 ${pathname === '/profile' ? 'text-white' : 'text-slate-400'}`} />
            <span>Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              logout();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>Logout</span>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800/60 text-[10px] text-slate-500 text-center flex-shrink-0">
          DSCLUB EXPENSE TRACKER v1.0
        </div>
      </aside>
    </>
  );
}

