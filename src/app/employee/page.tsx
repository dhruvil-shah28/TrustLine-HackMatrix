'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';
import {
  Activity,
  AlertTriangle,
  ArrowDownLeft,
  ArrowRight,
  ArrowRightLeft,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileSearch,
  Landmark,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Search,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';

type Account = {
  id: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: string;
};

type Customer = {
  id: string;
  customerCode: string;
  name: string;
  type: string;
  kycStatus: string;
  accounts: Account[];
};

type ActivityItem = {
  id: string;
  actionType: string;
  targetType: string;
  targetId: string;
  detailsJson: string | null;
  timestamp: string;
};

type Workspace = {
  employee: {
    employeeCode: string;
    name: string;
    role: string;
    department: string;
  };
  customers: Customer[];
  recentActions: ActivityItem[];
};

type ActionResult = {
  message: string;
};

const money = (amount: number, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);

const shortAccount = (value: string) =>
  `${value.slice(0, 4)} •••• ${value.slice(-4)}`;

function Panel({
  children,
  className = '',
  surface = 'white',
}: {
  children: React.ReactNode;
  className?: string;
  surface?: 'white' | 'sage' | 'mint';
}) {
  return (
    <section
      className={`rounded-xl border shadow-[0_1px_3px_rgba(23,25,22,0.06)] ${styles.cardSurface} ${surface === 'sage' || surface === 'mint' ? 'border-[#D7E2DA]' : 'border-[#E2E1DA]'} ${className}`}
    >
      {children}
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Wallet;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 rounded-lg border border-[#E4E1D8] bg-[#F2F1EA] p-2.5 text-[#0A3D2E]">
        <Icon size={18} />
      </span>
      <div>
        <h2 className="text-sm font-semibold text-[#171916]">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-[#62645F]">{subtitle}</p>
      </div>
    </div>
  );
}

export default function EmployeePortalPage() {
  const { user, logout } = useAuth();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [selectedCustomerCode, setSelectedCustomerCode] = useState('');
  const [selectedAccountNumber, setSelectedAccountNumber] = useState('');
  const [search, setSearch] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryAccountNumber, setBeneficiaryAccountNumber] = useState('');
  const [transferAmount, setTransferAmount] = useState('1800000');
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<ActionResult | null>(null);

  async function loadWorkspace(initial = false) {
    if (initial) setLoading(true);

    try {
      const response = await fetch('/api/employee-portal', {
        credentials: 'same-origin',
        cache: 'no-store',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load the workspace.');
      }

      const payload = data as Workspace;
      setWorkspace(payload);

      setSelectedCustomerCode((current) =>
        current && payload.customers.some((c) => c.customerCode === current)
          ? current
          : payload.customers[0]?.customerCode ?? '',
      );

      setSelectedAccountNumber((current) => {
        const selected = payload.customers.find(
          (c) => c.customerCode === selectedCustomerCode,
        );
        if (selected?.accounts.some((a) => a.accountNumber === current)) {
          return current;
        }
        return selected?.accounts[0]?.accountNumber
          ?? payload.customers[0]?.accounts[0]?.accountNumber
          ?? '';
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load the workspace.',
      );
    } finally {
      if (initial) setLoading(false);
    }
  }

  useEffect(() => {
    void loadWorkspace(true);
    // Initial session load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleCustomers = (workspace?.customers ?? []).filter((customer) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    return (
      customer.name.toLowerCase().includes(q) ||
      customer.customerCode.toLowerCase().includes(q) ||
      customer.accounts.some((account) =>
        account.accountNumber.toLowerCase().includes(q),
      )
    );
  });

  const selectedCustomer = workspace?.customers.find(
    (customer) => customer.customerCode === selectedCustomerCode,
  );

  const selectedAccount = selectedCustomer?.accounts.find(
    (account) => account.accountNumber === selectedAccountNumber,
  );

  const inputClass =
    'mt-2 w-full rounded-lg border border-[#E4E1D8] bg-[#FFFFFF] px-3.5 py-3 text-sm text-[#171916] outline-none transition placeholder:text-[#858780] focus:border-[#0A3D2E] focus:ring-2 focus:ring-[#4CAF82]/20';
  const labelClass = 'text-xs font-medium text-[#62645F]';

  async function performAction(
    action: 'access' | 'beneficiary' | 'transfer',
    extra: Record<string, string> = {},
  ) {
    if (!selectedCustomer || !selectedAccount) {
      setError('Choose a customer and an active account first.');
      return;
    }

    setError('');
    setResult(null);
    setBusyAction(action);

    try {
      const response = await fetch('/api/employee-portal', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          customerCode: selectedCustomer.customerCode,
          accountNumber: selectedAccount.accountNumber,
          ...extra,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The action could not be completed.');
      }

      setResult({
        message:
          action === 'access'
            ? 'Customer profile opened successfully.'
            : action === 'beneficiary'
              ? 'Beneficiary updated successfully.'
              : 'Transfer submitted successfully.',
      });
      await loadWorkspace(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'The action could not be completed.',
      );
    } finally {
      setBusyAction('');
    }
  }

  return (
    <div
      className={`${styles.employeePortal} employee-portal-theme -m-4 min-h-screen bg-[#203234] px-4 pb-6 pt-28 text-[#FFFFFF] sm:-m-6 sm:px-6 lg:-m-8 lg:px-8`}
      style={{ fontFamily: 'var(--font-plex-sans), sans-serif', colorScheme: 'dark' }}
    >

      <div className="mx-auto max-w-[1450px] space-y-6 pb-12">
      <header className="employeeWorkspaceHeader overflow-hidden rounded-xl border border-[#3A4949] bg-[#203234]">
        <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#83E0C9]/25 bg-[#83E0C9]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#83E0C9]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#83E0C9]" />
                EMPLOYEE WORKSPACE
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-[#83E0C9] sm:text-3xl">
              Banking Operations
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#C4CECD]">Manage customer profiles, service accounts, update beneficiaries, and initiate transfers.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`rounded-lg border border-[#E2E1DA] ${styles.cardSurface} px-4 py-3`}>
              <p className="text-[10px] uppercase tracking-wider text-[#62645F]">
                Signed in as
              </p>
              <p className="mt-1 text-sm font-semibold text-[#171916]">
                {workspace?.employee.name || user.name}
              </p>
              <p className="mt-1 text-xs text-[#62645F]">
                {workspace?.employee.employeeCode || user.email}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="inline-flex items-center gap-2 rounded-lg border border-[#3A4949] bg-transparent px-3.5 py-3 text-xs font-medium text-[#FFFFFF] transition hover:bg-white/10 focus-visible:outline-[#83E0C9]"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 border-t border-[#3A4949] sm:grid-cols-3">
          <div className="flex items-center gap-3 px-5 py-4 sm:px-7">
            <Users className="text-[#83E0C9]" size={18} />
            <div>
              <p className="text-lg font-semibold text-[#83E0C9]">
                {workspace?.customers.length ?? '—'}
              </p>
              <p className="text-[11px] text-[#C4CECD]">Customers</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-[#3A4949] px-5 py-4 sm:border-l sm:border-t-0 sm:px-7">
            <Wallet className="text-[#83E0C9]" size={18} />
            <div>
              <p className="text-lg font-semibold text-[#83E0C9]">
                {workspace?.customers.reduce(
                  (sum, customer) => sum + customer.accounts.length,
                  0,
                ) ?? '—'}
              </p>
              <p className="text-[11px] text-[#C4CECD]">Accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-t border-[#3A4949] px-5 py-4 sm:border-l sm:border-t-0 sm:px-7">
            <Activity className="text-[#83E0C9]" size={18} />
            <div>
              <p className="text-lg font-semibold text-[#83E0C9]">
                {workspace?.recentActions.length ?? '—'}
              </p>
              <p className="text-[11px] text-[#C4CECD]">Recent activity</p>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-[#B42318]/20 bg-[#FEF3F2] p-4 text-sm text-[#912018]">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-[#B42318]" />
          <span>{error}</span>
          <button
            className="ml-auto text-xs underline"
            onClick={() => setError('')}
          >
            Dismiss
          </button>
        </div>
      )}

      {result && (
        <div
          role="status"
          className="rounded-lg border border-[#4CAF82]/30 bg-[#EAF5EE] p-4"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0 text-[#0A3D2E]"
            />
            <p className="min-w-0 flex-1 text-sm font-semibold text-[#171916]">
              {result.message}
            </p>
            <button
              onClick={() => setResult(null)}
              className="text-xs text-[#62645F] hover:text-[#171916]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-5 xl:grid-cols-[0.9fr_1.4fr]">
        <Panel surface="sage" className="overflow-hidden">
          <div className="border-b border-[#E4E1D8] p-5">
            <SectionTitle
              icon={Search}
              title="Customer directory"
              subtitle="Search for a customer and select a profile to service their accounts."
            />
            <div className="relative mt-5">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#62645F]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, code or account"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-[#62645F]">
              Loading customer records…
            </div>
          ) : (
            <div className="max-h-[530px] divide-y divide-[#E4E1D8] overflow-y-auto">
              {visibleCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setSelectedCustomerCode(customer.customerCode);
                    setSelectedAccountNumber(customer.accounts[0]?.accountNumber ?? '');
                    setBeneficiaryName('');
                    setBeneficiaryAccountNumber('');
                    setResult(null);
                    setError('');
                  }}
                  className={`w-full border-l-[3px] p-4 text-left transition hover:bg-[#F2F1EA] ${
                    selectedCustomerCode === customer.customerCode
                      ? 'border-l-[#0A3D2E] bg-[#DDF6EF]'
                      : 'border-l-transparent bg-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-lg border border-[#E4E1D8] bg-[#F2F1EA] p-2.5 text-[#0A3D2E]">
                      {customer.type === 'INDIVIDUAL'
                        ? <UserRound size={17} />
                        : <Building2 size={17} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-[#171916]">
                          {customer.name}
                        </span>
                      </div>
                      <p className="mt-1 font-mono technical-metadata text-[11px] text-[#62645F]">
                        {customer.customerCode}
                      </p>
                      <p className="mt-2 text-[11px] text-[#62645F]">
                        {customer.accounts.length} account(s) · {customer.kycStatus.replace('_', ' ')}
                      </p>
                    </div>
                    <ChevronDown
                      size={15}
                      className={`mt-1 shrink-0 text-[#62645F] transition ${
                        selectedCustomerCode === customer.customerCode ? 'rotate-180 text-[#0A3D2E]' : ''
                      }`}
                    />
                  </div>
                </button>
              ))}

              {visibleCustomers.length === 0 && (
                <div className="p-8 text-center text-sm text-[#62645F]">
                  No matching customers.
                </div>
              )}
            </div>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel surface="mint" className="p-5 sm:p-6">
            <SectionTitle
              icon={Landmark}
              title="Customer account"
              subtitle="Account details are drawn from the shared TrustLine database."
            />

            {!selectedCustomer || !selectedAccount ? (
              <div className="mt-6 rounded-lg border border-dashed border-[#D7E2DA] bg-[#FFFFFF]/70 p-8 text-center text-sm text-[#596863]">
                Select a customer with an available account.
              </div>
            ) : (
              <>
                <div className="mt-5">
                  <label className={labelClass} htmlFor="account-select">
                    Account
                  </label>
                  <select
                    id="account-select"
                    value={selectedAccountNumber}
                    onChange={(event) => setSelectedAccountNumber(event.target.value)}
                    className={inputClass}
                    style={{ color: '#171916', backgroundColor: '#FFFFFF' }}
                  >
                    {selectedCustomer.accounts.map((account) => (
                      <option key={account.id} value={account.accountNumber}>
                        {account.accountNumber} · {account.accountType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`mt-5 rounded-lg border border-[#D7E2DA] ${styles.balancePanel} p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-[#62645F]">
                        Available balance
                      </p>
                      <p className="metric-value mt-2 break-words tracking-tight text-[#171916]">
                        {money(selectedAccount.balance, selectedAccount.currency)}
                      </p>
                    </div>
                    <span className="rounded-lg border border-[#E4E1D8] bg-[#FFFFFF] p-3 text-[#0A3D2E]">
                      <Wallet size={20} />
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[#D7E2DA] pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#62645F]">Account type</p>
                      <p className="mt-1.5 text-xs font-semibold text-[#171916]">{selectedAccount.accountType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#62645F]">Account status</p>
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#176B3A]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#4CAF82]" />
                        {selectedAccount.status}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#62645F]">Customer</p>
                      <p className="mt-1.5 text-xs font-semibold text-[#171916]">{selectedCustomer.customerCode}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#62645F]">Masked account</p>
                      <p className="mt-1.5 font-mono technical-metadata text-xs text-[#171916]">{shortAccount(selectedAccount.accountNumber)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-[#62645F]">
                    <BadgeCheck size={15} className="text-[#0A3D2E]" />
                    KYC: {selectedCustomer.kycStatus.replace('_', ' ')}
                  </div>
                  <button
                    disabled={busyAction !== ''}
                    onClick={() => void performAction('access')}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0A3D2E] px-4 py-2.5 text-xs font-semibold text-[#FFFFFF] transition hover:bg-[#083326] focus-visible:outline-[#0A3D2E] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FileSearch size={14} />
                    {busyAction === 'access' ? 'Recording access…' : 'View customer profile'}
                  </button>
                </div>
              </>
            )}
          </Panel>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Panel className="p-5">
              <SectionTitle
                icon={Users}
                title="Beneficiary management"
                subtitle="Add or update a payee for transfers from this account."
              />
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void performAction('beneficiary', {
                    beneficiaryName,
                    beneficiaryAccountNumber,
                  });
                }}
              >
                <div>
                  <label className={labelClass} htmlFor="beneficiary-name">
                    Beneficiary name
                  </label>
                  <input
                    id="beneficiary-name"
                    required
                    minLength={2}
                    maxLength={120}
                    value={beneficiaryName}
                    onChange={(event) => setBeneficiaryName(event.target.value)}
                    placeholder="Enter beneficiary name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="beneficiary-account">
                    Destination account
                  </label>
                  <select
                    id="beneficiary-account"
                    required
                    value={beneficiaryAccountNumber}
                    onChange={(event) => setBeneficiaryAccountNumber(event.target.value)}
                    className={inputClass}
                    style={{ color: '#171916', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="">Select an active account</option>
                    {(workspace?.customers ?? [])
                      .flatMap((customer) => customer.accounts)
                      .filter((account) =>
                        account.accountNumber !== selectedAccountNumber &&
                        account.status === 'ACTIVE',
                      )
                      .map((account) => (
                        <option key={account.id} value={account.accountNumber}>
                          {account.accountNumber} · {account.accountType}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  disabled={!selectedAccount || busyAction !== ''}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E4E1D8] bg-[#FFFFFF] px-4 py-3 text-xs font-semibold text-[#171916] transition hover:bg-[#F2F1EA] focus-visible:outline-[#0A3D2E] disabled:cursor-not-allowed disabled:opacity-50"
                  type="submit"
                >
                  <RefreshCw size={14} />
                  {busyAction === 'beneficiary' ? 'Recording change…' : 'Change beneficiary'}
                </button>
              </form>
              <p className="mt-3 text-[10px] leading-4 text-[#62645F]">
                Review the beneficiary details before saving your changes.
              </p>
            </Panel>

            <Panel className="p-5">
              <SectionTitle
                icon={ArrowRightLeft}
                title="Simulated transfer"
                subtitle="Enter the payment details to send money to a beneficiary."
              />
              <form
                className="mt-5 space-y-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  void performAction('transfer', {
                    destinationAccountNumber: beneficiaryAccountNumber,
                    amount: transferAmount,
                  });
                }}
              >
                <div>
                  <label className={labelClass} htmlFor="transfer-destination">
                    Destination account
                  </label>
                  <select
                    id="transfer-destination"
                    required
                    value={beneficiaryAccountNumber}
                    onChange={(event) => setBeneficiaryAccountNumber(event.target.value)}
                    className={inputClass}
                    style={{ color: '#171916', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="">Select a beneficiary</option>
                    {(workspace?.customers ?? [])
                      .flatMap((customer) => customer.accounts)
                      .filter((account) =>
                        account.accountNumber !== selectedAccountNumber &&
                        account.status === 'ACTIVE',
                      )
                      .map((account) => (
                        <option key={account.id} value={account.accountNumber}>
                          {account.accountNumber}
                        </option>
                      ))}
                  </select>
                  <p className="mt-2 text-[10px] leading-4 text-[#62645F]">
                    Choose the payee for this transfer.
                  </p>
                </div>
                <div>
                  <label className={labelClass} htmlFor="transfer-amount">
                    Amount (INR)
                  </label>
                  <input
                    id="transfer-amount"
                    required
                    type="number"
                    min="1"
                    max={Math.min(selectedAccount?.balance ?? 0, 20000000)}
                    step="0.01"
                    value={transferAmount}
                    onChange={(event) => setTransferAmount(event.target.value)}
                    className={inputClass}
                  />
                </div>
                <button
                  disabled={!selectedAccount || busyAction !== ''}
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0A3D2E] px-4 py-3 text-xs font-semibold text-[#FFFFFF] transition hover:bg-[#083326] focus-visible:outline-[#0A3D2E] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CircleDollarSign size={15} />
                  {busyAction === 'transfer' ? 'Processing transfer…' : 'Transfer money'}
                </button>
              </form>
            </Panel>
          </div>
        </div>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[#E4E1D8] p-5 sm:flex-row sm:items-center sm:justify-between">
          <SectionTitle
            icon={Activity}
            title="My recorded activity"
            subtitle="Employee actions retained in the TrustLine database."
          />
          <button
            onClick={() => void loadWorkspace(false)}
            disabled={busyAction !== ''}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E4E1D8] bg-[#FFFFFF] px-3 py-2 text-xs text-[#171916] transition hover:bg-[#F2F1EA] focus-visible:outline-[#0A3D2E] disabled:opacity-50"
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {!workspace?.recentActions.length ? (
          <div className="p-8 text-center">
            <Clock3 className="mx-auto text-[#62645F]" size={22} />
            <p className="mt-3 text-sm font-medium text-[#171916]">No recorded actions yet</p>
            <p className="mt-1 text-xs text-[#62645F]">
              Open a customer record to create the first activity event.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E4E1D8]">
            {workspace.recentActions.map((item) => {
              let details = '';
              try {
                const parsed = item.detailsJson ? JSON.parse(item.detailsJson) : {};
                details = [
                  parsed.customerCode,
                  parsed.accountNumber,
                  parsed.destinationAccountNumber,
                  parsed.amount !== undefined
                    ? money(Number(parsed.amount), parsed.currency || 'INR')
                    : '',
                ].filter(Boolean).join(' · ');
              } catch {
                details = '';
              }

              return (
                <div key={item.id} className={`${styles.cardSurface} flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between`}>
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="mt-0.5 rounded-lg border border-[#E4E1D8] bg-[#F2F1EA] p-2 text-[#0A3D2E]">
                      {item.actionType === 'BENEFICIARY_CHANGE'
                        ? <Users size={15} />
                        : item.actionType === 'SIMULATED_TRANSFER'
                          ? <ArrowDownLeft size={15} />
                          : <Activity size={15} />}
                    </span>
                    <div className="min-w-0">
                      <p className="break-words text-xs font-semibold text-[#171916]">
                        {item.actionType === 'BENEFICIARY_CHANGE'
                          ? 'Beneficiary updated'
                          : item.actionType === 'SIMULATED_TRANSFER'
                            ? 'Transfer initiated'
                            : item.actionType.replaceAll('_', ' ')}
                      </p>
                      <p className="mt-1 break-words font-mono technical-metadata text-[10px] text-[#62645F]">
                        {item.targetType} · {item.targetId}
                      </p>
                      {details && (
                        <p className="mt-1 break-words text-[11px] text-[#62645F]">
                          {details}
                        </p>
                      )}
                    </div>
                  </div>
                  <time className="shrink-0 text-[10px] text-[#62645F]">
                    {new Date(item.timestamp).toLocaleString()}
                  </time>
                </div>
              );
            })}
          </div>
        )}
      </Panel>
      </div>
    </div>
  );
}
