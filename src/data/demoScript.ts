import type { SviFactorBreakdown } from '../types';

export interface CallerScriptWord {
    id: string;
    word: string;
    startMs: number;
    endMs: number;
    targetSvi: number;
    targetConfidence: number;
    domain?: string;
    stress?: string;
    directive?: string;
}

export interface CallerScriptLine {
    id: string;
    secondOffset: number;
    startMs?: number;
    endMs?: number;
    text: string;
    englishTranslation: string;
    indicatorTag: string;
    severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
    words?: CallerScriptWord[];
}

export interface EmergencyCallScenario {
    callId: string;
    callerNumber: string;
    callerLocation: string;
    dialect: string;
    durationSec: number;
    lines: CallerScriptLine[];
    assessment: {
        svi: number;
        risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
        confidence: number;
        vulnerabilityDomain: string;
        stressLevel: string;
        recommendedAction: string;
        factorBreakdown: SviFactorBreakdown;
    };
}

export const OFFICIAL_CALLER_SCENARIO: EmergencyCallScenario = {
    callId: 'NHAA-2026-9142',
    callerNumber: '+91 98451-XXXXX',
    callerLocation: 'Rural District, Village Ward 3',
    dialect: 'Hindi (ग्रामीण हिंदी)',
    durationSec: 63,
    lines: [
        {
            id: 'c-1',
            secondOffset: 6.0,
            startMs: 6000,
            endMs: 12000,
            text: 'सर, मैं अपनी कास्ट को लेकर हो रहे डिस्क्रिमिनेशन और हैरेसमेंट की कंप्लेंट करना चाहता हूँ।',
            englishTranslation: 'Sir, I want to file a complaint regarding caste discrimination and harassment against me.',
            indicatorTag: 'Caste Discrimination & Harassment Report',
            severity: 'MEDIUM',
            words: [
                { id: 'w1-1', word: 'सर,', startMs: 6000, endMs: 6300, targetSvi: 4, targetConfidence: 10, domain: 'Voice Stream Ingestion • Personal Statement', stress: 'Speech detected • Normative cadence with acoustic flutter (12% stress)', directive: 'Logging initial caller speech packets • Monitoring tone' },
                { id: 'w1-2', word: 'मैं', startMs: 6300, endMs: 6600, targetSvi: 8, targetConfidence: 16 },
                { id: 'w1-3', word: 'अपनी', startMs: 6600, endMs: 6950, targetSvi: 12, targetConfidence: 22 },
                { id: 'w1-4', word: 'कास्ट', startMs: 6950, endMs: 7450, targetSvi: 20, targetConfidence: 35, domain: 'Demographic Dimension • Caste Sensitivity Detected', stress: 'Elevated pitch strain & pitch instability detected (35% stress)', directive: 'Caste dimension identified • Ingesting offense particulars' },
                { id: 'w1-5', word: 'को', startMs: 7450, endMs: 7750, targetSvi: 23, targetConfidence: 39 },
                { id: 'w1-6', word: 'लेकर', startMs: 7750, endMs: 8150, targetSvi: 26, targetConfidence: 43 },
                { id: 'w1-7', word: 'हो', startMs: 8150, endMs: 8450, targetSvi: 29, targetConfidence: 47 },
                { id: 'w1-8', word: 'रहे', startMs: 8450, endMs: 8850, targetSvi: 32, targetConfidence: 51, domain: 'Ongoing Harassment Pattern Emerging', stress: 'Acoustic strain building • Rhythmic distress (48% stress)' },
                { id: 'w1-9', word: 'डिस्क्रिमिनेशन', startMs: 8850, endMs: 9500, targetSvi: 40, targetConfidence: 62, domain: 'Caste-based Discrimination Indicated', stress: 'Audible vocal tremor • Social vulnerability distress (58% stress)', directive: 'SC/ST Protection protocol triggered • Log offense particulars' },
                { id: 'w1-10', word: 'और', startMs: 9500, endMs: 9800, targetSvi: 43, targetConfidence: 66 },
                { id: 'w1-11', word: 'हैरेसमेंट', startMs: 9800, endMs: 10450, targetSvi: 46, targetConfidence: 72, domain: 'Caste-based Discrimination & Atrocity Harassment', stress: 'Acute vocal tremor & emotional quiver detected (68% stress)', directive: 'SC/ST (PoA) statutory violation logged • Prepare QRT standby' },
                { id: 'w1-12', word: 'की', startMs: 10450, endMs: 10750, targetSvi: 47, targetConfidence: 74 },
                { id: 'w1-13', word: 'कंप्लेंट', startMs: 10750, endMs: 11300, targetSvi: 48, targetConfidence: 76, domain: 'Caste Discrimination & Harassment Complaint', stress: 'Formal complaint intent registered • High acoustic distress (74% stress)', directive: 'Log caller incident statement and verify immediate physical safety.' },
                { id: 'w1-14', word: 'करना', startMs: 11300, endMs: 11550, targetSvi: 48, targetConfidence: 77 },
                { id: 'w1-15', word: 'चाहता', startMs: 11550, endMs: 11800, targetSvi: 48, targetConfidence: 78 },
                { id: 'w1-16', word: 'हूँ।', startMs: 11800, endMs: 12000, targetSvi: 48, targetConfidence: 78, domain: 'Caste Discrimination & Harassment Complaint', stress: 'Statement 1 concluded • Auditory tremor verified (74% stress)', directive: 'Statement 1 logged. Interrogate perpetrator specifics and village location.' }
            ]
        },
        {
            id: 'c-2',
            secondOffset: 16.0,
            startMs: 16000,
            endMs: 25000,
            text: 'सर, मेरे गाँव में लोग मुझे कास्ट को लेकर इंसल्ट करते हैं और मेरे फैमिली को भी धमकी देते हैं। कुछ दिन पहले मेरे भाई के साथ मारपीट भी हुई।',
            englishTranslation: 'Sir, people in my village insult me over my caste and threaten my family. A few days ago, my brother was physically assaulted.',
            indicatorTag: 'Physical Assault & Threats to Family',
            severity: 'HIGH',
            words: [
                { id: 'w2-1', word: 'सर,', startMs: 16000, endMs: 16250, targetSvi: 49, targetConfidence: 79 },
                { id: 'w2-2', word: 'मेरे', startMs: 16250, endMs: 16500, targetSvi: 50, targetConfidence: 79 },
                { id: 'w2-3', word: 'गाँव', startMs: 16500, endMs: 16800, targetSvi: 51, targetConfidence: 80 },
                { id: 'w2-4', word: 'में', startMs: 16800, endMs: 17050, targetSvi: 52, targetConfidence: 80 },
                { id: 'w2-5', word: 'लोग', startMs: 17050, endMs: 17350, targetSvi: 53, targetConfidence: 81 },
                { id: 'w2-6', word: 'मुझे', startMs: 17350, endMs: 17650, targetSvi: 54, targetConfidence: 81 },
                { id: 'w2-7', word: 'कास्ट', startMs: 17650, endMs: 17950, targetSvi: 55, targetConfidence: 81, domain: 'Targeted Village Caste Intimidation' },
                { id: 'w2-8', word: 'को', startMs: 17950, endMs: 18200, targetSvi: 56, targetConfidence: 82 },
                { id: 'w2-9', word: 'लेकर', startMs: 18200, endMs: 18500, targetSvi: 57, targetConfidence: 82 },
                { id: 'w2-10', word: 'इंसल्ट', startMs: 18500, endMs: 18850, targetSvi: 60, targetConfidence: 83, domain: 'Public Humiliation & Village Harassment', stress: 'Heightened pitch tremor & social humiliation distress (62% stress)' },
                { id: 'w2-11', word: 'करते', startMs: 18850, endMs: 19150, targetSvi: 61, targetConfidence: 84 },
                { id: 'w2-12', word: 'हैं', startMs: 19150, endMs: 19400, targetSvi: 62, targetConfidence: 84 },
                { id: 'w2-13', word: 'और', startMs: 19400, endMs: 19650, targetSvi: 63, targetConfidence: 84 },
                { id: 'w2-14', word: 'मेरे', startMs: 19650, endMs: 19900, targetSvi: 64, targetConfidence: 85 },
                { id: 'w2-15', word: 'फैमिली', startMs: 19900, endMs: 20300, targetSvi: 66, targetConfidence: 85, domain: 'Threats Directed at Family Members', stress: 'Acute emotional tremor • Family endangerment strain (68% stress)' },
                { id: 'w2-16', word: 'को', startMs: 20300, endMs: 20550, targetSvi: 67, targetConfidence: 85 },
                { id: 'w2-17', word: 'भी', startMs: 20550, endMs: 20800, targetSvi: 68, targetConfidence: 86 },
                { id: 'w2-18', word: 'धमकी', startMs: 20800, endMs: 21250, targetSvi: 70, targetConfidence: 86, domain: 'Direct Intimidation & Retaliatory Threats', stress: 'Voice quiver spiking • Active threat of bodily harm (72% stress)', directive: 'Direct threats identified. Alert Police Control Room for patrol standby.' },
                { id: 'w2-19', word: 'देते', startMs: 21250, endMs: 21550, targetSvi: 71, targetConfidence: 86 },
                { id: 'w2-20', word: 'हैं।', startMs: 21550, endMs: 21850, targetSvi: 72, targetConfidence: 87 },
                { id: 'w2-21', word: 'कुछ', startMs: 21850, endMs: 22150, targetSvi: 72, targetConfidence: 87 },
                { id: 'w2-22', word: 'दिन', startMs: 22150, endMs: 22400, targetSvi: 73, targetConfidence: 87 },
                { id: 'w2-23', word: 'पहले', startMs: 22400, endMs: 22700, targetSvi: 73, targetConfidence: 87 },
                { id: 'w2-24', word: 'मेरे', startMs: 22700, endMs: 23000, targetSvi: 74, targetConfidence: 87 },
                { id: 'w2-25', word: 'भाई', startMs: 23000, endMs: 23350, targetSvi: 75, targetConfidence: 88, domain: 'Physical Assault & Direct Threat to Family' },
                { id: 'w2-26', word: 'के', startMs: 23350, endMs: 23600, targetSvi: 75, targetConfidence: 88 },
                { id: 'w2-27', word: 'साथ', startMs: 23600, endMs: 23900, targetSvi: 76, targetConfidence: 88 },
                { id: 'w2-28', word: 'मारपीट', startMs: 23900, endMs: 24450, targetSvi: 76, targetConfidence: 88, domain: 'Physical Assault & Retaliatory Violence', stress: 'Critical vocal strain & acute panic tremor (76% stress)', directive: 'Active physical assault confirmed. Prepare Police PCR / 112 QRT handover.' },
                { id: 'w2-29', word: 'भी', startMs: 24450, endMs: 24700, targetSvi: 76, targetConfidence: 88 },
                { id: 'w2-30', word: 'हुई।', startMs: 24700, endMs: 25000, targetSvi: 76, targetConfidence: 88, domain: 'Physical Assault & Direct Threats to Family', stress: 'Heightened Pitch & Acute Vocal Tremor • Physical Violence (76% stress)', directive: 'Active violence detected. Authorize emergency handover to Police Department.' }
            ]
        },
        {
            id: 'c-3',
            secondOffset: 28.7,
            startMs: 28700,
            endMs: 34000,
            text: 'जी सर, मैंने कंप्लेंट की थी, लेकिन अभी तक कोई एक्शन नहीं हुआ। सर, अब मैं आगे क्या कर सकता हूँ?',
            englishTranslation: 'Yes sir, I filed a complaint, but no action has been taken so far. Sir, what can I do now?',
            indicatorTag: 'Unaddressed Prior Complaint & Institutional Helplessness',
            severity: 'HIGH',
            words: [
                { id: 'w3-1', word: 'जी', startMs: 28700, endMs: 28900, targetSvi: 76, targetConfidence: 88 },
                { id: 'w3-2', word: 'सर,', startMs: 28900, endMs: 29150, targetSvi: 76, targetConfidence: 88 },
                { id: 'w3-3', word: 'मैंने', startMs: 29150, endMs: 29400, targetSvi: 77, targetConfidence: 88 },
                { id: 'w3-4', word: 'कंप्लेंट', startMs: 29400, endMs: 29800, targetSvi: 77, targetConfidence: 89, domain: 'Prior Statutory Complaint Record' },
                { id: 'w3-5', word: 'की', startMs: 29800, endMs: 30000, targetSvi: 78, targetConfidence: 89 },
                { id: 'w3-6', word: 'थी,', startMs: 30000, endMs: 30250, targetSvi: 78, targetConfidence: 89 },
                { id: 'w3-7', word: 'लेकिन', startMs: 30250, endMs: 30550, targetSvi: 79, targetConfidence: 89 },
                { id: 'w3-8', word: 'अभी', startMs: 30550, endMs: 30800, targetSvi: 79, targetConfidence: 90 },
                { id: 'w3-9', word: 'तक', startMs: 30800, endMs: 31000, targetSvi: 80, targetConfidence: 90 },
                { id: 'w3-10', word: 'कोई', startMs: 31000, endMs: 31250, targetSvi: 80, targetConfidence: 90 },
                { id: 'w3-11', word: 'एक्शन', startMs: 31250, endMs: 31750, targetSvi: 81, targetConfidence: 90, domain: 'Administrative Inaction & Vulnerability Spike', stress: 'Frustration tremor & vulnerability escalation (79% stress)', directive: 'Inaction by local station documented. Escalate to DSP / SP Cell.' },
                { id: 'w3-12', word: 'नहीं', startMs: 31750, endMs: 32000, targetSvi: 81, targetConfidence: 90 },
                { id: 'w3-13', word: 'हुआ।', startMs: 32000, endMs: 32300, targetSvi: 81, targetConfidence: 90 },
                { id: 'w3-14', word: 'सर,', startMs: 32300, endMs: 32550, targetSvi: 81, targetConfidence: 91 },
                { id: 'w3-15', word: 'अब', startMs: 32550, endMs: 32800, targetSvi: 82, targetConfidence: 91 },
                { id: 'w3-16', word: 'मैं', startMs: 32800, endMs: 33050, targetSvi: 82, targetConfidence: 91 },
                { id: 'w3-17', word: 'आगे', startMs: 33050, endMs: 33300, targetSvi: 82, targetConfidence: 91 },
                { id: 'w3-18', word: 'क्या', startMs: 33300, endMs: 33500, targetSvi: 82, targetConfidence: 91 },
                { id: 'w3-19', word: 'कर', startMs: 33500, endMs: 33650, targetSvi: 82, targetConfidence: 91 },
                { id: 'w3-20', word: 'सकता', startMs: 33650, endMs: 33850, targetSvi: 82, targetConfidence: 91 },
                { id: 'w3-21', word: 'हूँ?', startMs: 33850, endMs: 34000, targetSvi: 82, targetConfidence: 91, domain: 'Acute Helplessness & Vulnerability Exacerbation', stress: 'Despair inflection & acute psychological distress (81% stress)', directive: 'Reassure caller. Immediate nodal escalation activated.' }
            ]
        },
        {
            id: 'c-4',
            secondOffset: 40.0,
            startMs: 40000,
            endMs: 48500,
            text: 'सर, बहुत क्रिटिकल है। कुछ लोग अभी मेरे घर के बाहर खड़े हैं और हमें धमकी दे रहे हैं। हमें डर है कि वो अंदर आ सकते हैं।',
            englishTranslation: 'Sir, it is very critical. Some people are standing outside my house right now and threatening us. We are afraid they might break in.',
            indicatorTag: 'Active Mob Surrounding Residence & Immediate Breach Threat',
            severity: 'CRITICAL',
            words: [
                { id: 'w4-1', word: 'सर,', startMs: 40000, endMs: 40250, targetSvi: 83, targetConfidence: 91 },
                { id: 'w4-2', word: 'बहुत', startMs: 40250, endMs: 40550, targetSvi: 84, targetConfidence: 92 },
                { id: 'w4-3', word: 'क्रिटिकल', startMs: 40550, endMs: 41000, targetSvi: 85, targetConfidence: 92, domain: 'Critical Situation Escalation', stress: 'Elevated acoustic panic spike (86% stress)' },
                { id: 'w4-4', word: 'है।', startMs: 41000, endMs: 41250, targetSvi: 86, targetConfidence: 92 },
                { id: 'w4-5', word: 'कुछ', startMs: 41250, endMs: 41500, targetSvi: 86, targetConfidence: 92 },
                { id: 'w4-6', word: 'लोग', startMs: 41500, endMs: 41800, targetSvi: 87, targetConfidence: 93 },
                { id: 'w4-7', word: 'अभी', startMs: 41800, endMs: 42050, targetSvi: 87, targetConfidence: 93 },
                { id: 'w4-8', word: 'मेरे', startMs: 42050, endMs: 42300, targetSvi: 88, targetConfidence: 93 },
                { id: 'w4-9', word: 'घर', startMs: 42300, endMs: 42600, targetSvi: 88, targetConfidence: 93, domain: 'Direct Residential Threat & Mob Encirclement' },
                { id: 'w4-10', word: 'के', startMs: 42600, endMs: 42850, targetSvi: 89, targetConfidence: 94 },
                { id: 'w4-11', word: 'बाहर', startMs: 42850, endMs: 43200, targetSvi: 89, targetConfidence: 94 },
                { id: 'w4-12', word: 'खड़े', startMs: 43200, endMs: 43550, targetSvi: 90, targetConfidence: 94, stress: 'Immediate physical containment detected (90% stress)' },
                { id: 'w4-13', word: 'हैं', startMs: 43550, endMs: 43800, targetSvi: 90, targetConfidence: 94 },
                { id: 'w4-14', word: 'और', startMs: 43800, endMs: 44050, targetSvi: 90, targetConfidence: 94 },
                { id: 'w4-15', word: 'हमें', startMs: 44050, endMs: 44300, targetSvi: 91, targetConfidence: 95 },
                { id: 'w4-16', word: 'धमकी', startMs: 44300, endMs: 44750, targetSvi: 91, targetConfidence: 95, domain: 'Imminent Violence & Active Threat' },
                { id: 'w4-17', word: 'दे', startMs: 44750, endMs: 45000, targetSvi: 92, targetConfidence: 95 },
                { id: 'w4-18', word: 'रहे', startMs: 45000, endMs: 45250, targetSvi: 92, targetConfidence: 95 },
                { id: 'w4-19', word: 'हैं।', startMs: 45250, endMs: 45550, targetSvi: 92, targetConfidence: 95 },
                { id: 'w4-20', word: 'हमें', startMs: 45550, endMs: 45800, targetSvi: 93, targetConfidence: 96 },
                { id: 'w4-21', word: 'डर', startMs: 45800, endMs: 46150, targetSvi: 93, targetConfidence: 96, stress: 'Severe Terror & Hyperventilation Peaks (94% stress)' },
                { id: 'w4-22', word: 'है', startMs: 46150, endMs: 46400, targetSvi: 93, targetConfidence: 96 },
                { id: 'w4-23', word: 'कि', startMs: 46400, endMs: 46650, targetSvi: 93, targetConfidence: 96 },
                { id: 'w4-24', word: 'वो', startMs: 46650, endMs: 46900, targetSvi: 94, targetConfidence: 96 },
                { id: 'w4-25', word: 'अंदर', startMs: 46900, endMs: 47300, targetSvi: 94, targetConfidence: 97, domain: 'Imminent Residential Breach Threat' },
                { id: 'w4-26', word: 'आ', startMs: 47300, endMs: 47600, targetSvi: 94, targetConfidence: 97 },
                { id: 'w4-27', word: 'सकते', startMs: 47600, endMs: 48050, targetSvi: 94, targetConfidence: 97 },
                { id: 'w4-28', word: 'हैं।', startMs: 48050, endMs: 48500, targetSvi: 94, targetConfidence: 97, domain: 'Active Mob Encirclement & Imminent Home Invasion', stress: 'Critical Terror Peak • Accelerated Breathing & Quiver (95% stress)', directive: 'CODE RED DISPATCH: Priority 1 Armed QRT Intercept to Village Residence.' }
            ]
        },
        {
            id: 'c-5',
            secondOffset: 56.0,
            startMs: 56000,
            endMs: 60500,
            text: 'जी सर, प्लीज जल्दी भेजिए। हमें बहुत डर लग रहा है।',
            englishTranslation: 'Yes sir, please dispatch them quickly. We are extremely terrified.',
            indicatorTag: 'Urgent Police Intercept Plea & Extreme Fear',
            severity: 'CRITICAL',
            words: [
                { id: 'w5-1', word: 'जी', startMs: 56000, endMs: 56350, targetSvi: 94, targetConfidence: 97 },
                { id: 'w5-2', word: 'सर,', startMs: 56350, endMs: 56700, targetSvi: 95, targetConfidence: 97 },
                { id: 'w5-3', word: 'प्लीज', startMs: 56700, endMs: 57200, targetSvi: 95, targetConfidence: 97, domain: 'Urgent Police Intercept Plea' },
                { id: 'w5-4', word: 'जल्दी', startMs: 57200, endMs: 57700, targetSvi: 95, targetConfidence: 98, directive: 'Transmit live GPS coordinates to Field Unit PCR-12.' },
                { id: 'w5-5', word: 'भेजिए।', startMs: 57700, endMs: 58250, targetSvi: 95, targetConfidence: 98 },
                { id: 'w5-6', word: 'हमें', startMs: 58250, endMs: 58650, targetSvi: 96, targetConfidence: 98 },
                { id: 'w5-7', word: 'बहुत', startMs: 58650, endMs: 59050, targetSvi: 96, targetConfidence: 98 },
                { id: 'w5-8', word: 'डर', startMs: 59050, endMs: 59550, targetSvi: 96, targetConfidence: 98, stress: 'Acute terror & panic peak (96% stress)' },
                { id: 'w5-9', word: 'लग', startMs: 59550, endMs: 59900, targetSvi: 96, targetConfidence: 98 },
                { id: 'w5-10', word: 'रहा', startMs: 59900, endMs: 60250, targetSvi: 96, targetConfidence: 98 },
                { id: 'w5-11', word: 'है।', startMs: 60250, endMs: 60500, targetSvi: 96, targetConfidence: 98, domain: 'Emergency Intercept in Progress • Life Threat Containment', stress: 'Acute Terror & Panic Peaks • Ongoing Crisis Intervention (96% stress)', directive: 'Unit 112 QRT En Route (ETA 4 Mins) • Maintain Open Line with Caller.' }
            ]
        }
    ],
    assessment: {
        svi: 96,
        risk: 'CRITICAL',
        confidence: 98,
        vulnerabilityDomain: 'Active Mob Encirclement & Imminent Home Invasion',
        stressLevel: 'Critical Terror Peak • Accelerated Respiration & Vocal Quiver (96% stress)',
        recommendedAction: 'CODE RED DISPATCH: Priority 1 Armed QRT Intercept to Village Residence • Intercept in progress.',
        factorBreakdown: {
            acousticStressScore: 96,
            linguisticVulnerabilityScore: 94,
            emotionalInstabilityScore: 98
        }
    }
};

/**
 * Calculates continuous progressive distress metrics based on exact milliseconds elapsed
 * Constantly interpolates SVI and confidence rather than stepping in discrete chunks.
 */
export function getContinuousAssessment(elapsedMs: number, callStatus: 'WAITING' | 'CONNECTED' | 'ENDED') {
    if (callStatus === 'WAITING') {
        return {
            svi: 0,
            risk: 'NORMAL' as const,
            confidence: 0,
            vulnerabilityDomain: 'Awaiting Caller Statement...',
            stressLevel: 'Baseline audio frequency (0% distress)',
            recommendedAction: 'Awaiting incoming caller statement on emergency line.',
            badgeClass: 'bg-slate-700 text-white border-slate-600',
            scoreColor: 'text-slate-700',
            borderClass: 'border-slate-300',
            barPercent: 0,
            barColor: 'bg-slate-400'
        };
    }

    if (callStatus === 'ENDED') {
        return {
            svi: 96,
            risk: 'CRITICAL' as const,
            confidence: 98,
            vulnerabilityDomain: 'Active Mob Encirclement & Imminent Home Invasion',
            stressLevel: 'Critical Terror Peak • Accelerated Respiration & Vocal Quiver (96% stress)',
            recommendedAction: 'CODE RED DISPATCH: Priority 1 Armed QRT Intercept to Village Residence • Intercept in progress.',
            badgeClass: 'bg-red-700 text-white border-red-600',
            scoreColor: 'text-red-700',
            borderClass: 'border-red-600',
            barPercent: 96,
            barColor: 'bg-red-600'
        };
    }

    // Call is CONNECTED
    // Continuous points timeline for seamless linear interpolation:
    const points = [
        { timeMs: 0, svi: 0, conf: 0 },
        { timeMs: 5999, svi: 0, conf: 0 },
        // Statement 1: 6000ms - 12000ms
        { timeMs: 6300, svi: 4, conf: 10 },
        { timeMs: 6950, svi: 12, conf: 22 },
        { timeMs: 7450, svi: 20, conf: 35 },
        { timeMs: 8150, svi: 26, conf: 43 },
        { timeMs: 8850, svi: 32, conf: 51 },
        { timeMs: 9500, svi: 40, conf: 62 },
        { timeMs: 10450, svi: 46, conf: 72 },
        { timeMs: 11300, svi: 48, conf: 76 },
        { timeMs: 12000, svi: 48, conf: 78 },
        // Pause 12s - 16s
        { timeMs: 15999, svi: 48, conf: 78 },
        // Statement 2: 16000ms - 25000ms
        { timeMs: 16800, svi: 51, conf: 80 },
        { timeMs: 17650, svi: 55, conf: 81 },
        { timeMs: 18850, svi: 60, conf: 83 },
        { timeMs: 19900, svi: 64, conf: 85 },
        { timeMs: 20800, svi: 68, conf: 86 },
        { timeMs: 21550, svi: 71, conf: 86 },
        { timeMs: 23000, svi: 74, conf: 87 },
        { timeMs: 23900, svi: 76, conf: 88 },
        { timeMs: 25000, svi: 76, conf: 88 },
        // Pause 25s - 28.7s
        { timeMs: 28699, svi: 76, conf: 88 },
        // Statement 3: 28700ms - 34000ms
        { timeMs: 29400, svi: 77, conf: 89 },
        { timeMs: 30250, svi: 78, conf: 89 },
        { timeMs: 31250, svi: 80, conf: 90 },
        { timeMs: 32000, svi: 81, conf: 90 },
        { timeMs: 32800, svi: 82, conf: 91 },
        { timeMs: 34000, svi: 82, conf: 91 },
        // Pause 34s - 40s
        { timeMs: 39999, svi: 82, conf: 91 },
        // Statement 4: 40000ms - 48500ms
        { timeMs: 40550, svi: 84, conf: 92 },
        { timeMs: 41250, svi: 86, conf: 92 },
        { timeMs: 42300, svi: 88, conf: 93 },
        { timeMs: 43200, svi: 90, conf: 94 },
        { timeMs: 44300, svi: 91, conf: 95 },
        { timeMs: 45250, svi: 92, conf: 95 },
        { timeMs: 46150, svi: 93, conf: 96 },
        { timeMs: 47300, svi: 94, conf: 97 },
        { timeMs: 48500, svi: 94, conf: 97 },
        // Pause 48.5s - 56s
        { timeMs: 55999, svi: 94, conf: 97 },
        // Statement 5: 56000ms - 60500ms
        { timeMs: 57200, svi: 95, conf: 97 },
        { timeMs: 58250, svi: 95, conf: 98 },
        { timeMs: 59050, svi: 96, conf: 98 },
        { timeMs: 60500, svi: 96, conf: 98 }
    ];

    let svi = 0;
    let confidence = 0;

    if (elapsedMs <= 0) {
        svi = 0;
        confidence = 0;
    } else if (elapsedMs >= points[points.length - 1].timeMs) {
        svi = points[points.length - 1].svi;
        confidence = points[points.length - 1].conf;
    } else {
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            if (elapsedMs >= p1.timeMs && elapsedMs < p2.timeMs) {
                const fraction = (elapsedMs - p1.timeMs) / (p2.timeMs - p1.timeMs);
                svi = Math.round(p1.svi + (p2.svi - p1.svi) * fraction);
                confidence = Math.round(p1.conf + (p2.conf - p1.conf) * fraction);
                break;
            }
        }
    }

    // Dynamic Qualitative Readouts based on progress
    let vulnerabilityDomain = 'Awaiting Caller Statement...';
    let stressLevel = 'Audio Telemetry Active • Calibrating baseline frequency (0% distress)';
    let recommendedAction = 'Awaiting incoming caller statement on emergency line.';

    if (elapsedMs < 6000) {
        vulnerabilityDomain = 'Awaiting Caller Statement...';
        stressLevel = 'Audio Telemetry Active • Calibrating baseline frequency (0% distress)';
        recommendedAction = 'Awaiting incoming caller statement on emergency line.';
    } else if (elapsedMs < 7450) {
        vulnerabilityDomain = 'Voice Stream Ingestion • Personal Statement';
        stressLevel = 'Speech detected • Normative cadence with acoustic flutter (12% stress)';
        recommendedAction = 'Logging initial caller speech packets • Monitoring tone';
    } else if (elapsedMs < 8850) {
        vulnerabilityDomain = 'Demographic Dimension • Caste Sensitivity Detected';
        stressLevel = 'Elevated pitch strain & pitch instability detected (35% stress)';
        recommendedAction = 'Caste dimension identified • Ingesting offense particulars';
    } else if (elapsedMs < 9800) {
        vulnerabilityDomain = 'Caste-based Discrimination Indicated';
        stressLevel = 'Audible vocal quiver • Social vulnerability distress (58% stress)';
        recommendedAction = 'SC/ST Protection protocol triggered • Log offense particulars';
    } else if (elapsedMs < 12000) {
        vulnerabilityDomain = 'Caste-based Discrimination & Atrocity Harassment';
        stressLevel = 'Acute vocal tremor & emotional quiver detected (68% stress)';
        recommendedAction = 'SC/ST (PoA) statutory violation logged • Prepare QRT standby';
    } else if (elapsedMs < 16000) {
        vulnerabilityDomain = 'Caste Discrimination & Harassment Complaint';
        stressLevel = 'Statement 1 concluded • Auditory tremor verified (74% stress)';
        recommendedAction = 'Statement 1 logged. Interrogate perpetrator specifics and village location.';
    } else if (elapsedMs < 19900) {
        vulnerabilityDomain = 'Targeted Village Caste Intimidation & Public Humiliation';
        stressLevel = 'Heightened pitch tremor & social humiliation distress (64% stress)';
        recommendedAction = 'Log village harassment details • Prepare PCR dispatch';
    } else if (elapsedMs < 23900) {
        vulnerabilityDomain = 'Direct Threats Directed at Family Members';
        stressLevel = 'Voice quiver spiking • Active threat of bodily harm (72% stress)';
        recommendedAction = 'Direct threats identified. Alert Police Control Room for patrol standby.';
    } else if (elapsedMs < 28700) {
        vulnerabilityDomain = 'Physical Assault & Direct Threats to Family';
        stressLevel = 'Heightened Pitch & Acute Vocal Tremor • Physical Violence (76% stress)';
        recommendedAction = 'Active physical violence detected. Authorize emergency handover to Police Department.';
    } else if (elapsedMs < 32000) {
        vulnerabilityDomain = 'Administrative Inaction & Vulnerability Escalation';
        stressLevel = 'Frustration tremor & vulnerability escalation (79% stress)';
        recommendedAction = 'Inaction by local station documented. Escalate to DSP / SP Cell.';
    } else if (elapsedMs < 40000) {
        vulnerabilityDomain = 'Institutional Inaction & Acute Helplessness';
        stressLevel = 'Despair inflection & acute psychological distress (81% stress)';
        recommendedAction = 'Escalate to Superintending Police Officer & District Redressal Cell.';
    } else if (elapsedMs < 44300) {
        vulnerabilityDomain = 'Active Mob Surrounding Residence';
        stressLevel = 'Immediate physical containment detected (88% stress)';
        recommendedAction = 'Alert PCR intercept unit • Verify caller entry points security.';
    } else if (elapsedMs < 48500) {
        vulnerabilityDomain = 'Imminent Residential Breach & Critical Threat to Life';
        stressLevel = 'Severe Terror & Hyperventilation Peaks (94% stress)';
        recommendedAction = 'CODE RED DISPATCH: Priority 1 Armed QRT Intercept to Village Residence.';
    } else if (elapsedMs < 56000) {
        vulnerabilityDomain = 'Active Siege Protocol • Shelter-in-Place Enforced';
        stressLevel = 'Critical terror peak • Residential containment (94% stress)';
        recommendedAction = 'Field Unit PCR-12 dispatched. Instruct caller to shelter in secure room.';
    } else {
        vulnerabilityDomain = 'Emergency Intercept in Progress • Life Threat Containment';
        stressLevel = 'Acute Terror & Panic Peaks • Ongoing Crisis Intervention (96% stress)';
        recommendedAction = 'Unit 112 QRT En Route (ETA 4 Mins) • Maintain Open Line with Caller.';
    }

    // Risk classification styling
    let risk: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'NORMAL';
    let badgeClass = 'bg-slate-700 text-white border-slate-600';
    let scoreColor = 'text-slate-700';
    let borderClass = 'border-slate-300';
    let barColor = 'bg-slate-400';

    if (svi >= 81) {
        risk = 'CRITICAL';
        badgeClass = 'bg-red-700 text-white border-red-600';
        scoreColor = 'text-red-700';
        borderClass = 'border-red-600';
        barColor = 'bg-red-600';
    } else if (svi >= 61) {
        risk = 'HIGH';
        badgeClass = 'bg-orange-600 text-white border-orange-500';
        scoreColor = 'text-orange-700';
        borderClass = 'border-orange-500';
        barColor = 'bg-orange-500';
    } else if (svi >= 31) {
        risk = 'MODERATE';
        badgeClass = 'bg-amber-600 text-white border-amber-500';
        scoreColor = 'text-amber-700';
        borderClass = 'border-amber-400';
        barColor = 'bg-amber-500';
    }

    return {
        svi,
        risk,
        confidence,
        vulnerabilityDomain,
        stressLevel,
        recommendedAction,
        badgeClass,
        scoreColor,
        borderClass,
        barPercent: svi,
        barColor
    };
}

export const SAMPLE_PRE_RECORDED_CALLS: {
    id: string;
    title: string;
    fileName: string;
    duration: string;
    scenario: EmergencyCallScenario;
}[] = [
        {
            id: 'sample-1',
            title: 'Emergency Case #9142: Rural Caste Harassment & Direct Threat',
            fileName: 'ERSS_REC_9142_Hindi_Rural_Distress.mp3',
            duration: '00:24',
            scenario: OFFICIAL_CALLER_SCENARIO
        },
        {
            id: 'sample-2',
            title: 'Emergency Case #4810: Domestic Distress & Confinement',
            fileName: 'ERSS_REC_4810_Domestic_Violence_Triage.mp3',
            duration: '00:22',
            scenario: {
                callId: 'NHAA-2026-4810',
                callerNumber: '+91 88204-XXXXX',
                callerLocation: 'Suburban Sector 9, Apartment Complex',
                dialect: 'Bhojpuri / Eastern Hindi',
                durationSec: 22,
                lines: [
                    {
                        id: 'dom-1',
                        secondOffset: 2,
                        text: 'कृपया मेरी मदद करें... मुझे और मेरे बच्चों को पिछले दो दिन से कमरे में बंद कर रखा है।',
                        englishTranslation: 'Please help me... they have locked me and my children in a room for the past two days.',
                        indicatorTag: 'Social Confinement & Dependent Distress',
                        severity: 'CRITICAL'
                    },
                    {
                        id: 'dom-2',
                        secondOffset: 9,
                        text: 'दरवाजे के बाहर लगातार गालियां दी जा रही हैं और जान से मारने की बात कर रहे हैं।',
                        englishTranslation: 'They are constantly hurling abuse outside the door and talking about killing us.',
                        indicatorTag: 'Direct Verbal Abuse & Death Threat',
                        severity: 'CRITICAL'
                    },
                    {
                        id: 'dom-3',
                        secondOffset: 16,
                        text: 'बच्चों के लिए पानी भी नहीं है, मैं बहुत डरी हुई हूँ। तुरंत पुलिस भेजिए।',
                        englishTranslation: 'There is not even water for the children, I am terrified. Please dispatch police immediately.',
                        indicatorTag: 'Acute Deprivation & Immediate Police Requirement',
                        severity: 'CRITICAL'
                    }
                ],
                assessment: {
                    svi: 92,
                    risk: 'CRITICAL',
                    confidence: 96,
                    vulnerabilityDomain: 'Forced Confinement, Domestic Violence & Child Endangerment',
                    stressLevel: 'Extreme Voice Quiver, Accelerated Breathing & Panic Peaks (94%)',
                    recommendedAction: 'Code Red Dispatch: Immediate Mobile Police Patrol & Women & Child Helpline QRT Intervention.',
                    factorBreakdown: {
                        acousticStressScore: 94,
                        linguisticVulnerabilityScore: 93,
                        emotionalInstabilityScore: 89
                    }
                }
            }
        },
        {
            id: 'sample-3',
            title: 'Helpline Case #2011: Routine Public Inconvenience Inquiry',
            fileName: 'ERSS_REC_2011_Civil_Verification_Inquiry.mp3',
            duration: '00:18',
            scenario: {
                callId: 'NHAA-2026-2011',
                callerNumber: '+91 97112-XXXXX',
                callerLocation: 'Urban District Office, Main Road',
                dialect: 'Standard Hindi',
                durationSec: 18,
                lines: [
                    {
                        id: 'civ-1',
                        secondOffset: 2,
                        text: 'नमस्ते सर, मुझे अपने राशन कार्ड और आधार सत्यापन की स्थिति के बारे में जानकारी चाहिए थी।',
                        englishTranslation: 'Hello sir, I needed information regarding the status of my ration card and Aadhaar verification.',
                        indicatorTag: 'Public Welfare Verification Query',
                        severity: 'MEDIUM'
                    },
                    {
                        id: 'civ-2',
                        secondOffset: 10,
                        text: 'कार्यालय में खिड़की बंद थी, इसलिए हेल्पडेस्क पर कॉल करके पूछताछ कर रहा हूँ।',
                        englishTranslation: 'The office window was closed, so I am calling the helpdesk to inquire.',
                        indicatorTag: 'Administrative Counter Inconvenience',
                        severity: 'MEDIUM'
                    }
                ],
                assessment: {
                    svi: 18,
                    risk: 'LOW',
                    confidence: 91,
                    vulnerabilityDomain: 'Routine Administrative & Citizen Support Inquiry',
                    stressLevel: 'Calm Baseline Speech, Normative Pitch Range (14%)',
                    recommendedAction: 'Standard Civic Guidance: Route caller to District Administrative Portal or local Tehsil desk.',
                    factorBreakdown: {
                        acousticStressScore: 16,
                        linguisticVulnerabilityScore: 18,
                        emotionalInstabilityScore: 21
                    }
                }
            }
        }
    ];

