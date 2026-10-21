'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { Bell, Menu, X, CheckCheck, Clock, ArrowRight, Check } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifDropdownRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      // Fetch unread notifications so only active/unread appear
      const res = await API.get('/notifications?unreadOnly=true');
      if (res.data.success) {
        setUnreadCount(res.data.data.unreadCount || 0);
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      fetchNotifications();
    }
  };

  // Mark all as read: clears all from list so they disappear!
  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Read single notification: disappears immediately from the list!
  const handleMarkSingleRead = async (id) => {
    try {
      // Optimistic UI update: remove immediately so it disappears
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await API.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      fetchNotifications();
    }
  };

  // Dismiss / delete notification
  const handleDismissNotification = async (e, id) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await API.delete(`/notifications/${id}`).catch(() =>
        API.patch(`/notifications/${id}/read`)
      );
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  return (
    <header className="w-full max-w-full min-h-20 sm:min-h-24 md:min-h-28 py-3 sm:py-4 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs overflow-x-hidden">
      {/* Left: Mobile Menu Toggle */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Center: College Header Details - Expanded & Prominent */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-5 mx-1 sm:mx-4 text-center flex-1 min-w-0">
        <img
          src="/panimalar_logo.png"
          alt="Panimalar Engineering College Emblem"
          className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain flex-shrink-0 drop-shadow-md transition-transform hover:scale-105 duration-200"
        />
        <div className="flex flex-col items-center justify-center min-w-0">
          <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-black tracking-wide sm:tracking-wider text-slate-900 uppercase leading-tight drop-shadow-2xs">
            PANIMALAR ENGINEERING COLLEGE
          </h1>
          <p className="text-[11px] sm:text-xs md:text-sm lg:text-base font-extrabold text-blue-900 tracking-wider uppercase mt-1">
            JAI SAKTHI EDUCATIONAL TRUST
          </p>
          <div className="mt-1 sm:mt-1.5">
            <span className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-white text-[8px] sm:text-[10px] md:text-xs font-black px-3 sm:px-4 py-0.5 sm:py-1 rounded-full shadow-xs tracking-widest uppercase inline-block border border-red-900/30">
              AN AUTONOMOUS INSTITUTION
            </span>
          </div>
        </div>
      </div>

      {/* Right: Notifications */}
      <div className="relative flex items-center gap-2 sm:gap-3 flex-shrink-0" ref={notifDropdownRef}>
        <button
          type="button"
          onClick={handleToggleNotifications}
          className={`relative p-2.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer ${
            showNotifications ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500/20' : ''
          }`}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* NOTIFICATION MESSAGES POPUP DROPDOWN */}
        {showNotifications && (
          <>
            {/* Backdrop on small screens */}
            <div
              className="fixed inset-0 z-40 bg-slate-900/20 sm:hidden"
              onClick={() => setShowNotifications(false)}
            />

            <div className="fixed top-16 left-3 right-3 sm:left-auto sm:right-0 sm:absolute sm:top-12 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col max-h-[82vh] sm:max-h-[500px]">
              {/* Header */}
              <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 leading-tight">Notifications</h3>
                    <p className="text-[10px] text-slate-500">
                      {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                      title="Clear all (mark read and remove)"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Clear all</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {loadingNotifs && notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading messages...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-800">No unread notifications</p>
                    <p className="text-[11px] text-slate-400">All messages have been read and cleared!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleMarkSingleRead(n._id)}
                      className="p-3.5 transition-colors cursor-pointer flex items-start gap-3 bg-blue-50/40 hover:bg-blue-50/80 group"
                      title="Click to mark as read and remove"
                    >
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-blue-600 ring-2 ring-blue-200" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 flex items-center gap-0.5 flex-shrink-0">
                            <Clock className="w-2.5 h-2.5 text-slate-400" />
                            {new Date(n.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
                          {n.message}
                        </p>
                        <p className="text-[10px] font-semibold text-blue-600 mt-1.5 opacity-80 group-hover:opacity-100 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Tap to mark read & dismiss
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDismissNotification(e, n._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
                <Link
                  href="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto text-xs py-1"
                >
                  <span>View All Notifications History</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
