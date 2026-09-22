export type RiskCategory = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type AssessmentStatus =
    | 'RECEIVED'
    | 'TRANSCRIBING'
    | 'ANALYSING'
    | 'ASSESSMENT_READY'
    | 'COMPLETE';

export type IndicatorType =
    | 'fear'
    | 'intimidation'
    | 'vulnerability'
    | 'depression'
    | 'suicide'
    | 'isolation'
    | 'trauma'
    | 'coercion'
    | 'threat';

export interface TranscriptItem {
    id?: string;
    timestamp: string; // "MM:SS"
    speaker: 'Caller' | 'Operator';
    text: string;
    translatedText?: string;
    indicator?: {
        type: IndicatorType;
        label: string;
        severity: 'LOW' | 'MEDIUM' | 'HIGH';
    };
}

export interface SpeechMetrics {
    speakingRate: 'Slow' | 'Normal' | 'Elevated' | 'Slurred' | 'Fast';
    pauseFrequency: 'Low' | 'Medium' | 'High';
    longPauses: number;
    pitchVariation: 'Low' | 'Medium' | 'High';
    voiceEnergy: 'Low' | 'Medium' | 'High';
    speechStress: 'Low' | 'Medium' | 'High';
    emotionalSignal: string;
    pitchWaveform: number[]; // relative wave amplitude/pitch points (0-100)
    pauseSequence: boolean[]; // true = pause, false = vocalized
    speechStressValue: number; // 0-100
}

export interface VulnerabilityMetric {
    label: string;
    key: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    confidence: number; // 0-100
    description?: string;
}

export interface EmotionMetric {
    name: string;
    level: 'LOW' | 'MEDIUM' | 'HIGH';
    value: number; // 0-100
}

export interface ExplainabilityPoint {
    id: string;
    title: string;
    description: string;
    evidence: string;
    category?: 'Acoustic' | 'Linguistic' | 'Contextual';
    timestamp?: string;
}

export interface SviFactorBreakdown {
    acousticStressScore: number; // 0-100 (35% weight)
    linguisticVulnerabilityScore: number; // 0-100 (40% weight)
    emotionalInstabilityScore: number; // 0-100 (25% weight)
}

export interface OperatorReview {
    isReviewed: boolean;
    confirmedRisk?: RiskCategory;
    overrideReason?: string;
    flagged: boolean;
    notes: string;
    reviewedBy?: string;
    reviewedAt?: string;
    emergencyDispatched?: boolean;
    dispatchDetails?: {
        unit: string;
        dispatchedAt: string;
        priority: 'STANDARD' | 'URGENT' | 'IMMEDIATE_INTERVENTION';
    };
}

export interface CaseAssessment {
    id: string;
    time: string;
    date?: string;
    language: string;
    duration: string;
    svi: number; // 0-100 composite Stress Vulnerability Index
    risk: RiskCategory;
    status: AssessmentStatus;
    confidence: number; // 0-100 percentage
    factorBreakdown?: SviFactorBreakdown;
    speechMetrics: SpeechMetrics;
    emotions: EmotionMetric[];
    vulnerabilities: VulnerabilityMetric[];
    transcript: TranscriptItem[];
    explainability: ExplainabilityPoint[];
    operatorReview?: OperatorReview;
    callerIdMasked?: string;
    locationMasked?: string;
}

export interface Operator {
    id: string;
    name: string;
    email: string;
    role?: string;
    department?: string;
    avatarUrl?: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    operator: Operator | null;
}

export interface SystemThresholds {
    lowThreshold: number; // default 0-25
    moderateThreshold: number; // default 26-50
    highThreshold: number; // default 51-75
    criticalThreshold: number; // default 76-100
    autoAlertOnCritical: boolean;
    soundAlertsEnabled: boolean;
}
