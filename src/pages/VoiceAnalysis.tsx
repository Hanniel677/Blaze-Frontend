import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    PhoneCall,
    PhoneOff,
    PhoneIncoming,
    ShieldAlert,
    CheckCircle2,
    RotateCcw,
    Siren,
    Radio,
    FileText,
    MapPin,
    User,
    ArrowUpRight,
    Building2
} from 'lucide-react';
import { OFFICIAL_CALLER_SCENARIO, type CallerScriptLine } from '../data/demoScript';

const EMERGENCY_DEPARTMENTS = [
    {
        id: 'police',
        name: 'Police Department (PCR / 112 QRT)',
        subtext: 'Active harassment, bullying, violence & physical threats',
        badge: 'URGENT DISPATCH'
    },
    {
        id: 'sc_st_cell',
        name: 'Special SC/ST Atrocities Protection Cell',
        subtext: 'Caste-based discrimination & systemic harassment',
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

    const timerRef = useRef<number | null>(null);
    const transcriptEndRef = useRef<HTMLDivElement | null>(null);

    const scenario = OFFICIAL_CALLER_SCENARIO;

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

    const handleReset = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setCallStatus('WAITING');
        setCallDuration(0);
        setDisplayedLines([]);
        setEscalated(false);
        setEscalationDocket(null);
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

    // Dialect defaults to English at first, then updates to Hindi as audio plays
    const detectedDialect = displayedLines.length === 0 ? 'English (Default)' : 'Hindi (ग्रामीण हिंदी)';

    // Dynamic progressive AI distress classification: starts at absolute 0 and moves up/down in real time
    const currentAssessment = useMemo(() => {
        const count = displayedLines.length;

        if (count === 0) {
            return {
                svi: 0,
                risk: 'NORMAL' as const,
                confidence: 0,
                vulnerabilityDomain: 'Awaiting Caller Statement...',
                stressLevel: 'No acoustic distress detected (0%)',
                recommendedAction: 'Awaiting caller speech input on emergency line.',
                badgeClass: 'bg-slate-500 text-white',
                scoreColor: 'text-slate-600',
                borderClass: 'border-slate-300'
            };
        } else if (count === 1) {
            // Line 1: Harassment & humiliation
            return {
                svi: 48,
                risk: 'MODERATE' as const,
                confidence: 68,
                vulnerabilityDomain: 'Caste-based Harassment & Discrimination',
                stressLevel: 'Audible Vocal Quiver & Distress Markers (48%)',
                recommendedAction: 'Log caller location details and assess threat severity.',
                badgeClass: 'bg-amber-600 text-white',
                scoreColor: 'text-amber-600',
                borderClass: 'border-amber-400'
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
                badgeClass: 'bg-orange-600 text-white',
                scoreColor: 'text-orange-600',
                borderClass: 'border-orange-500'
            };
        } else if (count === 3) {
            // Line 3: Systemic neglect / complaint filed previously without help
            // Score dips to 72 reflecting tone transition from active panic to despair
            return {
                svi: 72,
                risk: 'HIGH' as const,
                confidence: 89,
                vulnerabilityDomain: 'Systemic Neglect & Ongoing Vulnerability',
                stressLevel: 'Suppressed Desperation & Emotional Fatigue (72%)',
                recommendedAction: 'Helpline priority escalation. Prepare multi-agency dispatch.',
                badgeClass: 'bg-orange-600 text-white',
                scoreColor: 'text-orange-600',
                borderClass: 'border-orange-500'
            };
        } else {
            // Line 4 / Final: Acute fear of imminent retaliation & urgent cry for help
            return {
                svi: 86,
                risk: 'CRITICAL' as const,
                confidence: 93,
                vulnerabilityDomain: 'Active Targeted Violence & Imminent Physical Danger',
                stressLevel: 'Critical Vocal Tremor & Severe Agitation (87%)',
                recommendedAction: 'Critical Threat Level: Immediate Police Quick Response Team (QRT) Handover Authorized.',
                badgeClass: 'bg-red-700 text-white',
                scoreColor: 'text-red-700',
                borderClass: 'border-red-700'
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
                            NHAA Emergency Helpline — Voice Triage Console
                        </h2>
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] mt-0.5">
                            <span>SESSION: <strong>{scenario.callId}</strong></span>
                            <span>|</span>
                            <span>DIALECT: <strong className={displayedLines.length > 0 ? 'text-blue-950' : 'text-slate-600'}>{detectedDialect}</strong></span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleReset}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors"
                        title="Reset Call"
                    >
                        <RotateCcw size={13} />
                        <span>Reset Call</span>
                    </button>
                </div>
            </div>

            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT SIDE (4/12): Incoming Call Status & Call Action Desk */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Incoming Call / Active Call Card */}
                    <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
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
                                    CALL DISCONNECTED
                                </span>
                            )}
                        </div>

                        {/* Caller Information Box */}
                        <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs ${
                                    callStatus === 'WAITING' ? 'bg-amber-500 animate-bounce' :
                                    callStatus === 'CONNECTED' ? 'bg-emerald-600' : 'bg-slate-700'
                                }`}>
                                    {callStatus === 'WAITING' ? <PhoneIncoming size={22} /> :
                                     callStatus === 'CONNECTED' ? <PhoneCall size={22} className="animate-pulse" /> :
                                     <PhoneOff size={22} />}
                                </div>
                                <div className="overflow-hidden">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
                                        CALLER TELEPHONY ID
                                    </span>
                                    <h3 className="text-base font-bold text-slate-900 font-mono tracking-tight truncate">
                                        {scenario.callerNumber}
                                    </h3>
                                    <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                        <MapPin size={11} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{scenario.callerLocation}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Live Call Duration Clock */}
                            <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
                                <span className="text-slate-500 font-medium">Call Duration:</span>
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
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors"
                                >
                                    <PhoneCall size={18} />
                                    <span>Pick Up Call (Answer)</span>
                                </button>
                            )}

                            {callStatus === 'CONNECTED' && (
                                <button
                                    onClick={handleEndCall}
                                    className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                >
                                    <PhoneOff size={18} />
                                    <span>Disconnect / End Call</span>
                                </button>
                            )}

                            {callStatus === 'ENDED' && (
                                <button
                                    onClick={handlePickUpCall}
                                    className="w-full bg-blue-900 hover:bg-blue-950 text-white font-bold py-2.5 px-4 rounded text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                >
                                    <RotateCcw size={14} />
                                    <span>Reset Call Session</span>
                                </button>
                            )}
                        </div>

                        {/* System Notice */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-950 font-light leading-snug">
                            {callStatus === 'WAITING' ? (
                                <p>Incoming emergency distress call detected. Click <strong>"Pick Up Call"</strong> to answer the line and view real-time live transcription.</p>
                            ) : callStatus === 'CONNECTED' ? (
                                <p className="text-emerald-900 font-medium">Call connected. Transcribing caller audio stream in real time.</p>
                            ) : (
                                <p>Call disconnected. Triage assessment and escalation options available below.</p>
                            )}
                        </div>
                    </div>

                    {/* Triage Assessment Result (Rendered when call is active or finished) */}
                    {callStatus !== 'WAITING' && (
                        <div className={`bg-white border-2 ${currentAssessment.borderClass} rounded-md p-5 shadow-xs space-y-4 animate-fade-in transition-all duration-300`}>
                            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldAlert size={16} className={currentAssessment.risk === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'} />
                                    <span>AI Distress Classification</span>
                                </h3>
                                <span className={`${currentAssessment.badgeClass} text-[10px] font-bold px-2 py-0.5 rounded font-mono transition-colors duration-300`}>
                                    {currentAssessment.risk}
                                </span>
                            </div>

                            {/* SVI Score Metric */}
                            <div className="flex items-baseline justify-between bg-slate-50 p-3 rounded border border-slate-200">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-500 block">
                                        Stress & Vulnerability Index (SVI)
                                    </span>
                                    <span className={`text-3xl font-black ${currentAssessment.scoreColor} font-mono transition-colors duration-300`}>
                                        {currentAssessment.svi}
                                    </span>
                                    <span className="text-xs text-slate-500 font-mono"> / 100</span>
                                </div>
                                <div className="text-right text-xs">
                                    <span className="text-slate-500 block">Confidence</span>
                                    <span className="font-bold text-slate-900 font-mono">{currentAssessment.confidence}%</span>
                                </div>
                            </div>

                            {/* Risk Details */}
                            <div className="space-y-2 text-xs">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Identified Vulnerability Domain:</span>
                                    <p className="font-bold text-slate-900 text-xs mt-0.5">
                                        {currentAssessment.vulnerabilityDomain}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Acoustic Stress Telemetry:</span>
                                    <p className="text-slate-700 font-medium text-xs mt-0.5">
                                        {currentAssessment.stressLevel}
                                    </p>
                                </div>

                                <div className="border-t border-slate-200 pt-2">
                                    <span className={`text-[10px] font-bold uppercase block ${currentAssessment.risk === 'CRITICAL' ? 'text-red-700' : 'text-slate-700'}`}>Recommended Action:</span>
                                    <p className="text-xs text-slate-800 font-medium mt-0.5 leading-snug">
                                        {currentAssessment.recommendedAction}
                                    </p>
                                </div>
                            </div>

                            {/* Department Escalation & Handover Module */}
                            <div className="border-t border-slate-200 pt-3 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-700 flex items-center gap-1.5">
                                        <Building2 size={13} className="text-blue-900" />
                                        Department Escalation Handover
                                    </span>
                                    {isEscalationAvailable && (
                                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-bold">
                                            HANDOVER READY
                                        </span>
                                    )}
                                </div>

                                {!isEscalationAvailable ? (
                                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-500 font-light">
                                        Escalation protocols activate when SVI reaches Moderate/High (≥ 48) or once call concludes.
                                    </div>
                                ) : !escalated ? (
                                    <div className="space-y-2.5">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                Select Intervention Department:
                                            </label>
                                            <select
                                                value={selectedDepartment}
                                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded text-slate-900 font-medium focus:bg-white focus:border-blue-900 outline-none cursor-pointer"
                                            >
                                                {EMERGENCY_DEPARTMENTS.map((dept) => (
                                                    <option key={dept.id} value={dept.name}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-500 italic mt-1">
                                                * For live harassment, bullying, or violence, handover directly to Police Control Room.
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleEscalateCall}
                                            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2.5 px-3 rounded text-xs uppercase flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                        >
                                            <Siren size={15} />
                                            <span>Hand Over Call to {selectedDepartment.split('(')[0]}</span>
                                            <ArrowUpRight size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 border border-emerald-400 rounded-md p-3 text-xs space-y-1.5 animate-fade-in">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                                                <CheckCircle2 size={16} className="text-emerald-700" />
                                                Call Escalated & Handed Over
                                            </span>
                                            <span className="bg-emerald-700 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                DISPATCH NOTIFIED
                                            </span>
                                        </div>
                                        <p className="text-emerald-950 font-semibold text-[11px]">
                                            Department: <span className="underline">{escalationDocket?.department}</span>
                                        </p>
                                        <div className="text-[10px] font-mono text-emerald-800 space-y-0.5 pt-1 border-t border-emerald-200">
                                            <div>Transfer Docket: <strong>{escalationDocket?.docketId}</strong></div>
                                            <div>Duty Officer: <strong>Priya Sharma (OP-0482)</strong> at {escalationDocket?.timestamp}</div>
                                            <div className="text-emerald-900 font-sans font-medium mt-1">
                                                ✓ Audio recording & real-time telemetry forwarded to Police QRT mobile unit.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* CENTER / RIGHT SIDE (8/12): Full Vertical Live Transcript Display */}
                <div className="lg:col-span-8">
                    <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs flex flex-col h-[640px]">
                        {/* Transcript Box Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                    <FileText size={16} className="text-blue-950" />
                                    <span>Live Caller Audio Speech Transcription</span>
                                </h3>
                                <p className="text-xs text-slate-500 font-light mt-0.5">
                                    Real-time transcript of caller audio (Operator audio suppressed)
                                </p>
                            </div>

                            <span className="text-[10px] font-mono bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-bold">
                                {callStatus === 'CONNECTED' ? 'LIVE AUDIO STREAM' : callStatus === 'ENDED' ? 'CALL ARCHIVED' : 'STANDBY'}
                            </span>
                        </div>

                        {/* Transcript Scrolling Body */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {callStatus === 'WAITING' ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                    <PhoneCall size={44} className="stroke-[1.3] mb-3 text-slate-300" />
                                    <p className="text-base font-bold text-slate-800">
                                        Terminal Waiting for Call Connection
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm font-light leading-relaxed">
                                        An emergency distress call is pending on Line 1 from <strong>{scenario.callerNumber}</strong>.
                                        Click <strong>"Pick Up Call"</strong> on the left to answer and begin live transcription.
                                    </p>
                                </div>
                            ) : displayedLines.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 animate-pulse">
                                    <Radio size={36} className="text-blue-900 mb-2 animate-spin" />
                                    <p className="text-xs font-semibold text-slate-700">Connecting audio telemetry stream...</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Calibrating acoustic noise filters</p>
                                </div>
                            ) : (
                                displayedLines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="p-4 rounded-md border border-slate-200 bg-amber-50/40 text-slate-900 space-y-2 animate-fade-in shadow-2xs"
                                    >
                                        {/* Line Header with Speaker & Timestamp */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-amber-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
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
                                        <p className="text-base font-medium text-slate-900 leading-relaxed font-sans">
                                            "{line.text}"
                                        </p>

                                        {/* English Translation Subtitle */}
                                        {line.englishTranslation && (
                                            <p className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2 font-light">
                                                Translation: "{line.englishTranslation}"
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Live Streaming Typing Indicator */}
                            {callStatus === 'CONNECTED' && (
                                <div className="flex items-center gap-2 p-2.5 text-xs font-mono text-slate-600 bg-slate-50 rounded border border-slate-200 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                    <span>Caller voice stream live • Transcribing audio in real time...</span>
                                </div>
                            )}

                            <div ref={transcriptEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceAnalysis;
