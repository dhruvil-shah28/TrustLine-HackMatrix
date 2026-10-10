'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, Trash2, ArrowRight, ShieldAlert, Briefcase, FlaskConical, FileText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearNotification,
  } = useAuth();
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const filtered = notifications.filter((n) => (filter === 'UNREAD' ? !n.read : true));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="heading-page flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-400" />
            Notification Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time compliance alerts, case file assignments, and AI insight updates.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                filter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1 rounded-md text-xs font-semibold ${
                filter === 'UNREAD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Unread ({notifications.filter((n) => !n.read).length})
            </button>
          </div>

          <button onClick={markAllNotificationsAsRead} className="btn btn-secondary">
            Mark All Read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 ui-card">No notifications in this view.</div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              className={`ui-card p-4 flex items-start justify-between gap-4 transition-colors ${
                n.read ? 'bg-slate-950/40 border-slate-900 text-slate-400' : 'bg-slate-900/90 border-slate-700 text-slate-100 font-medium'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-indigo-400">{n.title}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {n.type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono technical-metadata">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-300">{n.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={n.link}
                  onClick={() => markNotificationAsRead(n.id)}
                  className="btn btn-primary !py-1 !px-2.5 !text-[11px]"
                >
                  View Entity <ArrowRight className="h-3 w-3" />
                </Link>

                <button
                  onClick={() => clearNotification(n.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30"
                  title="Dismiss Notification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
