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
  refreshSession: () => Promise<boolean>;
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
  refreshSession: async () => false,
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
    let cancelled = false;

    async function restoreSession() {
      try {
        const savedNotifs = localStorage.getItem('sentineliq_notifications');
        const savedLogs = localStorage.getItem('sentineliq_audit_logs');

        if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
        if (savedLogs) setAuditLogs(JSON.parse(savedLogs));

        const response = await fetch('/api/auth/employee/session', {
          credentials: 'same-origin',
          cache: 'no-store',
        });

        if (!response.ok) {
          if (!cancelled) {
            setIsLoggedIn(false);
            setUser(defaultUser);
          }
          return;
        }

        const result = await response.json();
        if (cancelled || !result.authenticated || !result.employee) return;

        const employee = result.employee;
        const employeeRole = String(employee.role || '').toUpperCase();
        const mappedRole: UserRole =
          employee.privilegeLevel === 'ADMIN'
            ? 'ADMIN'
            : ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST'].includes(employeeRole)
              ? (employeeRole as UserRole)
              : 'EMPLOYEE';

        setUser((current) => ({
          ...current,
          name: employee.name,
          email: employee.email,
          role: mappedRole,
          department: employee.department || current.department,
          title: employee.role || current.title,
          jobTitle: employee.role || current.jobTitle,
          avatar: employee.name.split(/\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(),
          lastActive: 'Just now',
        }));
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Session restoration failed:', error);
        if (!cancelled) {
          setIsLoggedIn(false);
          setUser(defaultUser);
        }
      } finally {
        if (!cancelled) setIsAuthReady(true);
      }
    }

    void restoreSession();
    return () => { cancelled = true; };
  }, []);

  const refreshSession = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/employee/session', {
        credentials: 'same-origin',
        cache: 'no-store',
      });

      if (!response.ok) {
        setIsLoggedIn(false);
        setUser(defaultUser);
        return false;
      }

      const result = await response.json();
      if (!result.authenticated || !result.employee) {
        setIsLoggedIn(false);
        setUser(defaultUser);
        return false;
      }

      const employee = result.employee;
      const employeeRole = String(employee.role || '').toUpperCase();
      const mappedRole: UserRole =
        employee.privilegeLevel === 'ADMIN'
          ? 'ADMIN'
          : ['INVESTIGATOR', 'COMPLIANCE', 'RISK_ANALYST'].includes(employeeRole)
            ? (employeeRole as UserRole)
            : 'EMPLOYEE';

      setUser((current) => ({
        ...current,
        name: employee.name,
        email: employee.email,
        role: mappedRole,
        department: employee.department || current.department,
        title: employee.role || current.title,
        jobTitle: employee.role || current.jobTitle,
        avatar: employee.name.split(/\\s+/).map((part: string) => part[0]).join('').slice(0, 2).toUpperCase(),
        lastActive: 'Just now',
      }));

      setIsLoggedIn(true);
      setIsAuthReady(true);
      return true;
    } catch (error) {
      console.error('Session refresh failed:', error);
      setIsLoggedIn(false);
      setUser(defaultUser);
      return false;
    }
  };

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
    if (newRole !== user.role) {
      showToast('Your assigned role is controlled by your employee account.');
      return;
    }

    const roleTitles: Record<UserRole, { title: string; dept: string }> = {
      EMPLOYEE: { title: 'Banking Operations Employee', dept: user.department || 'Banking Operations' },
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

  const login = (_email: string) => {
    // Authentication is established only by the server-side login endpoint.
    // The session endpoint will populate the user after the next refresh.
    showToast('Please sign in through the employee login form.');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(defaultUser);

    try {
      localStorage.removeItem('sentineliq_auth');
      localStorage.removeItem('sentineliq_user');
    } catch {}

    void fetch('/api/auth/employee/logout', {
      method: 'POST',
      credentials: 'same-origin',
    }).catch((error) => console.error('Server logout failed:', error));

    addAuditLog('LOGOUT_SESSION_TERMINATED', 'SYSTEM', 'TRUSTLINE-WORKSPACE', 'User signed out');
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
        refreshSession,
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
