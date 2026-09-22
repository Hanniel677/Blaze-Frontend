import type { SviFactorBreakdown } from '../types';

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
        recommendedAction: 'Immediate District Special Cell Protection & Quick Response Team (QRT) field intervention authorized.',
        factorBreakdown: {
            acousticStressScore: 88,
            linguisticVulnerabilityScore: 87,
            emotionalInstabilityScore: 82
        }
    }
};

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

