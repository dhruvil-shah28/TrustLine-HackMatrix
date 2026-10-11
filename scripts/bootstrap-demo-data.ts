import { PrismaClient } from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const key = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${key.toString('hex')}`;
}

async function main() {
  if (process.env.ENABLE_DEMO_DATA_BOOTSTRAP !== 'true') {
    throw new Error('Set ENABLE_DEMO_DATA_BOOTSTRAP=true to run this one-time demo loader.');
  }

  const employeePassword = process.env.DEMO_EMPLOYEE_PASSWORD;
  const investigatorPassword = process.env.DEMO_INVESTIGATOR_PASSWORD;
  if (!employeePassword || !investigatorPassword) {
    throw new Error('Both demo passwords must be configured.');
  }

  const completed = await prisma.auditLog.findFirst({
    where: {
      action: 'DEMO_DATA_BOOTSTRAP_COMPLETED',
      targetId: 'trustline-demo-data-v1',
    },
  });
  if (completed) {
    console.log('Demo data bootstrap already completed; skipping.');
    return;
  }

  console.log('Starting additive TrustLine demo-data bootstrap.');

  const empHash = await hashPassword(employeePassword);
  const invHash = await hashPassword(investigatorPassword);

  const employeeRows = [
    ['EMP-1001','Vikram Malhotra','Senior Relationship Manager','v.malhotra@apexbank.com','Wealth Management','ELEVATED',88.5],
    ['EMP-1002','Ananya Sharma','Branch Operations Lead','a.sharma@apexbank.com','Retail Operations','ELEVATED',64],
    ['EMP-1003','Rajesh Kumar','Retail Teller','r.kumar@apexbank.com','Retail Banking','STANDARD',18.2],
    ['EMP-1004','Priya Sundaram','Corporate Loan Officer','p.sundaram@apexbank.com','Commercial Credit','STANDARD',92.4],
    ['EMP-1005','Devendra Patel','System Administrator','d.patel@apexbank.com','IT Infrastructure','ADMIN',45],
    ['EMP-1006','Sneha Reddy','AML Analyst','s.reddy@apexbank.com','Compliance & Regulatory','STANDARD',12],
    ['EMP-1007','Arjun Mehta','Investment Banking Associate','a.mehta@apexbank.com','Capital Markets','ELEVATED',78.9],
    ['EMP-1008','Kavita Nair','Customer Service Exec','k.nair@apexbank.com','Customer Support','STANDARD',25],
    ['EMP-1009','Amitabh Joshi','VP Commercial Banking','a.joshi@apexbank.com','Executive Management','ADMIN',55.3],
    ['EMP-1010','Ritu Verma','Trade Finance Specialist','r.verma@apexbank.com','International Trade','ELEVATED',31],
    ['EMP-INVESTIGATOR-01','Rahul Sharma','Lead AML Investigator','rahul.sharma@trustline.in','Financial Crime & AML Investigations','ADMIN',5],
  ] as const;

  const employees: Record<string, { id: string }> = {};
  for (const e of employeeRows) {
    const [employeeCode,name,role,email,department,privilegeLevel,riskScore] = e;
    const passwordHash =
      employeeCode === 'EMP-1001' ? empHash :
      employeeCode === 'EMP-INVESTIGATOR-01' ? invHash : null;

    const update: Record<string, unknown> = {
      name, role, email, department, privilegeLevel, riskScore, status: 'ACTIVE',
    };
    if (passwordHash) update.passwordHash = passwordHash;

    employees[employeeCode] = await prisma.employee.upsert({
      where: { employeeCode },
      update: update as never,
      create: { employeeCode, name, role, email, department, privilegeLevel, riskScore, status: 'ACTIVE', passwordHash },
    });
  }

  await prisma.investigator.upsert({
    where: { email: 'rahul.sharma@trustline.in' },
    update: { name: 'Rahul Sharma', role: 'Lead AML Investigator', avatar: 'RS' },
    create: { name: 'Rahul Sharma', email: 'rahul.sharma@trustline.in', role: 'Lead AML Investigator', avatar: 'RS' },
  });

  const scenarioRows = [
    ['SCEN-001','Circular Transfer Loop','CIRCULAR','Funds pass through multiple accounts and return to the source.','SUSPICIOUS_CIRCULAR_MONEY_LAUNDERING',true],
    ['SCEN-002','Structured Transaction Splitting','STRUCTURING','Multiple transfers remain below a reporting threshold.','SUSPICIOUS_STRUCTURING_REPORT_EVASION',true],
    ['SCEN-003','Insider Access + Beneficiary Override','INSIDER_PRIVILEGE','Account access and beneficiary change precede a high-value transfer.','SUSPICIOUS_INSIDER_COLLUSION',true],
    ['SCEN-004','Employee Portfolio Profile Mismatch','PROFILE_MISMATCH','Employee activity appears inconsistent with assigned duties.','SUSPICIOUS_UNAUTHORIZED_PROFILING',true],
    ['SCEN-007','Monthly Corporate Payroll Batch','LEGITIMATE_PAYROLL','Normal recurring corporate payroll payments.','LEGITIMATE_BUSINESS_EXPENSE',false],
  ] as const;

  for (const s of scenarioRows) {
    const [scenarioCode,name,type,description,groundTruth,isSuspicious] = s;
    await prisma.scenario.upsert({
      where: { scenarioCode },
      update: { name,type,description,groundTruth,isSuspicious },
      create: { scenarioCode,name,type,description,groundTruth,isSuspicious },
    });
  }

  const customerRows = [
    ['CUST-8001','Karan Enterprise Ltd','CORPORATE','HIGH','VERIFIED'],
    ['CUST-8002','Zenith Global Holdings','CORPORATE','HIGH','UNDER_REVIEW'],
    ['CUST-8003','Sunil Varma','INDIVIDUAL','MEDIUM','VERIFIED'],
    ['CUST-8004','BlueSky Logistics Pvt Ltd','SME','LOW','VERIFIED'],
    ['CUST-8005','Meera Iyer','INDIVIDUAL','LOW','VERIFIED'],
    ['CUST-8006','Trident FinTech Consulting','CORPORATE','HIGH','FLAGGED'],
    ['CUST-8007','Rohan Deshmukh','INDIVIDUAL','HIGH','VERIFIED'],
    ['CUST-8008','Apex Tech Solutions','CORPORATE','LOW','VERIFIED'],
    ['CUST-8009','Vanguard Traders','SME','MEDIUM','VERIFIED'],
    ['CUST-8010','Pooja Kapoor','INDIVIDUAL','LOW','VERIFIED'],
  ] as const;

  const customers: Record<string, { id: string }> = {};
  for (const c of customerRows) {
    const [customerCode,name,type,riskProfile,kycStatus] = c;
    customers[customerCode] = await prisma.customer.upsert({
      where: { customerCode },
      update: { name,type,riskProfile,kycStatus },
      create: { customerCode,name,type,riskProfile,kycStatus },
    });
  }

  const accountRows = [
    ['ACC-1001-INR','CUST-8001','CORPORATE',14250000],
    ['ACC-1002-INR','CUST-8002','INVESTMENT',8900000],
    ['ACC-1003-INR','CUST-8003','SAVINGS',450000],
    ['ACC-1004-INR','CUST-8004','CHECKING',2310000],
    ['ACC-1005-INR','CUST-8005','SAVINGS',180000],
    ['ACC-1006-INR','CUST-8006','CORPORATE',6700000],
    ['ACC-1007-INR','CUST-8007','SAVINGS',1250000],
    ['ACC-1008-INR','CUST-8008','CORPORATE',35000000],
    ['ACC-1009-INR','CUST-8009','CHECKING',940000],
    ['ACC-1010-INR','CUST-8010','SAVINGS',320000],
  ] as const;

  const accounts: Record<string, { id: string }> = {};
  for (const a of accountRows) {
    const [accountNumber,customerCode,accountType,balance] = a;
    accounts[accountNumber] = await prisma.account.upsert({
      where: { accountNumber },
      update: { customerId: customers[customerCode].id, accountType, balance, status: 'ACTIVE' },
      create: { accountNumber, customerId: customers[customerCode].id, accountType, balance, status: 'ACTIVE' },
    });
  }

  const now = Date.now();
  type DemoTransaction = [
    txHash: string,
    src: string,
    dst: string,
    amount: number,
    channel: string,
    employeeCode: string,
    minutesAgo: number,
    flags: string[],
  ];
  const transactions: DemoTransaction[] = [
    ['TXN-CIRC-001','ACC-1001-INR','ACC-1002-INR',1500000,'WIRE','EMP-1001',45,['HIGH_VALUE','INSIDER_INITIATED']],
    ['TXN-CIRC-002','ACC-1002-INR','ACC-1006-INR',1485000,'WIRE','EMP-1001',35,['HIGH_VELOCITY','RAPID_PASS_THROUGH']],
    ['TXN-CIRC-003','ACC-1006-INR','ACC-1001-INR',1470000,'WIRE','EMP-1001',20,['CIRCULAR_LOOP','INSIDER_APPROVED']],
    ['TXN-SPLIT-001','ACC-1004-INR','ACC-1007-INR',485000,'NET_BANKING','EMP-1004',90,['BELOW_REPORTING_THRESHOLD']],
    ['TXN-SPLIT-002','ACC-1004-INR','ACC-1007-INR',490000,'NET_BANKING','EMP-1004',86,['BELOW_REPORTING_THRESHOLD','STRUCTURING_PATTERN']],
    ['TXN-SPLIT-003','ACC-1004-INR','ACC-1007-INR',480000,'NET_BANKING','EMP-1004',81,['BELOW_REPORTING_THRESHOLD','STRUCTURING_PATTERN']],
  ];

  const allTransactions: DemoTransaction[] = [...transactions];
  for (let i = 1; i <= 20; i++) {
    allTransactions.push([
      `TXN-NORM-${1000+i}`,'ACC-1008-INR','ACC-1005-INR',
      85000 + ((i * 677) % 20000),'NET_BANKING','EMP-1002',
      i * 180 + 10,['ROUTINE_PAYMENT'],
    ]);
  }

  for (const t of allTransactions) {
    const [txHash,src,dst,amount,channel,employeeCode,minutesAgo,flags] = t;
    const data = {
      sourceAccountId: accounts[src].id,
      destinationAccountId: accounts[dst].id,
      amount, channel, status: 'COMPLETED',
      initiatedByEmployeeId: employees[employeeCode].id,
      timestamp: new Date(now - minutesAgo * 60_000),
      flagsJson: JSON.stringify(flags),
    };
    await prisma.transaction.upsert({
      where: { txHash },
      update: data,
      create: { txHash, ...data },
    });
  }

  const alertRows = [
    {
      code: 'ALT-8891',
      title: 'Connected Anomaly: Insider Access & Circular Funds Routing',
      severity: 'CRITICAL', status: 'OPEN', confidence: 'HIGH', exposure: 4455000,
      entityCode: 'EMP-1001', entityType: 'EMPLOYEE',
      summary: 'Employee account access and a beneficiary change precede a three-account circular transfer pattern.',
      explanation: 'The sequence combines insider access, beneficiary modification, and rapid circulation of funds.',
      detection: 'HYBRID_RULE_GRAPH_ML', scenario: 'SCEN-001: Circular Transfer Loop',
      signals: [
        {type:'CIRCULAR_FLOW',title:'Circular Money Flow Detected',description:'Funds traverse three accounts and return close to the source.',observedValue:'Three-node closed cycle',expectedValue:'Linear transfer flow',weight:3.5,evidenceCategory:'GRAPH'},
        {type:'INSIDER_ACCESS',title:'Pre-Transaction Privilege Access',description:'Employee viewed customer data shortly before transfer activity.',observedValue:'Access before transaction',expectedValue:'No unexplained pre-transfer access',weight:2.8,evidenceCategory:'TIMELINE'},
        {type:'BENEFICIARY_CHANGE',title:'Recent Beneficiary Modification',description:'Beneficiary changed shortly before the high-value transfer.',observedValue:'Recent beneficiary update',expectedValue:'Established beneficiary record',weight:2.5,evidenceCategory:'PRIVILEGE'},
        {type:'BASELINE_DEVIATION',title:'Peer Group Velocity Outlier',description:'Activity is materially above the illustrative peer baseline.',observedValue:'Synthetic high velocity',expectedValue:'Normal peer activity',weight:2,evidenceCategory:'ML'},
      ],
      recommendations: [
        {actionText:'Review employee privilege and access logs',category:'ACCESS_REVIEW',priority:'CRITICAL'},
        {actionText:'Validate beneficiary change with compliance',category:'CUSTOMER_VERIFICATION',priority:'HIGH'},
      ],
    },
    {
      code: 'ALT-8892',
      title: 'Transaction Structuring Pattern (< ₹5L Threshold)',
      severity: 'HIGH', status: 'IN_REVIEW', confidence: 'HIGH', exposure: 1455000,
      entityCode: 'ACC-1004-INR', entityType: 'ACCOUNT',
      summary: 'Three transfers of ₹4.85L, ₹4.90L, and ₹4.80L occur in a short window.',
      explanation: 'The combined amount and timing are consistent with a synthetic structuring scenario.',
      detection: 'RULE_STRUCTURING', scenario: 'SCEN-002: Structured Transaction Splitting',
      signals: [
        {type:'STRUCTURING',title:'Sub-Threshold Money Fragmentation',description:'Three transfers stay below the illustrative ₹5 lakh threshold.',observedValue:'₹14.55L in three transfers',expectedValue:'Explainable, consistent payment pattern',weight:3,evidenceCategory:'TRANSACTION'},
        {type:'BASELINE_DEVIATION',title:'Account Velocity Spike',description:'Transaction volume is unusually high in the sample window.',observedValue:'Short-window cluster',expectedValue:'Typical daily volume',weight:2.2,evidenceCategory:'ML'},
      ],
      recommendations: [
        {actionText:'Review related transfers and supporting invoices',category:'ACCESS_REVIEW',priority:'HIGH'},
        {actionText:'Escalate the pattern to compliance for review',category:'CUSTOMER_VERIFICATION',priority:'HIGH'},
      ],
    },
    {
      code: 'ALT-8893',
      title: 'Profile & Access Mismatch: Junior Teller HNW Access',
      severity: 'MEDIUM', status: 'OPEN', confidence: 'MEDIUM', exposure: 8900000,
      entityCode: 'EMP-1003', entityType: 'EMPLOYEE',
      summary: 'Retail Teller activity touches a corporate investment account outside the expected work pattern.',
      explanation: 'The role-to-account relationship needs review before deciding whether activity is legitimate.',
      detection: 'PROFILE_PRIVILEGE_ANALYSIS', scenario: 'SCEN-004: Profile Mismatch',
      signals: [
        {type:'BASELINE_DEVIATION',title:'Role-to-Entity Mismatch',description:'Retail teller activity targets a corporate investment portfolio.',observedValue:'Retail role and corporate target',expectedValue:'Assigned retail accounts',weight:2.4,evidenceCategory:'PRIVILEGE'},
      ],
      recommendations: [
        {actionText:'Confirm business justification for the account access',category:'ACCESS_REVIEW',priority:'MEDIUM'},
      ],
    },
  ] as const;

  const alerts: Record<string, { id: string }> = {};
  for (const a of alertRows) {
    const existing = await prisma.alert.findUnique({ where: { alertCode: a.code } });
    if (existing) {
      alerts[a.code] = existing;
      continue;
    }
    const primaryEntityId =
      a.entityType === 'ACCOUNT' ? accounts[a.entityCode].id : employees[a.entityCode].id;
    alerts[a.code] = await prisma.alert.create({
      data: {
        alertCode:a.code,title:a.title,severity:a.severity,status:a.status,
        confidence:a.confidence,financialExposure:a.exposure,
        primaryEntityId,primaryEntityType:a.entityType,
        summary:a.summary,riskExplanation:a.explanation,detectionMethod:a.detection,
        scenarioName:a.scenario,
        signals:{create:a.signals.map(s=>({...s}))},
        recommendations:{create:a.recommendations.map(r=>({...r}))},
      },
    });
  }

  const cases = [
    { code:'CASE-2026-001', alert:'ALT-8891', title:'Investigation: Insider Access & Circular Routing', severity:'CRITICAL', investigator:'Rahul Sharma', summary:'Review employee access, beneficiary changes, and the illustrative circular transfer pattern.', evidenceType:'GRAPH_RELATIONSHIP' },
    { code:'CASE-2026-002', alert:'ALT-8892', title:'Investigation: Sub-Threshold Transfer Cluster', severity:'HIGH', investigator:'Rahul Sharma', summary:'Review the three related transfers and establish whether there is a legitimate explanation.', evidenceType:'TRANSACTION' },
    { code:'CASE-2026-003', alert:'ALT-8893', title:'Investigation: Employee Profile Mismatch', severity:'MEDIUM', investigator:'Rahul Sharma', summary:'Review the role-to-account relationship and associated access activity.', evidenceType:'EMPLOYEE_ACTIVITY' },
  ] as const;

  for (const c of cases) {
    let record = await prisma.case.findUnique({ where: { caseCode: c.code } });
    if (!record) {
      record = await prisma.case.create({
        data: {
          caseCode:c.code,title:c.title,severity:c.severity,status:'OPEN',
          assignedInvestigator:c.investigator,summary:c.summary,
          recommendationsJson:JSON.stringify([{text:'Review linked alert evidence',done:false},{text:'Record investigative conclusion',done:false}]),
          evidenceItems:{create:[{
            evidenceType:c.evidenceType,
            title:'Synthetic demo evidence',
            contentJson:JSON.stringify({source:'DEMO_DATA',alertCode:c.alert,simulated:true,summary:c.summary}),
            timestamp:new Date(),
          }]},
        },
      });
    }
    await prisma.caseAlert.upsert({
      where:{caseId_alertId:{caseId:record.id,alertId:alerts[c.alert].id}},
      update:{},
      create:{caseId:record.id,alertId:alerts[c.alert].id},
    });
    const priorLog = await prisma.auditLog.findFirst({
      where:{action:'CASE_CREATED',targetId:c.code},
    });
    if (!priorLog) {
      await prisma.auditLog.create({
        data:{
          actorId:'DEMO-SEED',actorName:'TrustLine Demo Loader',
          action:'CASE_CREATED',targetType:'CASE',targetId:c.code,
          details:`Created synthetic demo investigation ${c.code}.`,
          caseId:record.id,
        },
      });
    }
  }

  // Add representative employee activity without duplicating it on reruns.
  const activity = [
    {employeeCode:'EMP-1001',entityType:'CUSTOMER',entityCode:'CUST-8001',accessType:'VIEW',ipAddress:'192.168.1.104'},
    {employeeCode:'EMP-1001',entityType:'ACCOUNT',entityCode:'ACC-1006-INR',accessType:'BENEFICIARY_UPDATE',ipAddress:'192.168.1.104'},
    {employeeCode:'EMP-1004',entityType:'CUSTOMER',entityCode:'CUST-8004',accessType:'VIEW',ipAddress:'10.0.12.88'},
  ] as const;

  for (const x of activity) {
    const entityId = x.entityType === 'CUSTOMER'
      ? customers[x.entityCode].id : accounts[x.entityCode].id;
    const found = await prisma.accessEvent.findFirst({
      where:{employeeId:employees[x.employeeCode].id,entityId,accessType:x.accessType},
    });
    if (!found) {
      await prisma.accessEvent.create({
        data:{
          employeeId:employees[x.employeeCode].id,entityType:x.entityType,
          entityId,accessType:x.accessType,ipAddress:x.ipAddress,
          timestamp:new Date(Date.now()-45*60_000),
        },
      });
    }
  }

  const actions = [
    {employeeCode:'EMP-1001',actionType:'BENEFICIARY_CHANGE',targetType:'ACCOUNT',targetId:accounts['ACC-1006-INR'].id,detailsJson:JSON.stringify({oldBeneficiary:'Unknown Inc',newBeneficiary:'Trident FinTech Consulting',simulated:true})},
    {employeeCode:'EMP-1004',actionType:'OVERRIDE_LIMIT',targetType:'CUSTOMER',targetId:customers['CUST-8004'].id,detailsJson:JSON.stringify({reason:'Synthetic demo scenario',simulated:true})},
  ];
  for (const a of actions) {
    const found = await prisma.employeeAction.findFirst({
      where:{employeeId:employees[a.employeeCode].id,actionType:a.actionType,targetId:a.targetId},
    });
    if (!found) {
      await prisma.employeeAction.create({
        data:{...a,employeeId:employees[a.employeeCode].id,timestamp:new Date(Date.now()-40*60_000)},
      });
    }
  }

  const [employeeCount,customerCount,accountCount,transactionCount,alertCount,caseCount] =
    await Promise.all([
      prisma.employee.count(),prisma.customer.count(),prisma.account.count(),
      prisma.transaction.count(),prisma.alert.count(),prisma.case.count(),
    ]);

  await prisma.auditLog.create({
    data: {
      actorId: 'DEMO-SEED',
      actorName: 'TrustLine Demo Loader',
      action: 'DEMO_DATA_BOOTSTRAP_COMPLETED',
      targetType: 'SYSTEM',
      targetId: 'trustline-demo-data-v1',
      details: 'Synthetic TrustLine demonstration data loaded successfully.',
    },
  });

  console.log('Demo-data bootstrap completed. Synthetic records only; no financial transfers were executed.');
  console.log(JSON.stringify({employeeCount,customerCount,accountCount,transactionCount,alertCount,caseCount},null,2));
}

main()
  .catch((error) => {
    console.error('Demo-data bootstrap failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
