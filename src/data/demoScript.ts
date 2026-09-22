export interface CallerScriptLine {
    id: string;
    secondOffset: number;
    text: string;
    englishTranslation: string;
    indicatorTag: string;
    severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
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
        risk: 'HIGH' | 'CRITICAL';
        confidence: number;
        vulnerabilityDomain: string;
        stressLevel: string;
        recommendedAction: string;
    };
}

export const OFFICIAL_CALLER_SCENARIO: EmergencyCallScenario = {
    callId: 'NHAA-2026-9142',
    callerNumber: '+91 98451-XXXXX',
    callerLocation: 'Rural District, Village Ward 3',
    dialect: 'Hindi (ग्रामीण हिंदी)',
    durationSec: 24,
    lines: [
        {
            id: 'c-1',
            secondOffset: 2,
            text: 'सर… मैं बहुत परेशान हूँ। मेरे गाँव में लोग मेरी जाति की वजह से मुझे लगातार परेशान और अपमानित कर रहे हैं।',
            englishTranslation: 'Sir… I am very troubled. People in my village are constantly harassing and humiliating me because of my caste.',
            indicatorTag: 'Caste-based Harassment & Humiliation',
            severity: 'HIGH'
        },
        {
            id: 'c-2',
            secondOffset: 8,
            text: 'सर, वे मेरे परिवार को भी धमकी देते हैं और कुछ दिन पहले मेरे भाई के साथ मारपीट भी की।',
            englishTranslation: 'Sir, they also threaten my family and a few days ago they beat up my brother.',
            indicatorTag: 'Physical Assault & Family Threat',
            severity: 'CRITICAL'
        },
        {
            id: 'c-3',
            secondOffset: 14,
            text: 'मैंने स्थानीय अधिकारियों से शिकायत की थी, लेकिन अभी तक कोई मदद नहीं मिली।',
            englishTranslation: 'I had complained to the local authorities, but haven\'t received any help yet.',
            indicatorTag: 'Systemic Neglect & Helplessness',
            severity: 'HIGH'
        },
        {
            id: 'c-4',
            secondOffset: 19,
            text: 'मुझे डर है कि बात और बिगड़ सकती है। मैं बस चाहता हूँ कि कोई हमारी मदद करे।',
            englishTranslation: 'I fear things could get even worse. I just want someone to help us.',
            indicatorTag: 'Fear of Imminent Escalation & Acute Vulnerability',
            severity: 'CRITICAL'
        }
    ],
    assessment: {
        svi: 86,
        risk: 'CRITICAL',
        confidence: 93,
        vulnerabilityDomain: 'Targeted Caste-based Violence & Physical Threat',
        stressLevel: 'Elevated Vocal Tremor & Suppressed Agitation (87%)',
        recommendedAction: 'Immediate District Special Cell Protection & Quick Response Team (QRT) field intervention authorized.'
    }
};
