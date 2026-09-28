import { NextResponse } from 'next/server';

export async function GET() {
  const steps = [
    {
      time: '10:01 AM',
      actor: 'Employee Vikram Malhotra (EMP-1001)',
      action: 'CUSTOMER_PROFILE_ACCESS',
      target: 'Customer Karan Enterprise (CUST-8001)',
      severity: 'INFO',
      description: 'Employee logged into workstation and viewed customer profile outside scheduled audit window.',
      detectedSignals: [],
    },
    {
      time: '10:03 AM',
      actor: 'Employee Vikram Malhotra (EMP-1001)',
      action: 'BENEFICIARY_RECORD_UPDATE',
      target: 'Account ACC-1006-INR',
      severity: 'WARNING',
      description: 'Modified beneficiary record for Account ACC-1006-INR to Trident FinTech Consulting.',
      detectedSignals: ['PROFILE_MISMATCH'],
    },
    {
      time: '10:05 AM',
      actor: 'Karan Enterprise (ACC-1001-INR)',
      action: 'TRANSACTION_INITIATED',
      target: 'Account ACC-1002-INR',
      severity: 'WARNING',
      description: '₹15,000,000 wire transfer initiated via Net Banking portal.',
      detectedSignals: ['PROFILE_MISMATCH'],
    },
    {
      time: '10:06 AM',
      actor: 'Zenith Global (ACC-1002-INR)',
      action: 'TRANSACTION_SPLIT_STRUCTURING',
      target: 'Account ACC-1006-INR',
      severity: 'HIGH',
      description: 'Funds divided into sub-threshold transfers of ₹4.85L, ₹4.9L, ₹4.8L to evade CTR limit.',
      detectedSignals: ['PROFILE_MISMATCH', 'STRUCTURING'],
    },
    {
      time: '10:08 AM',
      actor: 'Trident FinTech (ACC-1006-INR)',
      action: 'RAPID_PASS_THROUGH',
      target: 'Account ACC-1001-INR',
      severity: 'CRITICAL',
      description: 'Pass-through transfer of ₹14.7L dispatched back to originating customer account ACC-1001.',
      detectedSignals: ['PROFILE_MISMATCH', 'STRUCTURING', 'CIRCULAR_FLOW'],
    },
    {
      time: '10:10 AM',
      actor: 'TRUSTLINE Risk Engine',
      action: 'CONNECTED_ALERT_GENERATION',
      target: 'Alert ALT-8891 (CRITICAL)',
      severity: 'CRITICAL',
      description: 'System automatically correlated 4 events: Profile Access + Beneficiary Change + Structuring + Circular Loop -> Generated ALT-8891.',
      detectedSignals: ['PROFILE_MISMATCH', 'STRUCTURING', 'CIRCULAR_FLOW', 'INSIDER_LINKAGE'],
    },
  ];

  return NextResponse.json({ scenarioCode: 'SCEN-SIM-01', steps });
}
