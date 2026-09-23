import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    PhoneCall,
    PhoneOff,
    PhoneIncoming,
    CheckCircle2,
    Siren,
    Radio,
    MapPin,
    User,
    ArrowUpRight,
    Building2,
    AlertOctagon,
    Clock,
    Download,
    Sparkles,
    Copy,
    Check
} from 'lucide-react';
import { OFFICIAL_CALLER_SCENARIO, SAMPLE_PRE_RECORDED_CALLS, type CallerScriptLine } from '../data/demoScript';
import { generateEmergencyIncidentPdf } from '../services/pdfReportGenerator';

const CALL_SCENARIOS = [
    OFFICIAL_CALLER_SCENARIO,
    SAMPLE_PRE_RECORDED_CALLS[1].scenario,
    SAMPLE_PRE_RECORDED_CALLS[2].scenario
];

const EMERGENCY_DEPARTMENTS = [
    {
        id: 'police',
        name: 'Police Department (PCR / 112 QRT)',
        subtext: 'Active harassment, bullying, violence & physical threats',
        badge: 'URGENT POLICE RESPONSE'
    },
    {
        id: 'sc_st_cell',
        name: 'Special SC/ST Atrocities Protection Cell',
        subtext: 'Caste-based discrimination & systemic village intimidation',
        badge: 'DISTRICT SPECIAL CELL'
    },
    {
        id: 'women_child',
        name: 'Women & Child Helpline Cell (1090 / 1098)',
        subtext: 'Domestic distress, abuse & vulnerable family members',
        badge: 'SPECIAL WING'
    },
    {
        id: 'ambulance',
        name: 'Emergency Medical Services (108 Ambulance)',
        subtext: 'Physical injuries, trauma & emergency medical care',
        badge: 'MEDICAL EMS'
    }
];

const VoiceAnalysis: React.FC = () => {
    // Call states: 'WAITING' | 'CONNECTED' | 'ENDED'
    const [callStatus, setCallStatus] = useState<'WAITING' | 'CONNECTED' | 'ENDED'>('WAITING');
    const [callDuration, setCallDuration] = useState(0);
    const [displayedLines, setDisplayedLines] = useState<CallerScriptLine[]>([]);

    // Department Escalation & Handover States
    const [selectedDepartment, setSelectedDepartment] = useState('Police Department (PCR / 112 QRT)');
    const [escalated, setEscalated] = useState(false);
    const [escalationDocket, setEscalationDocket] = useState<{
        department: string;
        timestamp: string;
        docketId: string;
    } | null>(null);

    // AI Follow-up Questions clipboard state
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const timerRef = useRef<number | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement | null>(null);

    const [scenarioIndex, setScenarioIndex] = useState(0);
    const scenario = CALL_SCENARIOS[scenarioIndex];
    const [nextCallCountdown, setNextCallCountdown] = useState<number | null>(null);

    // Auto-scroll transcript container as new lines stream in
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayedLines]);

    // Handle timer & live streaming when call is picked up
    useEffect(() => {
        if (callStatus === 'CONNECTED') {
            timerRef.current = window.setInterval(() => {
                setCallDuration((prev) => {
                    const nextSec = prev + 1;

                    // Stream lines according to their secondOffset
                    const newlyUnlocked = scenario.lines.filter(
                        (line) => line.secondOffset <= nextSec
                    );
                    setDisplayedLines(newlyUnlocked);

                    // Auto complete when all 4 lines are finished
                    if (nextSec >= scenario.durationSec) {
                        setCallStatus('ENDED');
                    }

                    return nextSec;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [callStatus, scenario]);

    const handlePickUpCall = () => {
        setCallStatus('CONNECTED');
        setCallDuration(0);
        setDisplayedLines([]);
        setEscalated(false);
        setEscalationDocket(null);
    };

    const handleEndCall = () => {
        setCallStatus('ENDED');
        if (timerRef.current) clearInterval(timerRef.current);
        // Show all transcript lines on call end
        setDisplayedLines(scenario.lines);
    };

    // Automatically transition to next incoming call and reset session after call ends
    useEffect(() => {
        if (callStatus !== 'ENDED') {
            setNextCallCountdown(null);
            return;
        }

        setNextCallCountdown(5);
        const interval = window.setInterval(() => {
            setNextCallCountdown((prev) => {
                if (prev === null || prev <= 1) {
                    clearInterval(interval);
                    // Auto-reset state for new incoming call
                    setCallStatus('WAITING');
                    setCallDuration(0);
                    setDisplayedLines([]);
                    setEscalated(false);
                    setEscalationDocket(null);
                    setScenarioIndex((current) => (current + 1) % CALL_SCENARIOS.length);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [callStatus]);

    const handleEscalateCall = () => {
        setEscalated(true);
        setEscalationDocket({
            department: selectedDepartment,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
            docketId: `ERSS-POL-${Math.floor(1000 + Math.random() * 9000)}`
        });
    };

    const formatTimer = (sec: number) => {
        const mins = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${mins}:${s}`;
    };

    // Dialect defaults to English at first, then updates to Hindi as audio plays
    const detectedDialect = displayedLines.length === 0 ? 'English (Default)' : 'Hindi (ग्रामीण हिंदी)';

    // Copy follow up question to operator clipboard
    const handleCopyQuestion = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Download comprehensive PDF incident report after call
    const handleDownloadPdf = () => {
        generateEmergencyIncidentPdf({
            callId: scenario.callId,
            callerNumber: scenario.callerNumber,
            callerLocation: scenario.callerLocation,
            dialect: detectedDialect,
            durationFormatted: formatTimer(callDuration),
            assessment: {
                svi: currentAssessment.svi,
                risk: currentAssessment.risk,
                confidence: currentAssessment.confidence,
                vulnerabilityDomain: currentAssessment.vulnerabilityDomain,
                stressLevel: currentAssessment.stressLevel,
                recommendedAction: currentAssessment.recommendedAction
            },
            lines: scenario.lines,
            escalationDocket: escalationDocket,
            dutyOfficer: 'Priya Sharma (OP-0482)'
        });
    };

    // AI Dynamic Follow-up Questions synthesized specifically from victim's statements
    const followUpQuestions = useMemo(() => {
        const count = displayedLines.length;

        if (callStatus === 'WAITING' || count === 0) {
            return [
                {
                    id: 'q-initial-1',
                    tag: 'SAFETY' as const,
                    tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    textHindi: 'क्या आप इस समय किसी सुरक्षित स्थान पर हैं जहाँ बिना किसी खतरे के बात कर सकते हैं?',
                    textEnglish: 'Are you currently in a safe and secure spot to speak freely?',
                    rationale: 'Initial Verification: Confirm caller physical safety prior to detailed inquiry.'
                },
                {
                    id: 'q-initial-2',
                    tag: 'LOCATION' as const,
                    tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
                    textHindi: 'कृपया अपने गाँव का नाम, वार्ड और नज़दीकी मुख्य लैंडमार्क की पुष्टि करें।',
                    textEnglish: 'Please confirm your exact village name, ward number, and nearest landmark.',
                    rationale: 'GPS Verification: Validate village perimeter for QRT vehicle dispatch.'
                }
            ];
        }

        const list = [];

        // When statement 4 or call completed: Imminent escalation and immediate rescue
        if (count >= 4 || callStatus === 'ENDED') {
            list.push({
                id: 'q-line-4',
                tag: 'SAFETY' as const,
                tagColor: 'bg-red-100 text-red-900 border-red-400 font-bold',
                textHindi: 'क्या आप और आपका परिवार किसी पक्के कमरे में अंदर से कुंडी लगाकर सुरक्षित हो सकते हैं जब तक पुलिस वैन पहुंचे?',
                textEnglish: 'Can you and your family lock yourselves safely inside a secure room until the 112 QRT unit arrives?',
                rationale: 'Critical Imminent Danger: Immediate life containment protocol pending unit arrival.'
            });
            list.push({
                id: 'q-line-4b',
                tag: 'LOCATION' as const,
                tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
                textHindi: 'गाँव में 112 गश्ती वाहन के पहुंचने के लिए कोई मुख्य पक्की सड़क, स्कूल या मंदिर जैसा सीधा लैंडमार्क बताएं।',
                textEnglish: 'Specify the nearest roadside landmark or junction for the incoming emergency intercept vehicle.',
                rationale: 'Rural Navigation: Prevent field unit delays in unmapped village lanes.'
            });
        }

        // When statement 3: Prior complaint filed, systemic neglect
        if (count >= 3) {
            list.push({
                id: 'q-line-3',
                tag: 'EVIDENCE' as const,
                tagColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                textHindi: 'क्या स्थानीय थाने या चौकी में दी गई पुरानी शिकायत की कोई जीडी रसीद या डायरी नंबर आपके पास है?',
                textEnglish: 'Do you have the GD / Diary entry number or written receipt from the previous complaint you filed?',
                rationale: 'Systemic Neglect: Expedite direct supervisory escalation to District Superintendent.'
            });
        }

        // When statement 2: Physical assault on brother & direct threats
        if (count >= 2) {
            list.push({
                id: 'q-line-2a',
                tag: 'MEDICAL' as const,
                tagColor: 'bg-rose-100 text-rose-800 border-rose-300',
                textHindi: 'क्या आपके घायल भाई को तत्काल 108 एम्बुलेंस या अस्पताल ले जाने की आवश्यकता है?',
                textEnglish: 'Does your assaulted brother have open wounds or require an immediate 108 ambulance dispatch?',
                rationale: 'Active Trauma: Triage medical emergency services simultaneously.'
            });
            list.push({
                id: 'q-line-2b',
                tag: 'SAFETY' as const,
                tagColor: 'bg-amber-100 text-amber-800 border-amber-300',
                textHindi: 'क्या मारपीट या धमकियों के दौरान हमलावरों के पास लाठी, डंडे या किसी प्रकार के हथियार मौजूद थे?',
                textEnglish: 'Were any weapons, lathis, or sharp instruments brandished or used by the attackers?',
                rationale: 'Threat Severity: Arming protocol assessment for QRT field responders.'
            });
        }

        // When statement 1: Caste harassment & village humiliation
        if (count >= 1) {
            list.push({
                id: 'q-line-1a',
                tag: 'EVIDENCE' as const,
                tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
                textHindi: 'जातिगत गाली-गलौज और परेशान करने वाले मुख्य व्यक्तियों के नाम या उनके परिवार की पहचान बताएं।',
                textEnglish: 'Can you state the specific names or families in the village responsible for the harassment?',
                rationale: 'Statutory Identification: SC/ST (PoA) Act offense documentation.'
            });
            list.push({
                id: 'q-line-1b',
                tag: 'SAFETY' as const,
                tagColor: 'bg-red-100 text-red-800 border-red-300',
                textHindi: 'क्या वे लोग इस समय आपके घर या रास्ते के बाहर जमा हैं?',
                textEnglish: 'Are the perpetrators currently assembled outside your residence or lane right now?',
                rationale: 'Physical Containment: Assess whether mob is actively surrounding the caller.'
            });
        }

        return list.slice(0, 4);
    }, [displayedLines.length, callStatus]);

    // Dynamic progressive AI distress classification:
    // Starts at absolute 0 and moves up/down in real time as speech is transcribed
    const currentAssessment = useMemo(() => {
        const count = displayedLines.length;

        if (count === 0) {
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
        } else if (count === 1) {
            // Line 1: Caste harassment & humiliation in village
            return {
                svi: 48,
                risk: 'MODERATE' as const,
                confidence: 68,
                vulnerabilityDomain: 'Caste-based Harassment & Discrimination',
                stressLevel: 'Audible Vocal Quiver & Distress Markers (48%)',
                recommendedAction: 'Log caller location details and assess immediate threat severity.',
                badgeClass: 'bg-amber-600 text-white border-amber-500',
                scoreColor: 'text-amber-700',
                borderClass: 'border-amber-400',
                barPercent: 48,
                barColor: 'bg-amber-500'
            };
        } else if (count === 2) {
            // Line 2: Physical assault on brother & death threats to family
            return {
                svi: 78,
                risk: 'HIGH' as const,
                confidence: 86,
                vulnerabilityDomain: 'Physical Assault & Direct Threats to Family',
                stressLevel: 'Heightened Pitch & Acute Vocal Tremor (78%)',
                recommendedAction: 'Active violence & threat detected. Police Control Room handover advised.',
                badgeClass: 'bg-orange-600 text-white border-orange-500',
                scoreColor: 'text-orange-700',
                borderClass: 'border-orange-500',
                barPercent: 78,
                barColor: 'bg-orange-500'
            };
        } else if (count === 3) {
            // Line 3: Systemic neglect / complaint filed previously without help
            // Score dynamically dips to 72 reflecting tone transition from active panic to despair
            return {
                svi: 72,
                risk: 'HIGH' as const,
                confidence: 89,
                vulnerabilityDomain: 'Systemic Neglect & Ongoing Vulnerability',
                stressLevel: 'Suppressed Desperation & Emotional Exhaustion (72%)',
                recommendedAction: 'Helpline priority escalation. Prepare multi-agency dispatch.',
                badgeClass: 'bg-orange-600 text-white border-orange-500',
                scoreColor: 'text-orange-700',
                borderClass: 'border-orange-500',
                barPercent: 72,
                barColor: 'bg-orange-500'
            };
        } else {
            // Line 4 / Final: Acute fear of imminent retaliation & urgent plea for help
            return {
                svi: 86,
                risk: 'CRITICAL' as const,
                confidence: 93,
                vulnerabilityDomain: 'Active Caste Violence & Imminent Physical Danger',
                stressLevel: 'Critical Vocal Tremor & Suppressed Agitation (87%)',
                recommendedAction: 'Critical Threat Level: Immediate Police Quick Response Team (QRT) Handover Authorized.',
                badgeClass: 'bg-red-700 text-white border-red-600',
                scoreColor: 'text-red-700',
                borderClass: 'border-red-600',
                barPercent: 86,
                barColor: 'bg-red-600'
            };
        }
    }, [displayedLines.length]);

    // Escalation Handover option is unlocked in between the call once SVI reaches threshold (>= 48) or after call ends
    const isEscalationAvailable = callStatus === 'ENDED' || currentAssessment.svi >= 48;

    return (
        <div className="space-y-4">
            {/* Official Top Station Bar */}
            <div className="bg-white border border-slate-300 rounded-md p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-blue-950 text-white flex items-center justify-center font-bold">
                        <Radio size={16} className={callStatus === 'CONNECTED' ? 'animate-pulse text-emerald-400' : ''} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                            National Emergency Helpline (ERSS 112) — Voice Triage Console
                        </h2>
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] mt-0.5">
                            <span>SESSION: <strong>{scenario.callId}</strong></span>
                            <span>|</span>
                            <span>DIALECT: <strong className={displayedLines.length > 0 ? 'text-blue-950 font-bold' : 'text-slate-600'}>{detectedDialect}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {callStatus === 'ENDED' && (
                        <button
                            onClick={handleDownloadPdf}
                            className="px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-semibold rounded border border-blue-900 flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                            title="Download Incident Report as PDF"
                        >
                            <Download size={13} />
                            <span>Download PDF Report</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 3-Column Layout: Left (Emergency Line Status), Middle (Transcription), Right (AI Distress Classification) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                
                {/* ------------------------------------------------------------- */}
                {/* 1. LEFT COLUMN (3/12): Emergency Line Status Tab               */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-3 space-y-3 flex flex-col lg:h-[650px]">
                    <div className="bg-white border border-slate-300 rounded-md p-3.5 shadow-xs space-y-3 shrink-0">
                        {/* Tab Title & Line Status */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                Emergency Line Status
                            </span>
                            {callStatus === 'WAITING' && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                                    INCOMING CALL
                                </span>
                            )}
                            {callStatus === 'CONNECTED' && (
                                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                    LIVE CONNECTED
                                </span>
                            )}
                            {callStatus === 'ENDED' && (
                                <span className="bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                    DISCONNECTED
                                </span>
                            )}
                        </div>

                        {/* Caller Telephony Card */}
                        <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${
                                    callStatus === 'WAITING' ? 'bg-amber-500 animate-bounce' :
                                    callStatus === 'CONNECTED' ? 'bg-emerald-600' : 'bg-slate-700'
                                }`}>
                                    {callStatus === 'WAITING' ? <PhoneIncoming size={20} /> :
                                     callStatus === 'CONNECTED' ? <PhoneCall size={20} className="animate-pulse" /> :
                                     <PhoneOff size={20} />}
                                </div>
                                <div className="overflow-hidden">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
                                        CALLER TELEPHONY ID
                                    </span>
                                    <h3 className="text-sm font-bold text-slate-900 font-mono tracking-tight truncate">
                                        {scenario.callerNumber}
                                    </h3>
                                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={11} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{scenario.callerLocation}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Live Call Duration */}
                            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium flex items-center gap-1">
                                    <Clock size={12} className="text-slate-400" />
                                    Call Duration:
                                </span>
                                <span className="font-mono text-base font-bold text-slate-900">
                                    {formatTimer(callDuration)}
                                </span>
                            </div>
                        </div>

                        {/* Call Action Trigger Buttons */}
                        <div>
                            {callStatus === 'WAITING' && (
                                <button
                                    onClick={handlePickUpCall}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-3 rounded text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                                >
                                    <PhoneCall size={16} />
                                    <span>Pick Up Call (Answer)</span>
                                </button>
                            )}

                            {callStatus === 'CONNECTED' && (
                                <button
                                    onClick={handleEndCall}
                                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-3 rounded text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                >
                                    <PhoneOff size={16} />
                                    <span>Disconnect / End Call</span>
                                </button>
                            )}

                            {callStatus === 'ENDED' && (
                                <button
                                    onClick={handleDownloadPdf}
                                    className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 px-3 rounded text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                >
                                    <Download size={15} />
                                    <span>Download Incident Report (PDF)</span>
                                </button>
                            )}
                        </div>

                        {/* Station Notice */}
                        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-950 font-light leading-snug">
                            {callStatus === 'WAITING' ? (
                                <p>Emergency call ringing on Line 1. Click <strong>"Pick Up Call"</strong> to answer.</p>
                            ) : callStatus === 'CONNECTED' ? (
                                <p className="text-emerald-900 font-medium">Line connected. Live dialogue streaming in center panel.</p>
                            ) : (
                                <p>
                                    Call ended. Report archived. {nextCallCountdown !== null ? (
                                        <span className="font-semibold text-blue-900">Next incoming call ringing in {nextCallCountdown}s (auto-resetting)...</span>
                                    ) : (
                                        'Preparing line for incoming call...'
                                    )}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ------------------------------------------------------------- */}
                    {/* Bottom Left Corner: AI Suggested Follow-Up Questions Panel    */}
                    {/* ------------------------------------------------------------- */}
                    <div className="bg-white border border-slate-300 rounded-md p-3.5 shadow-xs flex-1 min-h-0 flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2 shrink-0">
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={13} className="text-amber-600" />
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                    AI Suggested Follow-Up Questions
                                </h3>
                            </div>
                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                callStatus === 'CONNECTED'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 animate-pulse'
                                    : callStatus === 'ENDED'
                                    ? 'bg-blue-50 text-blue-900 border-blue-200'
                                    : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}>
                                {callStatus === 'CONNECTED' ? 'LIVE NLP ADVISORY' : callStatus === 'ENDED' ? 'POST-CALL INQUIRY' : 'STANDBY'}
                            </span>
                        </div>

                        <p className="text-[10px] text-slate-500 font-light leading-tight mt-1.5 mb-2 shrink-0">
                            Specific inquiries dynamically suggested from the caller's statements to guide operator interrogation:
                        </p>

                        <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-1">
                            {followUpQuestions.map((q) => (
                                <div
                                    key={q.id}
                                    className="p-2.5 rounded border border-slate-200 bg-slate-50/80 hover:bg-slate-50 transition-colors text-xs space-y-1.5"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${q.tagColor}`}>
                                            [{q.tag}]
                                        </span>
                                        <button
                                            onClick={() => handleCopyQuestion(q.id, q.textHindi)}
                                            className="text-[10px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors px-1.5 py-0.5 rounded hover:bg-slate-200/60"
                                            title="Copy question text"
                                        >
                                            {copiedId === q.id ? (
                                                <>
                                                    <Check size={11} className="text-emerald-600" />
                                                    <span className="text-emerald-700 font-bold">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={11} />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {/* Primary Hindi question for caller */}
                                    <p className="font-semibold text-slate-900 text-xs leading-snug">
                                        "{q.textHindi}"
                                    </p>

                                    {/* English operator guidance */}
                                    <p className="text-[11px] text-slate-600 italic font-light leading-snug">
                                        Guide: {q.textEnglish}
                                    </p>

                                    {/* AI Context reasoning */}
                                    <div className="text-[9px] font-mono text-slate-400 border-t border-slate-200/70 pt-1">
                                        AI Context: {q.rationale}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 2. MIDDLE COLUMN (5/12): Live Caller Speech Transcription     */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-5">
                    <div className="bg-white border border-slate-300 rounded-md p-4 shadow-xs flex flex-col h-[650px]">
                        {/* Transcript Box Header */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 mb-3">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                                    Live Caller Audio Speech Transcription
                                </h3>
                                <p className="text-[11px] text-slate-500 font-light mt-0.5">
                                    Real-time transcript of caller audio (Operator audio suppressed)
                                </p>
                            </div>

                            <span className="text-[10px] font-mono bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-bold">
                                {callStatus === 'CONNECTED' ? 'LIVE AUDIO STREAM' : callStatus === 'ENDED' ? 'CALL ARCHIVED' : 'STANDBY'}
                            </span>
                        </div>

                        {/* Transcript Scrolling Body */}
                        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1.5">
                            {callStatus === 'WAITING' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                                    <PhoneCall size={40} className="stroke-[1.3] mb-2.5 text-slate-300" />
                                    <p className="text-sm font-bold text-slate-800">
                                        Terminal Waiting for Call Connection
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-xs font-light leading-relaxed">
                                        Emergency call pending on Line 1 from <strong>{scenario.callerNumber}</strong>.
                                        Click <strong>"Pick Up Call"</strong> on the left to answer and begin live transcription.
                                    </p>
                                </div>
                            ) : displayedLines.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 animate-pulse">
                                    <Radio size={32} className="text-blue-900 mb-2 animate-spin" />
                                    <p className="text-xs font-semibold text-slate-700">Connecting audio telemetry stream...</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Awaiting initial speech packets</p>
                                </div>
                            ) : (
                                displayedLines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="p-3.5 rounded-md border border-slate-200 bg-amber-50/40 text-slate-900 space-y-2 animate-fade-in shadow-2xs"
                                    >
                                        {/* Line Header with Speaker & Timestamp */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5">
                                                <span className="bg-amber-600 text-white font-mono font-bold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                                    <User size={10} />
                                                    CALLER
                                                </span>
                                                <span className="text-[11px] font-mono text-slate-500 font-semibold">
                                                    [+{line.secondOffset}s]
                                                </span>
                                            </div>

                                            {/* Distress Indicator Tag */}
                                            {line.indicatorTag && (
                                                <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${
                                                    line.severity === 'CRITICAL'
                                                        ? 'bg-red-100 text-red-900 border-red-300'
                                                        : 'bg-amber-100 text-amber-900 border-amber-300'
                                                }`}>
                                                    {line.indicatorTag}
                                                </span>
                                            )}
                                        </div>

                                        {/* Primary Hindi Transcript */}
                                        <p className="text-sm font-medium text-slate-900 leading-relaxed font-sans">
                                            "{line.text}"
                                        </p>

                                        {/* English Translation Subtitle */}
                                        {line.englishTranslation && (
                                            <p className="text-[11px] text-slate-600 italic border-l-2 border-slate-300 pl-2 font-light">
                                                Translation: "{line.englishTranslation}"
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Live Streaming Typing Indicator */}
                            {callStatus === 'CONNECTED' && (
                                <div className="flex items-center gap-2 p-2 text-xs font-mono text-slate-600 bg-slate-50 rounded border border-slate-200 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                    <span>Caller voice stream live • Transcribing audio in real time...</span>
                                </div>
                            )}

                            <div ref={transcriptEndRef} />
                        </div>
                    </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* 3. RIGHT COLUMN (4/12): Official Government AI Distress Widget */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white border-2 border-slate-300 rounded-md shadow-xs overflow-hidden">
                        {/* Official Tricolor Ribbon Accent on top of the card */}
                        <div className="gov-tricolor" />

                        {/* Official Header Banner */}
                        <div className="bg-blue-950 text-white px-4 py-3 border-b border-blue-900 flex items-center justify-between">
                            <div>
                                <span className="text-[9px] font-mono text-blue-300 uppercase tracking-widest block font-semibold">
                                    GOVERNMENT OF INDIA • ERSS 112
                                </span>
                                <h3 className="text-xs font-bold text-white uppercase tracking-wide">
                                    AI Distress Classification Desk
                                </h3>
                            </div>
                            <span className={`${currentAssessment.badgeClass} text-[10px] font-bold px-2 py-0.5 rounded font-mono border uppercase tracking-wider`}>
                                {currentAssessment.risk}
                            </span>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Live Telemetry Status Bar */}
                            <div className="flex items-center justify-between text-[11px] font-mono pb-2 border-b border-slate-200">
                                <span className="text-slate-500 flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${callStatus === 'CONNECTED' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                                    {callStatus === 'CONNECTED' ? 'ACOUSTIC NLP SENSING ACTIVE' : 'TELEMETRY STANDBY'}
                                </span>
                                <span className="text-slate-700 font-bold">
                                    CONFIDENCE: <strong className="text-blue-950 font-mono">{currentAssessment.confidence}%</strong>
                                </span>
                            </div>

                            {/* Digital SVI Score Readout & Visual Meter */}
                            <div className="bg-slate-50 border border-slate-200 rounded p-3.5 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase text-slate-500 block font-mono">
                                            VULNERABILITY INDEX (SVI)
                                        </span>
                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className={`text-4xl font-black ${currentAssessment.scoreColor} font-mono tracking-tight transition-colors duration-300`}>
                                                {currentAssessment.svi.toString().padStart(2, '0')}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono font-semibold">/ 100 SVI</span>
                                        </div>
                                    </div>

                                    <div className="text-right space-y-1">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">THREAT CLASSIFICATION</span>
                                        <span className={`inline-block text-xs font-bold font-mono px-2 py-0.5 rounded ${
                                            currentAssessment.risk === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-300' :
                                            currentAssessment.risk === 'HIGH' ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                                            currentAssessment.risk === 'MODERATE' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                            'bg-slate-200 text-slate-700 border border-slate-300'
                                        }`}>
                                            {currentAssessment.risk === 'CRITICAL' ? 'LEVEL 4 : CRITICAL' :
                                             currentAssessment.risk === 'HIGH' ? 'LEVEL 3 : HIGH RISK' :
                                             currentAssessment.risk === 'MODERATE' ? 'LEVEL 2 : MODERATE' :
                                             'LEVEL 0 : BASELINE'}
                                        </span>
                                    </div>
                                </div>

                                {/* Government 4-Zone Segmented Indicator */}
                                <div className="space-y-1.5 pt-1">
                                    <div className="grid grid-cols-4 gap-1 h-2">
                                        <div className={`rounded-sm transition-colors duration-300 ${currentAssessment.svi >= 0 ? 'bg-slate-400' : 'bg-slate-200'}`} />
                                        <div className={`rounded-sm transition-colors duration-300 ${currentAssessment.svi >= 31 ? 'bg-amber-500' : 'bg-slate-200'}`} />
                                        <div className={`rounded-sm transition-colors duration-300 ${currentAssessment.svi >= 61 ? 'bg-orange-500' : 'bg-slate-200'}`} />
                                        <div className={`rounded-sm transition-colors duration-300 ${currentAssessment.svi >= 81 ? 'bg-red-600' : 'bg-slate-200'}`} />
                                    </div>
                                    <div className="grid grid-cols-4 text-[8px] font-mono text-slate-500 font-bold text-center">
                                        <span>0-30 NORMAL</span>
                                        <span>31-60 MOD</span>
                                        <span>61-80 HIGH</span>
                                        <span>81-100 CRIT</span>
                                    </div>
                                </div>
                            </div>

                            {/* Structured Official Intelligence Ledger */}
                            <div className="border border-slate-200 rounded divide-y divide-slate-200 text-xs">
                                <div className="p-2.5 bg-white">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                                        IDENTIFIED VULNERABILITY DOMAIN
                                    </span>
                                    <p className="font-bold text-slate-900 text-xs mt-0.5">
                                        {currentAssessment.vulnerabilityDomain}
                                    </p>
                                </div>

                                <div className="p-2.5 bg-slate-50/60">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                                        ACOUSTIC DISTRESS TELEMETRY
                                    </span>
                                    <p className="text-slate-800 font-medium text-xs mt-0.5">
                                        {currentAssessment.stressLevel}
                                    </p>
                                </div>

                                <div className="p-2.5 bg-amber-50/40">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider block font-mono flex items-center gap-1 ${
                                        currentAssessment.risk === 'CRITICAL' ? 'text-red-700' : 'text-amber-800'
                                    }`}>
                                        <AlertOctagon size={11} />
                                        STATUTORY DIRECTIVE / ACTION PROTOCOL
                                    </span>
                                    <p className="text-xs text-slate-800 font-medium mt-0.5 leading-snug">
                                        {currentAssessment.recommendedAction}
                                    </p>
                                </div>
                            </div>

                            {/* Department Escalation & Handover Module */}
                            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-3">
                                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-900 flex items-center gap-1.5">
                                        <Building2 size={13} className="text-blue-900" />
                                        Inter-Agency Handover Protocol
                                    </span>
                                    {isEscalationAvailable && !escalated && (
                                        <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded font-bold">
                                            READY TO HAND OVER
                                        </span>
                                    )}
                                </div>

                                {!isEscalationAvailable ? (
                                    <div className="p-2.5 bg-white border border-slate-200 rounded text-[11px] text-slate-500 font-light leading-snug">
                                        Escalation handover protocol is currently on standby. Protocol unlocks when distress is detected (SVI ≥ 48) or upon call conclusion.
                                    </div>
                                ) : !escalated ? (
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <label className="text-[11px] font-bold text-slate-700">
                                                    Target Emergency Department:
                                                </label>
                                                <span className="text-[9px] font-mono text-red-700 font-bold">
                                                    PRIORITY 1: FLASH DISPATCH
                                                </span>
                                            </div>
                                            <select
                                                value={selectedDepartment}
                                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                                className="w-full text-xs p-2 bg-white border border-slate-300 rounded text-slate-900 font-semibold focus:border-blue-900 outline-none cursor-pointer"
                                            >
                                                {EMERGENCY_DEPARTMENTS.map((dept) => (
                                                    <option key={dept.id} value={dept.name}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-500 italic mt-1 leading-tight">
                                                * For active harassment, bullying, or violence, transfer directly to Police Control Room.
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleEscalateCall}
                                            className="w-full bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-bold py-2.5 px-3 rounded text-xs uppercase flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                        >
                                            <Siren size={15} />
                                            <span>Authorize Handover to {selectedDepartment.split('(')[0]}</span>
                                            <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 border-2 border-emerald-600 rounded p-3 text-xs space-y-2 animate-fade-in">
                                        <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                                            <span className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
                                                <CheckCircle2 size={16} className="text-emerald-700" />
                                                CALL HANDOVER EXECUTED
                                            </span>
                                            <span className="bg-emerald-700 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                DISPATCH ACTIVE
                                            </span>
                                        </div>

                                        <div className="space-y-1 text-emerald-950">
                                            <p className="font-bold text-xs">
                                                Transferred to: <span className="underline">{escalationDocket?.department}</span>
                                            </p>
                                            <p className="text-[11px] font-mono text-emerald-800">
                                                Transfer Docket: <strong>{escalationDocket?.docketId}</strong>
                                            </p>
                                            <p className="text-[11px] font-mono text-emerald-800">
                                                Duty Officer: <strong>Priya Sharma (OP-0482)</strong> at {escalationDocket?.timestamp}
                                            </p>
                                        </div>

                                        <div className="p-2 bg-emerald-100/60 rounded border border-emerald-300 text-[10px] text-emerald-900 leading-snug">
                                            ✓ Real-time audio stream & acoustic distress telemetry routed to Central Police Control Room (PCR Unit 4 dispatched).
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default VoiceAnalysis;
