export type UserRole = 'EMPLOYEE' | 'INVESTIGATOR' | 'COMPLIANCE' | 'RISK_ANALYST' | 'ADMIN';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'OPEN' | 'IN_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'FALSE_POSITIVE';
export type ConfidenceLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AlertSignalDTO {
  id: string;
  type: string;
  title: string;
  description: string;
  observedValue: string;
  expectedValue?: string | null;
  weight: number;
  evidenceCategory: 'GRAPH' | 'TIMELINE' | 'TRANSACTION' | 'PRIVILEGE' | 'ML';
}

export interface RecommendationDTO {
  id: string;
  alertId: string;
  actionText: string;
  category: string;
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface AlertDTO {
  id: string;
  alertCode: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  confidence: ConfidenceLevel;
  financialExposure: number;
  primaryEntityId: string;
  primaryEntityType: string;
  summary: string;
  riskExplanation: string;
  detectionMethod: string;
  scenarioName?: string | null;
  createdAt: string;
  updatedAt: string;
  signals: AlertSignalDTO[];
  recommendations: RecommendationDTO[];
}

export interface MoneyFlowNode {
  id: string;
  label: string;
  type: 'EMPLOYEE' | 'CUSTOMER' | 'ACCOUNT' | 'TRANSACTION';
  details: {
    subText?: string;
    riskScore?: number;
    accountNumber?: string;
    customerType?: string;
    balance?: number;
    amount?: number;
    role?: string;
    privilege?: string;
  };
  isSuspicious?: boolean;
}

export interface MoneyFlowEdge {
  id: string;
  source: string;
  target: string;
  label: 'OWNS' | 'TRANSFERRED_TO' | 'INITIATED' | 'APPROVED' | 'ACCESSED' | 'MODIFIED' | 'LINKED_TO';
  amount?: number;
  isSuspicious?: boolean;
  timestamp?: string;
}

export interface DetectionResult {
  scenarioCode: string;
  name: string;
  type: string;
  isSuspicious: boolean;
  detectedAsSuspicious: boolean;
  detectionMethod: string;
  confidence: ConfidenceLevel;
  riskScore: number;
  signalsCount: number;
  matchedRules: string[];
}

export interface MetricsSummary {
  activeAlerts: number;
  criticalAlerts: number;
  highRiskCases: number;
  openInvestigations: number;
  suspiciousVolume: number;
  insiderRiskCount: number;
  falsePositiveRate: number;
  detectionAccuracy: number;
}
