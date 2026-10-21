'use client';

import React, { useState, useEffect } from 'react';
import API from '../../../services/api';
import Button from '../../../components/atoms/Button';
import { Bell, CheckCircle2, Trash2, X, Check } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('UNREAD'); // 'UNREAD' or 'ALL'

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = filter === 'UNREAD' ? '/notifications?unreadOnly=true' : '/notifications';
      const res = await API.get(url);
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.patch('/notifications/read-all');
      if (filter === 'UNREAD') {
        setNotifications([]);
      } else {
        fetchNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear and delete all notifications?')) return;
    try {
      await API.delete('/notifications/clear-all');
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReadAndDisappear = async (id) => {
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      await API.patch(`/notifications/${id}/read`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSingle = async (e, id) => {
    e.stopPropagation();
    try {
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      await API.delete(`/notifications/${id}`).catch(() =>
        API.patch(`/notifications/${id}/read`)
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            In-App Notifications
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Notifications disappear once read. Click any message to mark read and remove it.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            Mark All Read & Clear
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClearAll}
            className="bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear All
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === 'UNREAD'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread Active Messages
        </button>
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
            filter === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All History
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">All Caught Up!</p>
            <p className="text-slate-400">All notifications have been read and cleared.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => handleReadAndDisappear(n._id)}
              className="p-4 flex items-start gap-3 transition-colors cursor-pointer bg-white hover:bg-slate-50/80 group"
              title="Click to mark read & dismiss"
            >
              <div
                className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${
                  n.isRead ? 'bg-slate-100 text-slate-400' : 'bg-blue-100 text-blue-600'
                }`}
              >
                <Bell className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                    {new Date(n.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
                  {n.message}
                </p>
                <p className="text-[10px] font-semibold text-blue-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Tap message to dismiss & clear
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => handleDeleteSingle(e, n._id)}
                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                title="Delete Notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
