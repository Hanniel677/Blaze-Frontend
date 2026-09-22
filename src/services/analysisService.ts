import type { CaseAssessment, RiskCategory, AssessmentStatus, SystemThresholds, OperatorReview } from '../types';

export const DEFAULT_THRESHOLDS: SystemThresholds = {
    lowThreshold: 25,
    moderateThreshold: 50,
    highThreshold: 75,
    criticalThreshold: 100,
    autoAlertOnCritical: true,
    soundAlertsEnabled: true
};

const THRESHOLDS_KEY = 'sahaaya_thresholds';
const STORAGE_PREFIX = 'sahaaya_case_';
const QUEUE_KEY = 'sahaaya_cases_queue';

const initialMockCases: CaseAssessment[] = [
    {
        id: 'NHAA-1024',
        time: '10:42 AM',
        date: 'Today',
        language: 'Hindi',
        duration: '04:32',
        svi: 87,
        risk: 'CRITICAL',
        status: 'COMPLETE',
        confidence: 94,
        callerIdMasked: '+91 98XXX-XX102',
        locationMasked: 'North Zone, Sector 4',
        factorBreakdown: {
            acousticStressScore: 89,
            linguisticVulnerabilityScore: 92,
            emotionalInstabilityScore: 82
        },
        speechMetrics: {
            speakingRate: 'Elevated',
            pauseFrequency: 'High',
            longPauses: 7,
            pitchVariation: 'High',
            voiceEnergy: 'Low',
            speechStress: 'High',
            speechStressValue: 89,
            emotionalSignal: 'Fear / Acute Distress',
            pitchWaveform: [30, 45, 12, 85, 90, 15, 60, 75, 45, 20, 80, 70, 15, 88, 92, 10, 5, 40, 85, 95, 25, 65, 78, 40, 12, 75, 80, 18, 90, 85, 15],
            pauseSequence: [false, false, true, false, false, true, true, false, false, false, true, false, false, true, true, true, false, false, false, false, true, false, false, true, false, false, false, true, true, false, false]
        },
        emotions: [
            { name: 'Fear', level: 'HIGH', value: 95 },
            { name: 'Distress', level: 'HIGH', value: 90 },
            { name: 'Sadness', level: 'MEDIUM', value: 68 },
            { name: 'Anger', level: 'LOW', value: 15 },
            { name: 'Neutral', level: 'LOW', value: 5 }
        ],
        vulnerabilities: [
            { label: 'Severe Trauma', key: 'severe-trauma', severity: 'HIGH', confidence: 92, description: 'Direct verbal and acoustic evidence of acute emotional shock.' },
            { label: 'Fear & Perceived Danger', key: 'fear', severity: 'HIGH', confidence: 95, description: 'Explicit admissions of mortal dread and physical danger.' },
            { label: 'Intimidation & Coercion', key: 'intimidation', severity: 'HIGH', confidence: 91, description: 'External coercive actors silencing reporting attempts.' },
            { label: 'Social Confinement', key: 'social-isolation', severity: 'HIGH', confidence: 88, description: 'Restricted mobility with minor dependents.' },
            { label: 'Depression Indicators', key: 'depression', severity: 'MEDIUM', confidence: 68, description: 'Helplessness and prolonged fatigue.' },
            { label: 'Extreme Vulnerability', key: 'extreme-vulnerability', severity: 'HIGH', confidence: 88, description: 'Cumulative risk threshold breached across all axes.' },
            { label: 'Suicidal Ideation', key: 'suicidal-ideation', severity: 'LOW', confidence: 24, description: 'No explicit self-harm threats noted.' }
        ],
        transcript: [
            {
                id: 't-1',
                timestamp: '00:12',
                speaker: 'Caller',
                text: 'मुझे वापस घर जाने में बहुत डर लग रहा है।',
                translatedText: 'I am scared to go back home.',
                indicator: { type: 'fear', label: 'Acute Fear Indicator', severity: 'HIGH' }
            },
            {
                id: 't-2',
                timestamp: '00:15',
                speaker: 'Operator',
                text: 'क्या आप मुझे बता सकते हैं कि आप अभी कहाँ हैं? क्या आप किसी सुरक्षित स्थान पर हैं?',
                translatedText: 'Can you tell me where you are right now? Are you in a safe place?'
            },
            {
                id: 't-3',
                timestamp: '00:20',
                speaker: 'Caller',
                text: 'उन्होंने मुझे किसी को भी बताने से मना किया था। अगर पता चला तो...',
                translatedText: 'They told me not to tell anyone. If they find out...',
                indicator: { type: 'intimidation', label: 'Coercive Intimidation', severity: 'HIGH' }
            },
            {
                id: 't-4',
                timestamp: '00:25',
                speaker: 'Operator',
                text: 'आप मेरे साथ पूरी तरह सुरक्षित हैं। हम आपकी मदद के लिए यहाँ हैं।',
                translatedText: 'You are completely safe talking to me. We are here to support you.'
            },
            {
                id: 't-5',
                timestamp: '00:31',
                speaker: 'Caller',
                text: 'वे लगातार हमारे कमरे के बाहर आ रहे हैं।',
                translatedText: 'They keep coming right outside our room.',
                indicator: { type: 'vulnerability', label: 'Immediate Threat Proximity', severity: 'HIGH' }
            },
            {
                id: 't-6',
                timestamp: '00:36',
                speaker: 'Operator',
                text: 'मैं समझ रही हूँ। क्या आपके साथ अंदर कोई और भी है?',
                translatedText: 'I understand. Is there anyone else inside with you?'
            },
            {
                id: 't-7',
                timestamp: '00:42',
                speaker: 'Caller',
                text: 'मेरे बच्चे भी बहुत डरे हुए हैं। हम तीन दिनों से एक ही कमरे में बंद हैं।',
                translatedText: 'My children are also terrified. We have been locked in one room for 3 days.',
                indicator: { type: 'trauma', label: 'Severe Dependent Trauma', severity: 'HIGH' }
            }
        ],
        explainability: [
            { id: '01', title: 'Explicit Fear & Danger Admissions', description: 'Clear statement expressing terror of returning to home environment ("मुझे वापस घर जाने में बहुत डर लग रहा है").', evidence: '00:12 Transcript Statement', category: 'Linguistic', timestamp: '00:12' },
            { id: '02', title: 'Intimidation & Gagging Threats', description: 'Coercive language detected indicating severe external threats against seeking institutional help.', evidence: '00:20 Transcript Statement', category: 'Linguistic', timestamp: '00:20' },
            { id: '03', title: 'High Pitch Tremor & Vocal Instability', description: 'Fundamental frequency fluctuation and micro-tremor extraction index stress pressure at 89%.', evidence: 'Acoustic Signal Extraction', category: 'Acoustic', timestamp: '00:18' },
            { id: '04', title: 'Hesitancy Pauses Over 3.5 Seconds', description: '7 distinct prolonged latency intervals during sensitive narrative disclosures of threats.', evidence: 'Pause Cadence Analysis', category: 'Acoustic', timestamp: '00:30' },
            { id: '05', title: 'Dependent Vulnerability & Confinement', description: 'Mention of dependent children in distress and forced multi-day confinement.', evidence: '00:42 Transcript Statement', category: 'Contextual', timestamp: '00:42' }
        ]
    },
    {
        id: 'NHAA-1023',
        time: '10:36 AM',
        date: 'Today',
        language: 'Tamil',
        duration: '06:18',
        svi: 64,
        risk: 'HIGH',
        status: 'COMPLETE',
        confidence: 88,
        callerIdMasked: '+91 94XXX-XX874',
        locationMasked: 'South Zone, Ward 12',
        factorBreakdown: {
            acousticStressScore: 62,
            linguisticVulnerabilityScore: 70,
            emotionalInstabilityScore: 60
        },
        speechMetrics: {
            speakingRate: 'Normal',
            pauseFrequency: 'Medium',
            longPauses: 4,
            pitchVariation: 'Medium',
            voiceEnergy: 'Low',
            speechStress: 'Medium',
            speechStressValue: 62,
            emotionalSignal: 'Sadness / Depression',
            pitchWaveform: [20, 30, 25, 40, 45, 10, 22, 35, 45, 20, 50, 40, 15, 60, 55, 12, 8, 30, 55, 60, 20, 40, 50, 30, 10, 50, 45, 12, 55, 50, 10],
            pauseSequence: [false, false, true, false, false, false, true, false, false, false, true, false, false, true, false, true, false, false, false, false, true, false, false, false, false, false, false, true, true, false, false]
        },
        emotions: [
            { name: 'Fear', level: 'MEDIUM', value: 55 },
            { name: 'Distress', level: 'HIGH', value: 72 },
            { name: 'Sadness', level: 'HIGH', value: 85 },
            { name: 'Anger', level: 'LOW', value: 8 },
            { name: 'Neutral', level: 'LOW', value: 12 }
        ],
        vulnerabilities: [
            { label: 'Severe Trauma', key: 'severe-trauma', severity: 'MEDIUM', confidence: 64, description: 'Chronic emotional exhaustion noted.' },
            { label: 'Social Isolation', key: 'social-isolation', severity: 'HIGH', confidence: 89, description: 'Complete lack of local emergency social contacts.' },
            { label: 'Depression Indicators', key: 'depression', severity: 'HIGH', confidence: 82, description: 'Loss of hope, severe sleep disruption expressions.' },
            { label: 'Extreme Vulnerability', key: 'extreme-vulnerability', severity: 'MEDIUM', confidence: 60, description: 'Compounded isolation risk.' },
            { label: 'Fear', key: 'fear', severity: 'MEDIUM', confidence: 58, description: 'Anxiety over daily sustenance.' },
            { label: 'Suicidal Ideation', key: 'suicidal-ideation', severity: 'LOW', confidence: 32, description: 'Hopelessness markers flagged for proactive monitoring.' },
            { label: 'Intimidation', key: 'intimidation', severity: 'LOW', confidence: 18, description: 'No direct external threats identified.' }
        ],
        transcript: [
            {
                id: 't-1',
                timestamp: '00:10',
                speaker: 'Caller',
                text: 'நான் தனியாக இருக்கிறேன், யாரும் எனக்கு உதவ விரும்பவில்லை.',
                translatedText: 'I am all alone, and nobody wants to help me.',
                indicator: { type: 'isolation', label: 'Social Isolation Indicator', severity: 'HIGH' }
            },
            {
                id: 't-2',
                timestamp: '00:18',
                speaker: 'Operator',
                text: 'நான் உங்களுடன் இருக்கிறேன். தயவுசெய்து சொல்லுங்கள், உங்களுக்கு என்ன உதவி தேவை?',
                translatedText: 'I am here with you. Please share, what support do you need right now?'
            },
            {
                id: 't-3',
                timestamp: '00:26',
                speaker: 'Caller',
                text: 'தினமும் காலையில் எழும் போது எனக்கு எந்த நம்பிக்கையும் இல்லை. மிகவும் சோர்வாக இருக்கிறது.',
                translatedText: 'Every morning when I wake up I feel zero hope. I feel profoundly exhausted.',
                indicator: { type: 'depression', label: 'Depressive Despair Marker', severity: 'HIGH' }
            },
            {
                id: 't-4',
                timestamp: '00:35',
                speaker: 'Operator',
                text: 'அதை பகிர்ந்து கொண்டதற்கு நன்றி. உங்கள் குடும்பத்தினர் அல்லது நண்பர்கள் யாராவது அருகில் இருக்கிறார்களா?',
                translatedText: 'Thank you for sharing that with me. Are any family members or friends nearby?'
            },
            {
                id: 't-5',
                timestamp: '00:42',
                speaker: 'Caller',
                text: 'இல்லை, யாரும் இல்லை. நான் என்னை பூட்டிக்கொண்டேன்.',
                translatedText: 'No, no one. I have locked myself inside.',
                indicator: { type: 'isolation', label: 'Severe Self-Isolation', severity: 'HIGH' }
            }
        ],
        explainability: [
            { id: '01', title: 'Severe Social Isolation Language', description: 'Explicit admissions of having no emergency contacts or nearby network ("நான் தனியாக இருக்கிறேன்...").', evidence: '00:10 Transcript Statement', category: 'Linguistic', timestamp: '00:10' },
            { id: '02', title: 'Profound Hopelessness & Fatigue', description: 'Recurrent statements conveying severe chronic exhaustion and hopelessness.', evidence: '00:26 Transcript Statement', category: 'Linguistic', timestamp: '00:26' },
            { id: '03', title: 'Low Voice Energy & Flat Pitch', description: 'Flattened acoustic harmonic distribution consistent with acute depressive withdrawal.', evidence: 'Speech Signal Dynamics', category: 'Acoustic', timestamp: '00:20' }
        ]
    },
    {
        id: 'NHAA-1025',
        time: '10:14 AM',
        date: 'Today',
        language: 'Telugu',
        duration: '05:10',
        svi: 72,
        risk: 'HIGH',
        status: 'COMPLETE',
        confidence: 90,
        callerIdMasked: '+91 97XXX-XX331',
        locationMasked: 'East District, Block B',
        factorBreakdown: {
            acousticStressScore: 74,
            linguisticVulnerabilityScore: 78,
            emotionalInstabilityScore: 65
        },
        speechMetrics: {
            speakingRate: 'Fast',
            pauseFrequency: 'High',
            longPauses: 5,
            pitchVariation: 'High',
            voiceEnergy: 'Medium',
            speechStress: 'High',
            speechStressValue: 74,
            emotionalSignal: 'Panic / Coercion',
            pitchWaveform: [40, 60, 75, 80, 50, 45, 70, 85, 90, 65, 55, 70, 80, 85, 60, 40, 65, 80, 95, 70, 50, 65, 75, 80, 55, 45, 60, 70, 85, 60, 40],
            pauseSequence: [false, true, false, false, true, false, true, false, false, false, true, false, false, true, false, false, true, false, false, false, true, false, false, true, false, false, false, true, true, false, false]
        },
        emotions: [
            { name: 'Fear', level: 'HIGH', value: 84 },
            { name: 'Distress', level: 'HIGH', value: 80 },
            { name: 'Anger', level: 'MEDIUM', value: 45 },
            { name: 'Sadness', level: 'MEDIUM', value: 50 },
            { name: 'Neutral', level: 'LOW', value: 10 }
        ],
        vulnerabilities: [
            { label: 'Intimidation & Extortion', key: 'intimidation', severity: 'HIGH', confidence: 93, description: 'Credible financial threats and harassment calls.' },
            { label: 'Fear & Panic', key: 'fear', severity: 'HIGH', confidence: 86, description: 'Rapid agitated cadence indicating heightened fear.' },
            { label: 'Severe Trauma', key: 'severe-trauma', severity: 'HIGH', confidence: 78, description: 'Persistent psychological harassment.' },
            { label: 'Social Isolation', key: 'social-isolation', severity: 'MEDIUM', confidence: 55, description: 'Reluctant to confide in local peers.' },
            { label: 'Depression Indicators', key: 'depression', severity: 'MEDIUM', confidence: 48, description: 'Stress-induced sleep deprivation.' },
            { label: 'Extreme Vulnerability', key: 'extreme-vulnerability', severity: 'HIGH', confidence: 80, description: 'Imminent threat of reputational / physical harassment.' },
            { label: 'Suicidal Ideation', key: 'suicidal-ideation', severity: 'LOW', confidence: 15, description: 'Low indication.' }
        ],
        transcript: [
            {
                id: 't-1',
                timestamp: '00:08',
                speaker: 'Caller',
                text: 'నాకు నిరంతరం బెదిరింపు ఫోన్ కాల్స్ వస్తున్నాయి, నా ఫోటోలను ఆన్‌లైన్‌లో పెడతామని అంటున్నారు.',
                translatedText: 'I am getting non-stop extortion threats, saying they will post my photos online.',
                indicator: { type: 'intimidation', label: 'Extortion & Threat Indicator', severity: 'HIGH' }
            },
            {
                id: 't-2',
                timestamp: '00:16',
                speaker: 'Operator',
                text: 'దయచేసి ప్రశాంతంగా ఉండండి. మేము వెంటనే సైబర్ సహాయక విభాగానికి తెలియజేస్తాము. డబ్బులు ఏమైనా పంపారా?',
                translatedText: 'Please stay calm. We will notify the cyber assistance cell right away. Have you sent any money?'
            },
            {
                id: 't-3',
                timestamp: '00:24',
                speaker: 'Caller',
                text: 'నేను ఇప్పటికే అప్పు చేసి పంపాను, కానీ ఇంకా అడుగుతున్నారు. నా వద్ద ఏమీ లేదు.',
                translatedText: 'I already borrowed and paid them once, but they demand more. I have nothing left.',
                indicator: { type: 'vulnerability', label: 'Financial Coercion', severity: 'HIGH' }
            }
        ],
        explainability: [
            { id: '01', title: 'Direct Blackmail & Harassment Triggers', description: 'Caller reports active extortion threatening reputational harm and continuous intimidation.', evidence: '00:08 Transcript Statement', category: 'Linguistic', timestamp: '00:08' },
            { id: '02', title: 'High Speech Cadence & Rapid Pitch Surges', description: 'Voice jitter and rapid articulation rate indicate acute anxiety and agitation.', evidence: 'Acoustic Signal Extraction', category: 'Acoustic', timestamp: '00:12' }
        ]
    },
    {
        id: 'NHAA-1022',
        time: '10:31 AM',
        date: 'Today',
        language: 'English',
        duration: '03:41',
        svi: 28,
        risk: 'MODERATE',
        status: 'COMPLETE',
        confidence: 84,
        callerIdMasked: '+91 99XXX-XX412',
        locationMasked: 'Metro District, Phase 1',
        factorBreakdown: {
            acousticStressScore: 31,
            linguisticVulnerabilityScore: 30,
            emotionalInstabilityScore: 22
        },
        speechMetrics: {
            speakingRate: 'Normal',
            pauseFrequency: 'Low',
            longPauses: 2,
            pitchVariation: 'Medium',
            voiceEnergy: 'Medium',
            speechStress: 'Low',
            speechStressValue: 31,
            emotionalSignal: 'Anxiety / Overwhelmed',
            pitchWaveform: [15, 20, 18, 25, 30, 20, 25, 28, 30, 25, 22, 26, 20, 32, 35, 18, 12, 22, 30, 32, 20, 25, 28, 22, 12, 35, 30, 15, 32, 28, 12],
            pauseSequence: [false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false, false, false, false]
        },
        emotions: [
            { name: 'Fear', level: 'LOW', value: 25 },
            { name: 'Distress', level: 'MEDIUM', value: 48 },
            { name: 'Sadness', level: 'LOW', value: 30 },
            { name: 'Anger', level: 'LOW', value: 12 },
            { name: 'Neutral', level: 'HIGH', value: 65 }
        ],
        vulnerabilities: [
            { label: 'Social Isolation', key: 'social-isolation', severity: 'MEDIUM', confidence: 51, description: 'Recently relocated, limited local support.' },
            { label: 'Depression Indicators', key: 'depression', severity: 'MEDIUM', confidence: 45, description: 'Mild situational stress and fatigue.' },
            { label: 'Severe Trauma', key: 'severe-trauma', severity: 'LOW', confidence: 15, description: 'No acute trauma detected.' },
            { label: 'Fear', key: 'fear', severity: 'LOW', confidence: 22, description: 'Workplace anxiety.' },
            { label: 'Extreme Vulnerability', key: 'extreme-vulnerability', severity: 'LOW', confidence: 20, description: 'Stable coping mechanisms in place.' },
            { label: 'Suicidal Ideation', key: 'suicidal-ideation', severity: 'LOW', confidence: 10, description: 'No self-harm risk.' },
            { label: 'Intimidation', key: 'intimidation', severity: 'LOW', confidence: 8, description: 'None detected.' }
        ],
        transcript: [
            {
                id: 't-1',
                timestamp: '00:08',
                speaker: 'Caller',
                text: "Hi, I just moved to this city and I'm feeling very overwhelmed with my new job and living alone."
            },
            {
                id: 't-2',
                timestamp: '00:15',
                speaker: 'Operator',
                text: 'Hello. Moving is a massive transition. It is very natural to feel overwhelmed. Can you share what has felt most challenging?'
            },
            {
                id: 't-3',
                timestamp: '00:22',
                speaker: 'Caller',
                text: "Just the workload, and I don't really know anyone here yet. I feel quite disconnected at the end of the day.",
                indicator: { type: 'isolation', label: 'Situational Social Isolation', severity: 'MEDIUM' }
            },
            {
                id: 't-4',
                timestamp: '00:30',
                speaker: 'Operator',
                text: "That sounds challenging to carry alone. Connecting with local peer communities or wellness counselors can really help. Let's explore some gentle steps together."
            }
        ],
        explainability: [
            { id: '01', title: 'Situational Relocation Isolation', description: 'Caller expressed feeling disconnected and newly relocated, indicating moderate situational vulnerability.', evidence: '00:22 Transcript Statement', category: 'Linguistic', timestamp: '00:22' },
            { id: '02', title: 'Controlled Acoustic Parameters', description: 'Speech rate, vocal energy and pitch dynamics are within standard parameters with low acute stress.', evidence: 'Acoustic Signal Extraction', category: 'Acoustic', timestamp: '00:15' }
        ]
    },
    {
        id: 'NHAA-1021',
        time: '10:22 AM',
        date: 'Today',
        language: 'English',
        duration: '02:15',
        svi: 14,
        risk: 'LOW',
        status: 'COMPLETE',
        confidence: 92,
        callerIdMasked: '+91 96XXX-XX905',
        locationMasked: 'Central Helpline Queue',
        factorBreakdown: {
            acousticStressScore: 12,
            linguisticVulnerabilityScore: 10,
            emotionalInstabilityScore: 18
        },
        speechMetrics: {
            speakingRate: 'Normal',
            pauseFrequency: 'Low',
            longPauses: 0,
            pitchVariation: 'Low',
            voiceEnergy: 'High',
            speechStress: 'Low',
            speechStressValue: 12,
            emotionalSignal: 'Neutral / Informational',
            pitchWaveform: [10, 15, 12, 18, 20, 15, 18, 17, 20, 15, 12, 14, 15, 18, 20, 10, 8, 12, 15, 18, 12, 15, 16, 12, 8, 18, 15, 10, 16, 15, 8],
            pauseSequence: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
        },
        emotions: [
            { name: 'Neutral', level: 'HIGH', value: 88 },
            { name: 'Distress', level: 'LOW', value: 12 },
            { name: 'Sadness', level: 'LOW', value: 10 },
            { name: 'Fear', level: 'LOW', value: 8 },
            { name: 'Anger', level: 'LOW', value: 5 }
        ],
        vulnerabilities: [
            { label: 'Social Isolation', key: 'social-isolation', severity: 'LOW', confidence: 15, description: 'No isolation markers.' },
            { label: 'Depression Indicators', key: 'depression', severity: 'LOW', confidence: 12, description: 'Clear articulation.' },
            { label: 'Extreme Vulnerability', key: 'extreme-vulnerability', severity: 'LOW', confidence: 8, description: 'Low risk.' },
            { label: 'Fear', key: 'fear', severity: 'LOW', confidence: 8, description: 'Standard query tone.' },
            { label: 'Severe Trauma', key: 'severe-trauma', severity: 'LOW', confidence: 5, description: 'No trauma expressions.' },
            { label: 'Intimidation', key: 'intimidation', severity: 'LOW', confidence: 4, description: 'None.' },
            { label: 'Suicidal Ideation', key: 'suicidal-ideation', severity: 'LOW', confidence: 2, description: 'None.' }
        ],
        transcript: [
            {
                id: 't-1',
                timestamp: '00:05',
                speaker: 'Caller',
                text: "Hello, I'm calling on behalf of our local community center to inquire about your crisis de-escalation workshop schedule."
            },
            {
                id: 't-2',
                timestamp: '00:12',
                speaker: 'Operator',
                text: 'Good morning! We conduct those every Tuesday and Thursday at 3 PM. I can email you the syllabus packet.'
            },
            {
                id: 't-3',
                timestamp: '00:17',
                speaker: 'Caller',
                text: "That would be wonderful. The address is outreach@communitycenter.org. Thank you so much."
            }
        ],
        explainability: [
            { id: '01', title: 'Routine Administrative Inquiry', description: 'Caller exhibits calm speech dynamics, balanced pitch distribution, and zero distress terminology.', evidence: 'Semantic & Acoustic extraction', category: 'Contextual', timestamp: '00:05' }
        ]
    }
];

// Helper to initialize local storage safely
export const initializeStorage = () => {
    try {
        if (!localStorage.getItem(QUEUE_KEY)) {
            localStorage.setItem(QUEUE_KEY, JSON.stringify(initialMockCases.map(c => c.id)));
            initialMockCases.forEach(c => {
                localStorage.setItem(`${STORAGE_PREFIX}${c.id}`, JSON.stringify(c));
            });
        }
        if (!localStorage.getItem(THRESHOLDS_KEY)) {
            localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(DEFAULT_THRESHOLDS));
        }
    } catch (e) {
        console.warn('LocalStorage error during initialization', e);
    }
};

export const analysisService = {
    getCases(): CaseAssessment[] {
        initializeStorage();
        try {
            const ids: string[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            return ids
                .map(id => {
                    const stored = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
                    return stored ? JSON.parse(stored) : null;
                })
                .filter((c): c is CaseAssessment => c !== null);
        } catch {
            return initialMockCases;
        }
    },

    getCaseById(id: string): CaseAssessment | null {
        initializeStorage();
        try {
            const stored = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    },

    createCaseFromAudio(fileOrName: string, durationSec: number = 272, language: string = 'Hindi'): CaseAssessment {
        initializeStorage();
        const existing = this.getCases();
        const caseId = `NHAA-${1026 + existing.length}`;

        const minutes = Math.floor(durationSec / 60).toString().padStart(2, '0');
        const seconds = (durationSec % 60).toString().padStart(2, '0');

        const newCase: CaseAssessment = {
            id: caseId,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: 'Today',
            language,
            duration: `${minutes}:${seconds}`,
            svi: 0,
            risk: 'LOW',
            status: 'RECEIVED',
            confidence: 0,
            callerIdMasked: `+91 ${Math.floor(90000 + Math.random() * 9000)}-XX${Math.floor(100 + Math.random() * 900)}`,
            locationMasked: `${language} Regional Ingestion Feed`,
            factorBreakdown: {
                acousticStressScore: 0,
                linguisticVulnerabilityScore: 0,
                emotionalInstabilityScore: 0
            },
            speechMetrics: {
                speakingRate: 'Normal',
                pauseFrequency: 'Medium',
                longPauses: 3,
                pitchVariation: 'Medium',
                voiceEnergy: 'Medium',
                speechStress: 'Medium',
                speechStressValue: 0,
                emotionalSignal: 'Awaiting Pipeline Analysis...',
                pitchWaveform: Array.from({ length: 31 }, () => Math.floor(Math.random() * 45) + 15),
                pauseSequence: Array.from({ length: 31 }, (_, i) => i % 5 === 0)
            },
            emotions: [
                { name: 'Fear', level: 'LOW', value: 0 },
                { name: 'Distress', level: 'LOW', value: 0 },
                { name: 'Sadness', level: 'LOW', value: 0 },
                { name: 'Anger', level: 'LOW', value: 0 },
                { name: 'Neutral', level: 'HIGH', value: 100 }
            ],
            vulnerabilities: [
                { label: 'Severe Trauma', key: 'severe-trauma', severity: 'LOW', confidence: 0 },
                { label: 'Fear & Perceived Danger', key: 'fear', severity: 'LOW', confidence: 0 },
                { label: 'Intimidation & Coercion', key: 'intimidation', severity: 'LOW', confidence: 0 },
                { label: 'Social Confinement', key: 'social-isolation', severity: 'LOW', confidence: 0 },
                { label: 'Depression Indicators', key: 'depression', severity: 'LOW', confidence: 0 },
                { label: 'Extreme Vulnerability', key: 'extreme-vulnerability', severity: 'LOW', confidence: 0 },
                { label: 'Suicidal Ideation', key: 'suicidal-ideation', severity: 'LOW', confidence: 0 }
            ],
            transcript: [
                {
                    id: 't-1',
                    timestamp: '00:02',
                    speaker: 'Caller',
                    text: `[Audio Stream: ${fileOrName}] Hello? Please help me, I am facing an emergency.`
                },
                {
                    id: 't-2',
                    timestamp: '00:08',
                    speaker: 'Operator',
                    text: "Sahaaya AI Emergency Helpline. You are connected. We are listening and logging your location for support."
                },
                {
                    id: 't-3',
                    timestamp: '00:15',
                    speaker: 'Caller',
                    text: "I am unable to leave this place safely. Someone is monitoring my door.",
                    indicator: { type: 'intimidation', label: 'Coercive Confinement', severity: 'HIGH' }
                }
            ],
            explainability: []
        };

        try {
            localStorage.setItem(`${STORAGE_PREFIX}${caseId}`, JSON.stringify(newCase));
            const ids: string[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            localStorage.setItem(QUEUE_KEY, JSON.stringify([newCase.id, ...ids]));
        } catch (e) {
            console.warn('Error creating case', e);
        }

        return newCase;
    },

    updateCaseStatus(id: string, status: AssessmentStatus, dataOverrides?: Partial<CaseAssessment>): CaseAssessment | null {
        const item = this.getCaseById(id);
        if (!item) return null;

        const updated: CaseAssessment = {
            ...item,
            status,
            ...dataOverrides
        };

        try {
            localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(updated));
        } catch (e) {
            console.warn('Error updating case', e);
        }
        return updated;
    },

    saveOperatorReview(
        id: string,
        notes: string,
        flagged: boolean,
        confirmedRisk?: RiskCategory,
        reviewerName: string = 'Priya Sharma',
        overrideReason?: string,
        emergencyDispatched?: boolean,
        dispatchDetails?: OperatorReview['dispatchDetails']
    ): CaseAssessment | null {
        const item = this.getCaseById(id);
        if (!item) return null;

        const operatorReview: OperatorReview = {
            isReviewed: true,
            confirmedRisk: confirmedRisk || item.risk,
            overrideReason: overrideReason || undefined,
            flagged,
            notes,
            reviewedBy: reviewerName,
            reviewedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            emergencyDispatched: emergencyDispatched || false,
            dispatchDetails
        };

        const updated: CaseAssessment = {
            ...item,
            operatorReview
        };

        try {
            localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(updated));
        } catch (e) {
            console.warn('Error saving review', e);
        }
        return updated;
    },

    deleteCase(id: string): boolean {
        try {
            localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
            const ids: string[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            const filtered = ids.filter(i => i !== id);
            localStorage.setItem(QUEUE_KEY, JSON.stringify(filtered));
            return true;
        } catch {
            return false;
        }
    },

    getThresholds(): SystemThresholds {
        initializeStorage();
        try {
            const stored = localStorage.getItem(THRESHOLDS_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_THRESHOLDS;
        } catch {
            return DEFAULT_THRESHOLDS;
        }
    },

    saveThresholds(thresholds: SystemThresholds): void {
        try {
            localStorage.setItem(THRESHOLDS_KEY, JSON.stringify(thresholds));
        } catch (e) {
            console.warn('Error saving thresholds', e);
        }
    },

    resetDatabase(): void {
        try {
            const ids: string[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
            ids.forEach(id => localStorage.removeItem(`${STORAGE_PREFIX}${id}`));
            localStorage.removeItem(QUEUE_KEY);
            localStorage.removeItem(THRESHOLDS_KEY);
            initializeStorage();
        } catch (e) {
            console.warn('Error resetting database', e);
        }
    }
};
