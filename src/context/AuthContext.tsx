'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '@/lib/types';

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  department: string;
  title: string;
  avatar: string;
  lastActive: string;
  timezone: string;
  jobTitle: string;
  location: string;
  shortBio: string;
  accountCreated: string;
  dateFormat: string;
  defaultDashboard: string;
  alertFilter: string;
  theme: 'dark' | 'light' | 'system';
  density: 'comfortable' | 'compact';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'ALERT' | 'CASE' | 'LAB' | 'SYSTEM' | 'EVIDENCE';
  link: string;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  timestamp: string;
}

interface AuthContextType {
  user: UserProfile;
  isLoggedIn: boolean;
  isAuthReady: boolean;
  switchRole: (newRole: UserRole) => void;
  updateUser: (updated: Partial<UserProfile>) => void;
  login: (email: string) => void;
  logout: () => void;
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearNotification: (id: string) => void;
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, targetType: string, targetId: string, details: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const defaultUser: UserProfile = {
  name: 'Rahul Sharma',
  email: 'rahul.sharma@trustline.in',
  role: 'INVESTIGATOR',
  department: 'Financial Crime & AML Investigations',
  title: 'Lead AML Investigator',
  avatar: 'RS',
  lastActive: 'Just now',
  timezone: 'UTC+05:30 (Asia/Kolkata)',
  jobTitle: 'Lead AML Investigator & Financial Cyber Threat Specialist',
  location: 'Mumbai Enterprise HQ (Floor 12)',
  shortBio: 'Specializing in insider risk correlation, circular wire detection, and high-value AML investigations.',
  accountCreated: 'January 14, 2024',
  dateFormat: 'DD/MM/YYYY HH:mm:ss',
  defaultDashboard: 'Executive Risk Overview',
  alertFilter: 'CRITICAL',
  theme: 'dark',
  density: 'comfortable',
};

const defaultNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Critical Alert Detected: ALT-8891',
    description: 'Circular transfer loop identified involving EMP-1001 Vikram Malhotra.',
    timestamp: '5 mins ago',
    read: false,
    type: 'ALERT',
    link: '/alerts/alt-8891',
  },
  {
    id: 'notif-2',
    title: 'New Case File Assigned',
    description: 'CASE-2026-001 has been assigned to your investigation queue.',
    timestamp: '25 mins ago',
    read: false,
    type: 'CASE',
    link: '/cases/case-2026-001',
  },
  {
    id: 'notif-3',
    title: 'Detection Lab Suite Completed',
    description: '11 synthetic scenarios evaluated with 100% precision score.',
    timestamp: '1 hour ago',
    read: true,
    type: 'LAB',
    link: '/lab',
  },
  {
    id: 'notif-4',
    title: 'Evidence Item Attached',
    description: 'Workstation IP audit trail added to CASE-2026-001.',
    timestamp: '2 hours ago',
    read: true,
    type: 'EVIDENCE',
    link: '/cases/case-2026-001',
  },
];

const defaultAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    actorName: 'Rajesh Sharma',
    action: 'LOGIN_SESSION_INITIATED',
    targetType: 'SYSTEM',
    targetId: 'SENTINEL-WORKSPACE',
    details: 'User authenticated via SSO from IP 192.168.1.104',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'log-2',
    actorName: 'Rajesh Sharma',
    action: 'ALERT_VIEWED',
    targetType: 'ALERT',
    targetId: 'ALT-8891',
    details: 'Inspected explainable evidence panel for circular routing anomaly',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
];

const fallbackContext: AuthContextType = {
  user: defaultUser,
  isLoggedIn: false,
  isAuthReady: false,
  switchRole: () => {},
  updateUser: () => {},
  login: () => {},
  logout: () => {},
  notifications: defaultNotifications,
  markNotificationAsRead: () => {},
  markAllNotificationsAsRead: () => {},
  clearNotification: () => {},
  auditLogs: defaultAuditLogs,
  addAuditLog: () => {},
  toastMessage: null,
  showToast: () => {},
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(defaultAuditLogs);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('sentineliq_user');
      const savedNotifs = localStorage.getItem('sentineliq_notifications');
      const savedLogs = localStorage.getItem('sentineliq_audit_logs');
      const savedAuth = localStorage.getItem('sentineliq_auth');

      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
      if (savedAuth !== null) setIsLoggedIn(JSON.parse(savedAuth));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    } finally { setIsAuthReady(true); }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addAuditLog = (action: string, targetType: string, targetId: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: `log-${Date.now()}`,
      actorName: user.name,
      action,
      targetType,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...auditLogs];
    setAuditLogs(updated);
    try {
      localStorage.setItem('sentineliq_audit_logs', JSON.stringify(updated));
    } catch (e) {}
  };

  const switchRole = (newRole: UserRole) => {
    const roleTitles: Record<UserRole, { title: string; dept: string }> = {
      INVESTIGATOR: { title: 'Lead AML Investigator', dept: 'Financial Crime & AML Investigations' },
      COMPLIANCE: { title: 'Compliance Lead Manager', dept: 'Regulatory Compliance & Legal' },
      RISK_ANALYST: { title: 'Senior Financial Risk Analyst', dept: 'Risk & Graph Analytics' },
      ADMIN: { title: 'Platform Security Administrator', dept: 'IT Infrastructure & Access Control' },
    };

    const updated = {
      ...user,
      role: newRole,
      title: roleTitles[newRole].title,
      department: roleTitles[newRole].dept,
    };
    setUser(updated);
    try {
      localStorage.setItem('sentineliq_user', JSON.stringify(updated));
    } catch (e) {}

    addAuditLog('ROLE_SWITCHED', 'USER_CONTEXT', newRole, `Switch active context to ${newRole}`);
    showToast(`Role switched to ${newRole.replace('_', ' ')} context.`);
  };

  const updateUser = (updatedFields: Partial<UserProfile>) => {
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    try {
      localStorage.setItem('sentineliq_user', JSON.stringify(updated));
    } catch (e) {}

    addAuditLog('PROFILE_UPDATED', 'USER_PROFILE', user.email, 'Updated profile and preferences');
    showToast('User profile & settings saved successfully.');
  };

  const login = (email: string) => {
    setIsLoggedIn(true);
    const targetEmail = email || 'rahul.sharma@trustline.in';
    const updated = { ...user, email: targetEmail, lastActive: 'Just now' };
    setUser(updated);
    try {
      localStorage.setItem('sentineliq_user', JSON.stringify(updated));
      localStorage.setItem('sentineliq_auth', 'true');
    } catch (e) {}

    addAuditLog('LOGIN_SESSION_INITIATED', 'SYSTEM', 'SENTINEL-WORKSPACE', `User ${targetEmail} authenticated`);
    showToast('Signed in to TRUSTLINE Workspace.');
  };

  const logout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('sentineliq_auth', 'false');
    } catch (e) {}

    addAuditLog('LOGOUT_SESSION_TERMINATED', 'SYSTEM', 'SENTINEL-WORKSPACE', 'User signed out');
    showToast('Signed out of TRUSTLINE Workspace.');
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    try {
      localStorage.setItem('sentineliq_notifications', JSON.stringify(updated));
    } catch (e) {}
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      localStorage.setItem('sentineliq_notifications', JSON.stringify(updated));
    } catch (e) {}
    showToast('All notifications marked as read.');
  };

  const clearNotification = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id);
    setNotifications(updated);
    try {
      localStorage.setItem('sentineliq_notifications', JSON.stringify(updated));
    } catch (e) {}
    showToast('Notification cleared.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAuthReady,
        switchRole,
        updateUser,
        login,
        logout,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotification,
        auditLogs,
        addAuditLog,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
          {toastMessage}
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return fallbackContext;
  }
  return context;
}
