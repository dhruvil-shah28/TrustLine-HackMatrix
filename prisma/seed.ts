import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Cleaning existing database ---');
  await prisma.auditLog.deleteMany();
  await prisma.caseEvidence.deleteMany();
  await prisma.caseAlert.deleteMany();
  await prisma.case.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.alertSignal.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.employeeAction.deleteMany();
  await prisma.accessEvent.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.scenario.deleteMany();

  console.log('--- Seeding Scenarios ---');
  const scenariosData = [
    {
      scenarioCode: 'SCEN-001',
      name: 'Circular Transfer Loop (A -> B -> C -> A)',
      type: 'CIRCULAR',
      description: 'Funds routed through 3 accounts in 15 mins returning to source customer linked account.',
      isSuspicious: true,
      groundTruth: 'SUSPICIOUS_CIRCULAR_MONEY_LAUNDERING',
    },
    {
      scenarioCode: 'SCEN-002',
      name: 'Structured Transaction Splitting (< ₹5L Threshold)',
      type: 'STRUCTURING',
      description: '₹14.5L split into 3 consecutive transactions of ₹4.8L, ₹4.9L, and ₹4.8L within 8 minutes.',
      isSuspicious: true,
      groundTruth: 'SUSPICIOUS_STRUCTURING_REPORT_EVASION',
    },
    {
      scenarioCode: 'SCEN-003',
      name: 'Insider Access + Beneficiary Override',
      type: 'INSIDER_PRIVILEGE',
      description: 'Employee accessed VIP customer account 4 mins before beneficiary change & ₹18L transfer.',
      isSuspicious: true,
      groundTruth: 'SUSPICIOUS_INSIDER_COLLUSION',
    },
    {
      scenarioCode: 'SCEN-004',
      name: 'Employee Portfolio Profile Mismatch',
      type: 'PROFILE_MISMATCH',
      description: 'Junior Retail Teller accessing High Net Worth Corporate investment accounts outside assigned branch.',
      isSuspicious: true,
      groundTruth: 'SUSPICIOUS_UNAUTHORIZED_PROFILING',
    },
    {
      scenarioCode: 'SCEN-005',
      name: 'Rapid Pass-Through Shell Account Velocity',
      type: 'CIRCULAR',
      description: 'Account receives ₹50L and dispatches ₹49.8L to offshore entity within 90 seconds.',
      isSuspicious: true,
      groundTruth: 'SUSPICIOUS_PASS_THROUGH',
    },
    {
      scenarioCode: 'SCEN-006',
      name: 'Dormant Account Sudden High-Volume Drain',
      type: 'PROFILE_MISMATCH',
      description: 'Inactive account for 24 months suddenly transfers out ₹32L with updated mobile number.',
      isSuspicious: true,
      groundTruth: 'SUSPICIOUS_ACCOUNT_TAKEOVER',
    },
    {
      scenarioCode: 'SCEN-007',
      name: 'Monthly Corporate Payroll Batch',
      type: 'LEGITIMATE_PAYROLL',
      description: 'Apex Tech Corp disbursing monthly salary to 120 employee accounts.',
      isSuspicious: false,
      groundTruth: 'LEGITIMATE_BUSINESS_EXPENSE',
    },
    {
      scenarioCode: 'SCEN-008',
      name: 'Genuine Vendor Invoice Settlement',
      type: 'LEGITIMATE_CORPORATE',
      description: 'Quarterly supply chain vendor payment of ₹45L verified by purchase order.',
      isSuspicious: false,
      groundTruth: 'LEGITIMATE_COMMERCIAL_TRANSACTION',
    },
    {
      scenarioCode: 'SCEN-009',
      name: 'Festive Season Retail Volume Spike',
      type: 'LEGITIMATE_CORPORATE',
      description: 'Retail merchant account processing 3x normal transaction velocity during Diwakar Festival Sale.',
      isSuspicious: false,
      groundTruth: 'LEGITIMATE_SEASONAL_SPIKE',
    },
    {
      scenarioCode: 'SCEN-010',
      name: 'Normal Employee Customer Assistance',
      type: 'LEGITIMATE_CORPORATE',
      description: 'Senior Relationship Manager checking 15 assigned client accounts during quarterly review.',
      isSuspicious: false,
      groundTruth: 'LEGITIMATE_EMPLOYEE_WORKFLOW',
    },
    {
      scenarioCode: 'SCEN-011',
      name: 'Repeated Fixed Deposit Maturity Renewal',
      type: 'LEGITIMATE_CORPORATE',
      description: 'Customer transferring funds between self savings and term deposit accounts.',
      isSuspicious: false,
      groundTruth: 'LEGITIMATE_SELF_TRANSFER',
    },
  ];

  for (const s of scenariosData) {
    await prisma.scenario.create({ data: s });
  }

  console.log('--- Seeding Employees ---');
  const employeesData = [
    { employeeCode: 'EMP-1001', name: 'Vikram Malhotra', role: 'Senior Relationship Manager', email: 'v.malhotra@apexbank.com', department: 'Wealth Management', privilegeLevel: 'ELEVATED', riskScore: 88.5 },
    { employeeCode: 'EMP-1002', name: 'Ananya Sharma', role: 'Branch Operations Lead', email: 'a.sharma@apexbank.com', department: 'Retail Operations', privilegeLevel: 'ELEVATED', riskScore: 64.0 },
    { employeeCode: 'EMP-1003', name: 'Rajesh Kumar', role: 'Retail Teller', email: 'r.kumar@apexbank.com', department: 'Retail Banking', privilegeLevel: 'STANDARD', riskScore: 18.2 },
    { employeeCode: 'EMP-1004', name: 'Priya Sundaram', role: 'Corporate Loan Officer', email: 'p.sundaram@apexbank.com', department: 'Commercial Credit', privilegeLevel: 'STANDARD', riskScore: 92.4 },
    { employeeCode: 'EMP-1005', name: 'Devendra Patel', role: 'System Administrator', email: 'd.patel@apexbank.com', department: 'IT Infrastructure', privilegeLevel: 'ADMIN', riskScore: 45.0 },
    { employeeCode: 'EMP-1006', name: 'Sneha Reddy', role: 'AML Analyst', email: 's.reddy@apexbank.com', department: 'Compliance & Regulatory', privilegeLevel: 'STANDARD', riskScore: 12.0 },
    { employeeCode: 'EMP-1007', name: 'Arjun Mehta', role: 'Investment Banking Associate', email: 'a.mehta@apexbank.com', department: 'Capital Markets', privilegeLevel: 'ELEVATED', riskScore: 78.9 },
    { employeeCode: 'EMP-1008', name: 'Kavita Nair', role: 'Customer Service Exec', email: 'k.nair@apexbank.com', department: 'Customer Support', privilegeLevel: 'STANDARD', riskScore: 25.0 },
    { employeeCode: 'EMP-1009', name: 'Amitabh Joshi', role: 'VP Commercial Banking', email: 'a.joshi@apexbank.com', department: 'Executive Management', privilegeLevel: 'ADMIN', riskScore: 55.3 },
    { employeeCode: 'EMP-1010', name: 'Ritu Verma', role: 'Trade Finance Specialist', email: 'r.verma@apexbank.com', department: 'International Trade', privilegeLevel: 'ELEVATED', riskScore: 31.0 },
  ];

  const createdEmployees: Record<string, any> = {};
  for (const emp of employeesData) {
    const created = await prisma.employee.create({ data: emp });
    createdEmployees[emp.employeeCode] = created;
  }

  console.log('--- Seeding Customers ---');
  const customersData = [
    { customerCode: 'CUST-8001', name: 'Karan Enterprise Ltd', type: 'CORPORATE', riskProfile: 'HIGH', kycStatus: 'VERIFIED' },
    { customerCode: 'CUST-8002', name: 'Zenith Global Holdings', type: 'CORPORATE', riskProfile: 'HIGH', kycStatus: 'UNDER_REVIEW' },
    { customerCode: 'CUST-8003', name: 'Sunil Varma', type: 'INDIVIDUAL', riskProfile: 'MEDIUM', kycStatus: 'VERIFIED' },
    { customerCode: 'CUST-8004', name: 'BlueSky Logistics Pvt Ltd', type: 'SME', riskProfile: 'LOW', kycStatus: 'VERIFIED' },
    { customerCode: 'CUST-8005', name: 'Meera Iyer', type: 'INDIVIDUAL', riskProfile: 'LOW', kycStatus: 'VERIFIED' },
    { customerCode: 'CUST-8006', name: 'Trident FinTech Consulting', type: 'CORPORATE', riskProfile: 'HIGH', kycStatus: 'FLAGGED' },
    { customerCode: 'CUST-8007', name: 'Rohan Deshmukh', type: 'INDIVIDUAL', riskProfile: 'HIGH', kycStatus: 'VERIFIED' },
    { customerCode: 'CUST-8008', name: 'Apex Tech Solutions', type: 'CORPORATE', riskProfile: 'LOW', kycStatus: 'VERIFIED' },
    { customerCode: 'CUST-8009', name: 'Vanguard Traders', type: 'SME', riskProfile: 'MEDIUM', kycStatus: 'VERIFIED' },
    { customerCode: 'CUST-8010', name: 'Pooja Kapoor', type: 'INDIVIDUAL', riskProfile: 'LOW', kycStatus: 'VERIFIED' },
  ];

  const createdCustomers: Record<string, any> = {};
  for (const c of customersData) {
    const created = await prisma.customer.create({ data: c });
    createdCustomers[c.customerCode] = created;
  }

  console.log('--- Seeding Accounts ---');
  const accountsData = [
    { accountNumber: 'ACC-1001-INR', customerCode: 'CUST-8001', accountType: 'CORPORATE', balance: 14250000.0 },
    { accountNumber: 'ACC-1002-INR', customerCode: 'CUST-8002', accountType: 'INVESTMENT', balance: 8900000.0 },
    { accountNumber: 'ACC-1003-INR', customerCode: 'CUST-8003', accountType: 'SAVINGS', balance: 450000.0 },
    { accountNumber: 'ACC-1004-INR', customerCode: 'CUST-8004', accountType: 'CHECKING', balance: 2310000.0 },
    { accountNumber: 'ACC-1005-INR', customerCode: 'CUST-8005', accountType: 'SAVINGS', balance: 180000.0 },
    { accountNumber: 'ACC-1006-INR', customerCode: 'CUST-8006', accountType: 'CORPORATE', balance: 6700000.0 },
    { accountNumber: 'ACC-1007-INR', customerCode: 'CUST-8007', accountType: 'SAVINGS', balance: 1250000.0 },
    { accountNumber: 'ACC-1008-INR', customerCode: 'CUST-8008', accountType: 'CORPORATE', balance: 35000000.0 },
    { accountNumber: 'ACC-1009-INR', customerCode: 'CUST-8009', accountType: 'CHECKING', balance: 940000.0 },
    { accountNumber: 'ACC-1010-INR', customerCode: 'CUST-8010', accountType: 'SAVINGS', balance: 320000.0 },
  ];

  const createdAccounts: Record<string, any> = {};
  for (const a of accountsData) {
    const created = await prisma.account.create({
      data: {
        accountNumber: a.accountNumber,
        customerId: createdCustomers[a.customerCode].id,
        accountType: a.accountType,
        balance: a.balance,
      },
    });
    createdAccounts[a.accountNumber] = created;
  }

  console.log('--- Seeding Transactions ---');
  const now = new Date();

  // Suspicious Circular Flow: ACC-1001 -> ACC-1002 -> ACC-1006 -> ACC-1001
  const t1 = await prisma.transaction.create({
    data: {
      txHash: 'TXN-CIRC-001',
      sourceAccountId: createdAccounts['ACC-1001-INR'].id,
      destinationAccountId: createdAccounts['ACC-1002-INR'].id,
      amount: 1500000.0,
      channel: 'NET_BANKING',
      status: 'COMPLETED',
      initiatedByEmployeeId: createdEmployees['EMP-1001'].id,
      timestamp: new Date(now.getTime() - 45 * 60 * 1000),
      flagsJson: JSON.stringify(['HIGH_VALUE', 'INSIDER_INITIATED']),
    },
  });

  const t2 = await prisma.transaction.create({
    data: {
      txHash: 'TXN-CIRC-002',
      sourceAccountId: createdAccounts['ACC-1002-INR'].id,
      destinationAccountId: createdAccounts['ACC-1006-INR'].id,
      amount: 1485000.0,
      channel: 'WIRE',
      status: 'COMPLETED',
      timestamp: new Date(now.getTime() - 35 * 60 * 1000),
      flagsJson: JSON.stringify(['HIGH_VELOCITY', 'RAPID_PASS_THROUGH']),
    },
  });

  const t3 = await prisma.transaction.create({
    data: {
      txHash: 'TXN-CIRC-003',
      sourceAccountId: createdAccounts['ACC-1006-INR'].id,
      destinationAccountId: createdAccounts['ACC-1001-INR'].id,
      amount: 1470000.0,
      channel: 'WIRE',
      status: 'COMPLETED',
      approvedByEmployeeId: createdEmployees['EMP-1001'].id,
      timestamp: new Date(now.getTime() - 20 * 60 * 1000),
      flagsJson: JSON.stringify(['CIRCULAR_LOOP', 'INSIDER_APPROVED']),
    },
  });

  // Suspicious Structuring (Split transfers under ₹5 Lakh)
  const t4 = await prisma.transaction.create({
    data: {
      txHash: 'TXN-SPLIT-001',
      sourceAccountId: createdAccounts['ACC-1004-INR'].id,
      destinationAccountId: createdAccounts['ACC-1007-INR'].id,
      amount: 485000.0,
      channel: 'NET_BANKING',
      status: 'COMPLETED',
      initiatedByEmployeeId: createdEmployees['EMP-1004'].id,
      timestamp: new Date(now.getTime() - 90 * 60 * 1000),
      flagsJson: JSON.stringify(['BELOW_REPORTING_THRESHOLD']),
    },
  });

  const t5 = await prisma.transaction.create({
    data: {
      txHash: 'TXN-SPLIT-002',
      sourceAccountId: createdAccounts['ACC-1004-INR'].id,
      destinationAccountId: createdAccounts['ACC-1007-INR'].id,
      amount: 490000.0,
      channel: 'NET_BANKING',
      status: 'COMPLETED',
      initiatedByEmployeeId: createdEmployees['EMP-1004'].id,
      timestamp: new Date(now.getTime() - 86 * 60 * 1000),
      flagsJson: JSON.stringify(['BELOW_REPORTING_THRESHOLD', 'STRUCTURING_PATTERN']),
    },
  });

  const t6 = await prisma.transaction.create({
    data: {
      txHash: 'TXN-SPLIT-003',
      sourceAccountId: createdAccounts['ACC-1004-INR'].id,
      destinationAccountId: createdAccounts['ACC-1007-INR'].id,
      amount: 480000.0,
      channel: 'NET_BANKING',
      status: 'COMPLETED',
      initiatedByEmployeeId: createdEmployees['EMP-1004'].id,
      timestamp: new Date(now.getTime() - 81 * 60 * 1000),
      flagsJson: JSON.stringify(['BELOW_REPORTING_THRESHOLD', 'STRUCTURING_PATTERN']),
    },
  });

  // Normal Legitimate Corporate Payroll & Retail
  for (let i = 1; i <= 20; i++) {
    await prisma.transaction.create({
      data: {
        txHash: `TXN-NORM-${1000 + i}`,
        sourceAccountId: createdAccounts['ACC-1008-INR'].id,
        destinationAccountId: createdAccounts['ACC-1005-INR'].id,
        amount: 85000 + Math.floor(Math.random() * 20000),
        channel: 'NET_BANKING',
        status: 'COMPLETED',
        timestamp: new Date(now.getTime() - (i * 180 + 10) * 60 * 1000),
      },
    });
  }

  console.log('--- Seeding Access Events & Employee Actions ---');
  // Insider Vikram Malhotra accesses customer & account shortly before transaction
  await prisma.accessEvent.create({
    data: {
      employeeId: createdEmployees['EMP-1001'].id,
      entityType: 'CUSTOMER',
      entityId: createdCustomers['CUST-8001'].id,
      accessType: 'VIEW',
      ipAddress: '192.168.1.104',
      timestamp: new Date(now.getTime() - 60 * 60 * 1000),
    },
  });

  await prisma.accessEvent.create({
    data: {
      employeeId: createdEmployees['EMP-1001'].id,
      entityType: 'ACCOUNT',
      entityId: createdAccounts['ACC-1006-INR'].id,
      accessType: 'BENEFICIARY_UPDATE',
      ipAddress: '192.168.1.104',
      timestamp: new Date(now.getTime() - 50 * 60 * 1000),
    },
  });

  await prisma.employeeAction.create({
    data: {
      employeeId: createdEmployees['EMP-1001'].id,
      actionType: 'BENEFICIARY_CHANGE',
      targetType: 'ACCOUNT',
      targetId: createdAccounts['ACC-1006-INR'].id,
      detailsJson: JSON.stringify({ oldBeneficiary: 'Unknown Inc', newBeneficiary: 'Trident FinTech Consulting' }),
      timestamp: new Date(now.getTime() - 50 * 60 * 1000),
    },
  });

  // Employee Priya Sundaram access events
  await prisma.accessEvent.create({
    data: {
      employeeId: createdEmployees['EMP-1004'].id,
      entityType: 'CUSTOMER',
      entityId: createdCustomers['CUST-8004'].id,
      accessType: 'VIEW',
      ipAddress: '10.0.12.88',
      timestamp: new Date(now.getTime() - 95 * 60 * 1000),
    },
  });

  await prisma.employeeAction.create({
    data: {
      employeeId: createdEmployees['EMP-1004'].id,
      actionType: 'OVERRIDE_LIMIT',
      targetType: 'CUSTOMER',
      targetId: createdCustomers['CUST-8004'].id,
      detailsJson: JSON.stringify({ reason: 'Seasonal Credit Extension', requestedBy: 'Priya Sundaram' }),
      timestamp: new Date(now.getTime() - 92 * 60 * 1000),
    },
  });

  console.log('--- Seeding Alerts ---');
  const alert1 = await prisma.alert.create({
    data: {
      alertCode: 'ALT-8891',
      title: 'Connected Anomaly: Insider Access & Circular Funds Routing',
      severity: 'CRITICAL',
      status: 'OPEN',
      confidence: 'HIGH',
      financialExposure: 4455000.0,
      primaryEntityId: createdEmployees['EMP-1001'].id,
      primaryEntityType: 'EMPLOYEE',
      summary: 'Employee Vikram Malhotra accessed Customer Karan Enterprise 10 minutes prior to initiating a ₹15L circular transaction loop spanning 3 accounts.',
      riskExplanation: 'High risk composite signal detected combining insider account lookup, beneficiary record override, and rapid circular transfer (ACC-1001 -> ACC-1002 -> ACC-1006 -> ACC-1001) returning 98% of funds to source within 25 minutes.',
      detectionMethod: 'HYBRID_RULE_GRAPH_ML',
      scenarioName: 'SCEN-001: Circular Transfer Loop',
      signals: {
        create: [
          {
            type: 'CIRCULAR_FLOW',
            title: 'Circular Money Flow Detected',
            description: 'Funds traversed ACC-1001 -> ACC-1002 -> ACC-1006 and returned to ACC-1001.',
            observedValue: '3-node closed cycle (98% fund retention)',
            expectedValue: 'Linear out-of-network transfer',
            weight: 3.5,
            evidenceCategory: 'GRAPH',
          },
          {
            type: 'INSIDER_ACCESS',
            title: 'Pre-Transaction Privilege Access',
            description: 'Employee EMP-1001 viewed account profile 10 mins prior to wire execution.',
            observedValue: 'Access at 15:10, Tx initiated at 15:15',
            expectedValue: 'No pre-transfer manual lookup',
            weight: 2.8,
            evidenceCategory: 'TIMELINE',
          },
          {
            type: 'BENEFICIARY_CHANGE',
            title: 'Recent Beneficiary Modification',
            description: 'Beneficiary details for ACC-1006 altered by EMP-1001 5 mins before transfer.',
            observedValue: 'Beneficiary updated to Trident FinTech',
            expectedValue: 'Static beneficiary record > 30 days',
            weight: 2.5,
            evidenceCategory: 'PRIVILEGE',
          },
          {
            type: 'BASELINE_DEVIATION',
            title: 'Peer Group Velocity Outlier (ML)',
            description: 'Transaction velocity for EMP-1001 is 4.2x higher than Senior RM peer group baseline.',
            observedValue: 'Z-Score: +3.85',
            expectedValue: 'Z-Score <= +1.5',
            weight: 2.0,
            evidenceCategory: 'ML',
          },
        ],
      },
      recommendations: {
        create: [
          { actionText: 'Place temporary administrative hold on Account ACC-1001-INR', category: 'TRANSACTION_HOLD', priority: 'CRITICAL' },
          { actionText: 'Review Vikram Malhotra privilege logs and branch IP logs', category: 'ACCESS_REVIEW', priority: 'HIGH' },
          { actionText: 'Request KYC re-verification for Trident FinTech Consulting', category: 'CUSTOMER_VERIFICATION', priority: 'MEDIUM' },
        ],
      },
    },
  });

  const alert2 = await prisma.alert.create({
    data: {
      alertCode: 'ALT-8892',
      title: 'Transaction Structuring Pattern (< ₹5L CTR Threshold)',
      severity: 'HIGH',
      status: 'IN_REVIEW',
      confidence: 'HIGH',
      financialExposure: 1455000.0,
      primaryEntityId: createdAccounts['ACC-1004-INR'].id,
      primaryEntityType: 'ACCOUNT',
      summary: 'Three consecutive transfers of ₹4.85L, ₹4.90L, and ₹4.80L initiated within 9 minutes to avoid ₹5L mandatory threshold reporting.',
      riskExplanation: 'Pattern matches classic structuring tactics where a total of ₹14.55L was fragmented into 3 sub-threshold transfers. Initiated by Priya Sundaram under elevated limit override.',
      detectionMethod: 'RULE_STRUCTURING',
      scenarioName: 'SCEN-002: Structured Transaction Splitting',
      signals: {
        create: [
          {
            type: 'STRUCTURING',
            title: 'Sub-Threshold Money Fragmentation',
            description: '3 transfers of ~₹4.8L-₹4.9L sent within 9 minutes.',
            observedValue: '3 transfers, Total ₹14.55L (Max ₹4.9L)',
            expectedValue: 'Single transfer of ₹14.55L with CTR reporting',
            weight: 3.0,
            evidenceCategory: 'TRANSACTION',
          },
          {
            type: 'BASELINE_DEVIATION',
            title: 'Sudden Account Velocity Spike',
            description: 'Account ACC-1004 daily transaction volume increased 650% above 30-day mean.',
            observedValue: '₹14.55L vs 30-day mean ₹2.2L',
            expectedValue: '< ₹3.5L daily volume',
            weight: 2.2,
            evidenceCategory: 'ML',
          },
        ],
      },
      recommendations: {
        create: [
          { actionText: 'File Suspicious Transaction Report (STR/CTR) with Compliance Officer', category: 'CUSTOMER_VERIFICATION', priority: 'HIGH' },
          { actionText: 'Audit Priya Sundaram limit override justification', category: 'ACCESS_REVIEW', priority: 'HIGH' },
        ],
      },
    },
  });

  const alert3 = await prisma.alert.create({
    data: {
      alertCode: 'ALT-8893',
      title: 'Profile & Access Mismatch: Junior Teller HNW Access',
      severity: 'MEDIUM',
      status: 'OPEN',
      confidence: 'MEDIUM',
      financialExposure: 8900000.0,
      primaryEntityId: createdEmployees['EMP-1003'].id,
      primaryEntityType: 'EMPLOYEE',
      summary: 'Retail Teller Rajesh Kumar accessed Zenith Global Corporate HNW Account ACC-1002-INR without an active branch ticket or customer request.',
      riskExplanation: 'Employee role is designated for retail cash operations, but multiple profile lookups were logged for non-assigned corporate investment accounts.',
      detectionMethod: 'PROFILE_PRIVILEGE_ANALYSIS',
      scenarioName: 'SCEN-004: Profile Mismatch',
      signals: {
        create: [
          {
            type: 'BASELINE_DEVIATION',
            title: 'Role-to-Entity Mismatch',
            description: 'Retail Teller role accessing Corporate HNW Portfolio',
            observedValue: 'Role: Retail Teller, Target: Corporate HNW',
            expectedValue: 'Target: Retail Individual Accounts',
            weight: 2.4,
            evidenceCategory: 'PRIVILEGE',
          },
        ],
      },
      recommendations: {
        create: [
          { actionText: 'Confirm if Rajesh Kumar received manager verbal authorization', category: 'ACCESS_REVIEW', priority: 'MEDIUM' },
        ],
      },
    },
  });

  console.log('--- Seeding Cases & Evidence ---');
  const case1 = await prisma.case.create({
    data: {
      caseCode: 'CASE-2026-001',
      title: 'Investigation into Insider Vikram Malhotra & Circular Routing Network',
      severity: 'CRITICAL',
      status: 'OPEN',
      assignedInvestigator: 'Sarah Jenkins (Lead AML)',
      summary: 'Detailed investigation into ALT-8891 involving Karan Enterprise, Zenith Global, and Trident FinTech Consulting. Primary focus on employee collusion and beneficiary tampering.',
      recommendationsJson: JSON.stringify([
        { id: 1, text: 'Interview Vikram Malhotra regarding 15:10 login', done: false },
        { id: 2, text: 'Freeze destination account ACC-1006-INR', done: true },
        { id: 3, text: 'Export evidence graph package for Financial Intelligence Unit', done: false },
      ]),
      alerts: {
        create: [
          { alertId: alert1.id },
        ],
      },
      evidenceItems: {
        create: [
          {
            evidenceType: 'TRANSACTION',
            title: 'Circular Wire Cycle Proof (TXN-CIRC-001 -> 003)',
            contentJson: JSON.stringify({
              transactions: ['TXN-CIRC-001', 'TXN-CIRC-002', 'TXN-CIRC-003'],
              totalAmount: 1500000.0,
              timeDeltaMinutes: 25,
              netRetention: '98.0%',
            }),
          },
          {
            evidenceType: 'EMPLOYEE_ACTIVITY',
            title: 'Vikram Malhotra Access Logs & Audit Trail',
            contentJson: JSON.stringify({
              employeeCode: 'EMP-1001',
              accessType: 'BENEFICIARY_UPDATE',
              ipAddress: '192.168.1.104',
              timestamp: now.toISOString(),
            }),
          },
          {
            evidenceType: 'GRAPH_RELATIONSHIP',
            title: '3-Node Closed Loop Money-Flow Subgraph',
            contentJson: JSON.stringify({
              nodes: ['ACC-1001-INR', 'ACC-1002-INR', 'ACC-1006-INR'],
              edges: [
                { from: 'ACC-1001-INR', to: 'ACC-1002-INR', label: 'TRANSFERRED ₹15.0L' },
                { from: 'ACC-1002-INR', to: 'ACC-1006-INR', label: 'TRANSFERRED ₹14.85L' },
                { from: 'ACC-1006-INR', to: 'ACC-1001-INR', label: 'TRANSFERRED ₹14.7L' },
              ],
            }),
          },
        ],
      },
      auditLogs: {
        create: [
          {
            actorId: 'INV-101',
            actorName: 'Sarah Jenkins',
            action: 'CASE_CREATED',
            targetType: 'CASE',
            targetId: 'CASE-2026-001',
            details: 'Initiated formal case file from ALT-8891.',
          },
          {
            actorId: 'INV-101',
            actorName: 'Sarah Jenkins',
            action: 'EVIDENCE_ADDED',
            targetType: 'CASE_EVIDENCE',
            targetId: 'EVD-001',
            details: 'Attached Circular Wire Cycle Proof to case workspace.',
          },
        ],
      },
    },
  });

  console.log('--- Database Seed Complete Successfully! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
