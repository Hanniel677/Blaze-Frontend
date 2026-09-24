<<<<<<< Updated upstream
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Play, Languages, Clock, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';
import type { CaseAssessment } from '../types';
import { analysisService } from '../services/analysisService';

const VoiceAnalysis: React.FC = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState<CaseAssessment[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

    useEffect(() => {
        setCases(analysisService.getCases());
    }, []);

    const handleSelectCase = (caseId: string, runSimulation: boolean = false) => {
        if (runSimulation) {
            // Set status back to RECEIVED to trigger processing animation
            analysisService.updateCaseStatus(caseId, 'RECEIVED', { svi: 0, confidence: 0 });
            navigate(`/analysis/${caseId}?analyse=true`);
        } else {
            navigate(`/analysis/${caseId}`);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            simulateUpload(files[0].name);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            simulateUpload(files[0].name);
        }
    };

    const simulateUpload = (filename: string) => {
        setUploading(true);
        setUploadSuccess(null);

        // Simulate audio parsing upload latencies
        setTimeout(() => {
            // Create new case as RECEIVED in the database
            const newCase = analysisService.createCaseFromAudio(filename, 272, 'Hindi');
            setUploading(false);
            setUploadSuccess(`"${filename}" successfully uploaded as Case ${newCase.id}`);

            // Update local case state
            setCases(analysisService.getCases());

            // Stagger navigate to start processing
            setTimeout(() => {
                navigate(`/analysis/${newCase.id}?analyse=true`);
            }, 1000);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-fade-in">

            {/* Page Header */}
            <div className="border-b border-slate-100 pb-6">
                <h2 className="font-display font-bold text-3xl text-slate-800 tracking-tight">
                    Voice Analysis Portal
                </h2>
                <p className="text-slate-500 text-sm mt-1.5 font-light">
                    Analyse recorded interactions, speech pacing details and pitch variations for trauma indicators.
                </p>
=======
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
import { OFFICIAL_CALLER_SCENARIO, getContinuousAssessment } from '../data/demoScript';
import { generateEmergencyIncidentPdf } from '../services/pdfReportGenerator';

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
    const [callElapsedMs, setCallElapsedMs] = useState(0);
    const [callDuration, setCallDuration] = useState(0);

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
    const startTimeRef = useRef<number>(0);
    const transcriptEndRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const autoEndTimeoutRef = useRef<number | null>(null);

    const scenario = OFFICIAL_CALLER_SCENARIO;

    const handleEndCall = () => {
        if (autoEndTimeoutRef.current) {
            clearTimeout(autoEndTimeoutRef.current);
            autoEndTimeoutRef.current = null;
        }
        setCallStatus('ENDED');
        if (timerRef.current) clearInterval(timerRef.current);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    // Cleanup audio and auto-end timeout on component unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            if (autoEndTimeoutRef.current) {
                clearTimeout(autoEndTimeoutRef.current);
            }
        };
    }, []);

    // Auto-scroll transcript container as speech streams in
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [callElapsedMs]);

    // High-resolution 50ms interval timer for word-by-word streaming & continuous distress telemetry
    useEffect(() => {
        if (callStatus === 'CONNECTED') {
            timerRef.current = window.setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                setCallElapsedMs(elapsed);
                setCallDuration(Math.floor(elapsed / 1000));

                // Fallback: automatically end call 3s after audio finishes if event didn't trigger
                const audioDurationSec = audioRef.current?.duration && !isNaN(audioRef.current.duration)
                    ? audioRef.current.duration
                    : 59.87;
                const autoEndMs = Math.round((audioDurationSec + 3) * 1000);

                if (elapsed >= autoEndMs) {
                    handleEndCall();
                }
            }, 50);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [callStatus]);

    const handlePickUpCall = () => {
        if (autoEndTimeoutRef.current) {
            clearTimeout(autoEndTimeoutRef.current);
            autoEndTimeoutRef.current = null;
        }

        startTimeRef.current = Date.now();
        setCallStatus('CONNECTED');
        setCallElapsedMs(0);
        setCallDuration(0);
        setEscalated(false);
        setEscalationDocket(null);

        // Play call.wav audio
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio('/call.wav');
            }
            audioRef.current.currentTime = 0;

            // Automatically end the call 3 seconds after call.wav finishes playing
            audioRef.current.onended = () => {
                if (autoEndTimeoutRef.current) clearTimeout(autoEndTimeoutRef.current);
                autoEndTimeoutRef.current = window.setTimeout(() => {
                    handleEndCall();
                }, 3000);
            };

            audioRef.current.play().catch((err) => {
                console.warn('Audio playback error (user interaction or file loading):', err);
            });
        } catch (e) {
            console.warn('Audio creation error:', e);
        }
    };

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

    // Dialect defaults to English at first, then updates to Hindi once speech begins at 6.0s
    const detectedDialect = callElapsedMs >= 6000 ? 'Hindi (ग्रामीण हिंदी)' : 'English (Default)';

    // Copy follow up question to operator clipboard
    const handleCopyQuestion = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Dynamic progressive AI distress classification:
    // Evaluates constantly on every 50ms tick from exact millisecond telemetry - not in discrete chunks!
    const currentAssessment = getContinuousAssessment(callElapsedMs, callStatus);

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

    // AI Dynamic Follow-up Questions synthesized specifically from victim's statements across 5 phases
    const followUpQuestions = useMemo(() => {
        if (callStatus === 'WAITING' || callElapsedMs < 6000) {
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

        if (callElapsedMs >= 56000 || callStatus === 'ENDED') {
            return [
                {
                    id: 'q-line-5a',
                    tag: 'TACTICAL' as const,
                    tagColor: 'bg-red-100 text-red-900 border-red-400 font-bold',
                    textHindi: 'गाड़ी 4 मिनट में पहुँच रही है। घर के मुख्य दरवाजे की कुंडी अंदर से मजबूत रखें और खिड़कियों से दूर रहें।',
                    textEnglish: 'QRT unit is 4 minutes away. Keep main doors bolted from inside and stay away from windows.',
                    rationale: 'Imminent Intercept: Enforce defensive containment until tactical unit breach on site.'
                },
                {
                    id: 'q-line-5b',
                    tag: 'LOCATION' as const,
                    tagColor: 'bg-blue-100 text-blue-800 border-blue-300 font-bold',
                    textHindi: 'क्या गाँव की मुख्य गली में कोई अवरोध या ट्रैक्टर खड़ा है जिससे पुलिस गाड़ी रुक सकती है?',
                    textEnglish: 'Are there any roadblocks or tractors blocking the approach path in your village lane?',
                    rationale: 'Approach Route Navigation: Ensure unobstructed vehicle access for emergency vehicle.'
                },
                {
                    id: 'q-line-5c',
                    tag: 'SAFETY' as const,
                    tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
                    textHindi: 'कॉल चालू रखें। जब तक सायरन की आवाज न सुनाई दे, दरवाजा बिल्कुल न खोलें।',
                    textEnglish: 'Keep the call connected. Do not open the door until you hear the police siren outside.',
                    rationale: 'Active Victim Containment: Maintain continuous operator voice presence during crisis.'
                }
            ];
        }

        if (callElapsedMs >= 40000) {
            return [
                {
                    id: 'q-line-4a',
                    tag: 'CRITICAL' as const,
                    tagColor: 'bg-red-100 text-red-900 border-red-400 font-bold',
                    textHindi: 'बाहर कितने लोग जमा हैं और क्या उनके पास लाठी, कुल्हाड़ी या कोई हथियार दिखाई दे रहे हैं?',
                    textEnglish: 'How many perpetrators are assembled outside and are they brandishing weapons or tools?',
                    rationale: 'Mob Assessment: Relay threat capability and force scale to approaching QRT unit.'
                },
                {
                    id: 'q-line-4b',
                    tag: 'SAFETY' as const,
                    tagColor: 'bg-rose-100 text-rose-900 border-rose-300 font-bold',
                    textHindi: 'क्या आप और आपका परिवार घर के सबसे अंदरूनी और मजबूत कमरे में चले गए हैं?',
                    textEnglish: 'Have you and your family moved into the innermost secure room of the house?',
                    rationale: 'Shelter Protocol: Minimize exposure to stone pelting or door breach attempt.'
                },
                {
                    id: 'q-line-4c',
                    tag: 'LOCATION' as const,
                    tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
                    textHindi: 'गाँव में 112 गश्ती वाहन के पहुंचने के लिए कोई मुख्य पक्की सड़क, स्कूल या मंदिर जैसा सीधा लैंडमार्क बताएं।',
                    textEnglish: 'Specify the nearest roadside landmark or junction for the incoming emergency intercept vehicle.',
                    rationale: 'Rural Navigation: Prevent field unit delays in unmapped village lanes.'
                }
            ];
        }

        if (callElapsedMs >= 28700) {
            return [
                {
                    id: 'q-line-3a',
                    tag: 'STATUTORY' as const,
                    tagColor: 'bg-purple-100 text-purple-800 border-purple-300 font-bold',
                    textHindi: 'आपने किस स्थानीय थाने या चौकी में शिकायत दी थी और क्या कोई रिसीविंग या डायरी नंबर मिला था?',
                    textEnglish: 'Which local police station or outpost was the complaint filed at, and was a diary number issued?',
                    rationale: 'Institutional Compliance: Record administrative inaction under SC/ST Act Section 4.'
                },
                {
                    id: 'q-line-3b',
                    tag: 'SAFETY' as const,
                    tagColor: 'bg-red-100 text-red-900 border-red-300',
                    textHindi: 'क्या शिकायत के बाद आरोपियों ने थाने से वापस आने पर दोबारा कोई धमकी या चेतावनी दी थी?',
                    textEnglish: 'Did the accused issue fresh retaliatory threats after learning about the police complaint?',
                    rationale: 'Witness Retaliation Risk: Document secondary victimisation and intimidation.'
                },
                {
                    id: 'q-line-3c',
                    tag: 'LOCATION' as const,
                    tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
                    textHindi: 'गाँव में 112 गश्ती वाहन के पहुंचने के लिए कोई मुख्य पक्की सड़क, स्कूल या मंदिर जैसा सीधा लैंडमार्क बताएं।',
                    textEnglish: 'Specify the nearest roadside landmark or junction for the incoming emergency intercept vehicle.',
                    rationale: 'Rural Navigation: Prevent field unit delays in unmapped village lanes.'
                }
            ];
        }

        if (callElapsedMs >= 16000) {
            return [
                {
                    id: 'q-line-2a',
                    tag: 'MEDICAL' as const,
                    tagColor: 'bg-rose-100 text-rose-800 border-rose-300 font-bold',
                    textHindi: 'क्या आपके घायल भाई को तत्काल 108 एम्बुलेंस या अस्पताल ले जाने की आवश्यकता है?',
                    textEnglish: 'Does your assaulted brother have open wounds or require an immediate 108 ambulance dispatch?',
                    rationale: 'Active Trauma: Triage medical emergency services simultaneously.'
                },
                {
                    id: 'q-line-2b',
                    tag: 'SAFETY' as const,
                    tagColor: 'bg-red-100 text-red-900 border-red-400 font-bold',
                    textHindi: 'क्या मारपीट या धमकियों के दौरान हमलावरों के पास लाठी, डंडे या किसी प्रकार के हथियार मौजूद थे?',
                    textEnglish: 'Were any weapons, lathis, or sharp instruments brandished or used by the attackers?',
                    rationale: 'Threat Severity: Arming protocol assessment for QRT field responders.'
                },
                {
                    id: 'q-line-2c',
                    tag: 'LOCATION' as const,
                    tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
                    textHindi: 'गाँव में 112 गश्ती वाहन के पहुंचने के लिए कोई मुख्य पक्की सड़क, स्कूल या मंदिर जैसा सीधा लैंडमार्क बताएं।',
                    textEnglish: 'Specify the nearest roadside landmark or junction for the incoming emergency intercept vehicle.',
                    rationale: 'Rural Navigation: Prevent field unit delays in unmapped village lanes.'
                }
            ];
        }

        return [
            {
                id: 'q-line-1a',
                tag: 'EVIDENCE' as const,
                tagColor: 'bg-purple-100 text-purple-800 border-purple-300',
                textHindi: 'जातिगत गाली-गलौज और परेशान करने वाले मुख्य व्यक्तियों के नाम या उनके परिवार की पहचान बताएं।',
                textEnglish: 'Can you state the specific names or families in the village responsible for the harassment?',
                rationale: 'Statutory Identification: SC/ST (PoA) Act offense documentation.'
            },
            {
                id: 'q-line-1b',
                tag: 'SAFETY' as const,
                tagColor: 'bg-red-100 text-red-800 border-red-300',
                textHindi: 'क्या वे लोग इस समय आपके घर या रास्ते के बाहर जमा हैं?',
                textEnglish: 'Are the perpetrators currently assembled outside your residence or lane right now?',
                rationale: 'Physical Containment: Assess whether mob is actively surrounding the caller.'
            },
            {
                id: 'q-line-1c',
                tag: 'LOCATION' as const,
                tagColor: 'bg-blue-100 text-blue-800 border-blue-300',
                textHindi: 'गाँव में 112 गश्ती वाहन के पहुंचने के लिए कोई मुख्य पक्की सड़क, स्कूल या मंदिर जैसा सीधा लैंडमार्क बताएं।',
                textEnglish: 'Specify the nearest roadside landmark or junction for the incoming emergency intercept vehicle.',
                rationale: 'Rural Navigation: Prevent field unit delays in unmapped village lanes.'
            }
        ];
    }, [callElapsedMs, callStatus]);

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
                            <span>DIALECT: <strong className={callElapsedMs >= 6000 ? 'text-blue-950 font-bold' : 'text-slate-600'}>{detectedDialect}</strong></span>
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
>>>>>>> Stashed changes
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LEFT COLUMN: Upload Panel */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Upload Box */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
                        <h3 className="font-display font-bold text-base text-slate-800 mb-4">
                            Ingest Audio Call Recording
                        </h3>

                        {uploading ? (
                            <div className="border-2 border-dashed border-teal-200 bg-teal-50/10 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
                                <span className="w-10 h-10 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin"></span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">Connecting Audio Pipeline...</p>
                                    <p className="text-xs text-slate-400 mt-1 font-light">Validating waveforms and noise floors</p>
                                </div>
                            </div>
<<<<<<< Updated upstream
                        ) : uploadSuccess ? (
                            <div className="border-2 border-dashed border-emerald-200 bg-emerald-50/10 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">Upload Secured</p>
                                    <p className="text-xs text-emerald-700 mt-1 font-mono">{uploadSuccess}</p>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Redirecting to Live Triage Dashboard...</p>
                            </div>
                        ) : (
                            <label
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group relative ${dragOver
                                    ? 'border-teal-500 bg-teal-50/30 scale-[0.99]'
                                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                                    }`}
                            >
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <div className="w-12 h-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:scale-105 transition-all shadow-sm">
                                    <Upload size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        Drag and drop digital helpline audio recordings here
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 font-light">
                                        Supports MP3, WAV, M4A call recordings up to 50MB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="mt-2 text-xs font-semibold px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 shadow-xs hover:border-slate-300 transition-colors"
                                >
                                    Browse Files
                                </button>
                            </label>
                        )}
=======

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
>>>>>>> Stashed changes

                        {/* Disclaimer info */}
                        <div className="mt-4 flex items-start gap-2.5 bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-400 leading-normal font-light">
                            <AlertTriangle size={15} className="text-slate-400 shrink-0 mt-0.5" />
                            <p>
                                Ensure compliance: Only voice data collected under helpline consent waivers may be parsed. Raw voice files are processed locally and are deleted immediately upon browser session closing.
                            </p>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Preset Case Samples */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm shadow-slate-100/30">
                        <h3 className="font-display font-bold text-base text-slate-800 mb-1">
                            Select Preset Sample Call
                        </h3>
                        <p className="text-xs text-slate-400 font-light mb-6">
                            Load realistic interactions to demo analysis indicators.
                        </p>

                        <div className="space-y-4">
                            {cases.slice(0, 3).map((item) => (
                                <div
                                    key={item.id}
                                    className="border border-slate-100 rounded-xl p-4 hover:border-teal-100 hover:bg-teal-50/10 transition-all group flex flex-col justify-between h-42"
                                >
                                    <div>
                                        {/* ID & Language */}
                                        <div className="flex items-center justify-between">
                                            <span className="font-display font-semibold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
                                                {item.id}
                                            </span>
                                            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">
                                                {item.language}
                                            </span>
                                        </div>

                                        {/* Meta stats */}
                                        <div className="flex gap-4 mt-3 text-xs text-slate-400 font-light">
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {item.duration}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Languages size={12} />
                                                {item.language === 'Tamil' ? 'Tamil Dialect' : item.language === 'English' ? 'Standard English' : 'Hindi Dialect'}
                                            </span>
                                        </div>

                                        {/* Custom summary preview */}
                                        <p className="text-xs text-slate-500 mt-3.5 italic line-clamp-1 border-l-2 border-slate-100 pl-2">
                                            "{item.transcript[0]?.text}"
                                        </p>
                                    </div>

                                    {/* Trigger buttons */}
                                    <div className="flex items-center justify-end gap-2 border-t border-slate-100/60 pt-3 mt-3">
                                        <button
                                            onClick={() => handleSelectCase(item.id, true)}
                                            className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/60 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                                        >
                                            <Play size={11} className="stroke-[2.5]" />
                                            <span>Analyse Live</span>
                                        </button>
                                        <button
                                            onClick={() => handleSelectCase(item.id, false)}
                                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded h-8 transition-colors flex items-center"
                                        >
                                            <span>Skip to Results</span>
                                            <ChevronRight size={12} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

<<<<<<< Updated upstream
=======
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
                            ) : callStatus === 'CONNECTED' && callElapsedMs < 6000 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 animate-pulse">
                                    <Radio size={32} className="text-blue-900 mb-2 animate-spin" />
                                    <p className="text-xs font-semibold text-slate-700">Waiting for caller audio</p>
                                </div>
                            ) : (
                                scenario.lines.map((line) => {
                                    if (callStatus !== 'ENDED' && callElapsedMs < (line.startMs ?? 6000)) return null;

                                    const words = line.words ?? [];
                                    const visibleWords = callStatus === 'ENDED'
                                        ? words
                                        : words.filter((w) => callElapsedMs >= w.startMs);
                                    const isLineFinished = callStatus === 'ENDED' || callElapsedMs >= (line.endMs ?? 999999);

                                    return (
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
                                                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border transition-colors ${
                                                        currentAssessment.svi >= 61
                                                            ? 'bg-orange-100 text-orange-900 border-orange-300'
                                                            : currentAssessment.svi >= 31
                                                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                                                            : 'bg-slate-100 text-slate-700 border-slate-300'
                                                    }`}>
                                                        {line.indicatorTag}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Word-by-Word Hindi Transcript */}
                                            <p className="text-sm font-medium text-slate-900 leading-relaxed font-sans flex flex-wrap items-center">
                                                “{visibleWords.map((w, idx) => {
                                                    const isCurrentlySpeaking = callStatus === 'CONNECTED' && callElapsedMs >= w.startMs && callElapsedMs < w.endMs;
                                                    const isLatestWord = idx === visibleWords.length - 1 && callStatus === 'CONNECTED' && !isLineFinished;

                                                    return (
                                                        <span
                                                            key={w.id}
                                                            className={`inline-block mr-1.5 my-0.5 transition-all duration-150 ${
                                                                isCurrentlySpeaking
                                                                    ? 'text-blue-950 font-bold bg-amber-200/90 px-1 py-0.2 rounded shadow-2xs'
                                                                    : isLatestWord
                                                                    ? 'text-blue-900 font-semibold underline decoration-amber-500 decoration-2'
                                                                    : 'text-slate-900'
                                                            }`}
                                                        >
                                                            {w.word}
                                                        </span>
                                                    );
                                                })}”
                                                {!isLineFinished && (
                                                    <span className="inline-block w-1.5 h-4 bg-blue-900 ml-1 align-middle animate-pulse" />
                                                )}
                                            </p>

                                            {/* Subtitle / Translation */}
                                            {isLineFinished && (
                                                <div className="pt-1">
                                                    <p className="text-[11px] text-slate-600 italic border-l-2 border-slate-300 pl-2 font-light animate-fade-in">
                                                        Translation: "{line.englishTranslation}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
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

>>>>>>> Stashed changes
            </div>

        </div>
    );
};

export default VoiceAnalysis;
