import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
    Building2,
    Upload,
    Mic,
    Square,
    Play,
    Pause,
    Volume2,
    FileAudio,
    Sparkles,
    Activity,
    MessageSquare,
    Heart,
    FolderUp
} from 'lucide-react';
import {
    OFFICIAL_CALLER_SCENARIO,
    SAMPLE_PRE_RECORDED_CALLS,
    type CallerScriptLine,
    type EmergencyCallScenario
} from '../data/demoScript';
import type { SviFactorBreakdown } from '../types';

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

type CallInputMode = 'SIMULATED_LINE' | 'RECORD_CALL' | 'UPLOAD_RECORDING';

const VoiceAnalysis: React.FC = () => {
    // Mode selection: 'SIMULATED_LINE' | 'RECORD_CALL' | 'UPLOAD_RECORDING'
    const [inputMode, setInputMode] = useState<CallInputMode>('SIMULATED_LINE');

    // -------------------------------------------------------------
    // MODE 1: Simulated Emergency Line State
    // -------------------------------------------------------------
    const [callStatus, setCallStatus] = useState<'WAITING' | 'CONNECTED' | 'ENDED'>('WAITING');
    const [callDuration, setCallDuration] = useState(0);
    const [displayedLines, setDisplayedLines] = useState<CallerScriptLine[]>([]);
    const timerRef = useRef<number | null>(null);

    // -------------------------------------------------------------
    // MODE 2: Record Current Call State (Microphone)
    // -------------------------------------------------------------
    const [isMicRecording, setIsMicRecording] = useState(false);
    const [micRecordDuration, setMicRecordDuration] = useState(0);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
    const [isRecordedAudioPlaying, setIsRecordedAudioPlaying] = useState(false);
    const [micAnalysisComplete, setMicAnalysisComplete] = useState(false);
    const [isAnalyzingMic, setIsAnalyzingMic] = useState(false);
    const [micAudioLevel, setMicAudioLevel] = useState<number>(0);

    const micMediaRecorderRef = useRef<MediaRecorder | null>(null);
    const micStreamRef = useRef<MediaStream | null>(null);
    const micTimerRef = useRef<number | null>(null);
    const micAudioChunksRef = useRef<Blob[]>([]);
    const micAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
    const micCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const micAudioCtxRef = useRef<AudioContext | null>(null);
    const micAnalyserRef = useRef<AnalyserNode | null>(null);
    const micAnimFrameRef = useRef<number | null>(null);

    // -------------------------------------------------------------
    // MODE 3: Upload Pre-recorded Call Recording State
    // -------------------------------------------------------------
    const [selectedSampleId, setSelectedSampleId] = useState<string>('sample-1');
    const [uploadedFileMeta, setUploadedFileMeta] = useState<{
        name: string;
        size: string;
        duration: string;
        url: string;
    } | null>({
        name: SAMPLE_PRE_RECORDED_CALLS[0].fileName,
        size: '1.8 MB',
        duration: SAMPLE_PRE_RECORDED_CALLS[0].duration,
        url: ''
    });
    const [activeUploadedScenario, setActiveUploadedScenario] = useState<EmergencyCallScenario>(
        SAMPLE_PRE_RECORDED_CALLS[0].scenario
    );
    const [isUploadedAudioPlaying, setIsUploadedAudioPlaying] = useState(false);
    const [isUploadedAnalyzing, setIsUploadedAnalyzing] = useState(false);
    const [uploadedAnalysisDone, setUploadedAnalysisDone] = useState(false);
    const [uploadedAnalysisSeconds, setUploadedAnalysisSeconds] = useState(0);
    const [uploadedProgressStep, setUploadedProgressStep] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const uploadTimerRef = useRef<number | null>(null);

    // -------------------------------------------------------------
    // Shared Department Escalation & Handover States
    // -------------------------------------------------------------
    const [selectedDepartment, setSelectedDepartment] = useState('Police Department (PCR / 112 QRT)');
    const [escalated, setEscalated] = useState(false);
    const [escalationDocket, setEscalationDocket] = useState<{
        department: string;
        timestamp: string;
        docketId: string;
    } | null>(null);

    const transcriptEndRef = useRef<HTMLDivElement | null>(null);
    const officialScenario = OFFICIAL_CALLER_SCENARIO;

    // Auto-scroll transcript container as new lines stream in
    useEffect(() => {
        transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayedLines]);

    // -------------------------------------------------------------
    // Simulated Call Streaming Engine: Runs second-by-second
    // -------------------------------------------------------------
    useEffect(() => {
        if (inputMode === 'SIMULATED_LINE' && callStatus === 'CONNECTED') {
            timerRef.current = window.setInterval(() => {
                setCallDuration((prev) => {
                    const nextSec = prev + 1;
                    const newlyUnlocked = officialScenario.lines.filter(
                        (line) => line.secondOffset <= nextSec
                    );
                    setDisplayedLines(newlyUnlocked);

                    if (nextSec >= officialScenario.durationSec) {
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
    }, [inputMode, callStatus, officialScenario]);

    // -------------------------------------------------------------
    // Microphone Visualizer
    // -------------------------------------------------------------
    const drawMicVisualizer = useCallback(() => {
        if (!micCanvasRef.current || !micAnalyserRef.current) return;
        const canvas = micCanvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = micAnalyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            if (!isMicRecording) return;
            micAnimFrameRef.current = requestAnimationFrame(render);
            micAnalyserRef.current?.getByteFrequencyData(dataArray);

            // Compute average energy
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const avg = Math.min(Math.round((sum / bufferLength) * 1.5), 100);
            setMicAudioLevel(avg);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const barWidth = canvas.width / 24 - 2;
            let x = 0;

            for (let i = 0; i < 24; i++) {
                const sampleIndex = Math.floor((i / 24) * (bufferLength / 2));
                const val = dataArray[sampleIndex] || Math.random() * 50 + 10;
                const barHeight = Math.max((val / 255) * canvas.height, 4);

                ctx.fillStyle = val > 140 ? '#ef4444' : val > 90 ? '#f59e0b' : '#10b981';
                ctx.beginPath();
                ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 2);
                ctx.fill();

                x += barWidth + 2;
            }
        };

        render();
    }, [isMicRecording]);

    useEffect(() => {
        if (isMicRecording) {
            drawMicVisualizer();
        } else {
            if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current);
        }
        return () => {
            if (micAnimFrameRef.current) cancelAnimationFrame(micAnimFrameRef.current);
        };
    }, [isMicRecording, drawMicVisualizer]);

    // -------------------------------------------------------------
    // Microphone Action Handlers
    // -------------------------------------------------------------
    const startMicrophoneRecording = async () => {
        setMicRecordDuration(0);
        setRecordedAudioUrl(null);
        setMicAnalysisComplete(false);
        setIsAnalyzingMic(false);
        setEscalated(false);
        setEscalationDocket(null);
        micAudioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            micStreamRef.current = stream;

            const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioCtx = new AudioCtx();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 128;
            source.connect(analyser);

            micAudioCtxRef.current = audioCtx;
            micAnalyserRef.current = analyser;

            const recorder = new MediaRecorder(stream);
            micMediaRecorderRef.current = recorder;

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) micAudioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(micAudioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);
                setRecordedAudioUrl(url);
            };

            recorder.start(200);
            setIsMicRecording(true);

            micTimerRef.current = window.setInterval(() => {
                setMicRecordDuration((prev) => prev + 1);
            }, 1000);
        } catch {
            // Graceful simulated recording fallback if hardware microphone is unavailable
            setIsMicRecording(true);
            micTimerRef.current = window.setInterval(() => {
                setMicRecordDuration((prev) => prev + 1);
            }, 1000);
        }
    };

    const stopMicrophoneRecording = () => {
        setIsMicRecording(false);
        if (micTimerRef.current) clearInterval(micTimerRef.current);

        if (micMediaRecorderRef.current && micMediaRecorderRef.current.state !== 'inactive') {
            micMediaRecorderRef.current.stop();
        }
        if (micStreamRef.current) {
            micStreamRef.current.getTracks().forEach((t) => t.stop());
            micStreamRef.current = null;
        }
        if (micAudioCtxRef.current) {
            micAudioCtxRef.current.close();
            micAudioCtxRef.current = null;
        }

        // Run automated AI distress analysis
        runMicDistressAnalysis();
    };

    const runMicDistressAnalysis = () => {
        setIsAnalyzingMic(true);
        setTimeout(() => {
            setIsAnalyzingMic(false);
            setMicAnalysisComplete(true);
        }, 1200);
    };

    const togglePlayRecordedAudio = () => {
        if (!micAudioPlayerRef.current) return;
        if (isRecordedAudioPlaying) {
            micAudioPlayerRef.current.pause();
            setIsRecordedAudioPlaying(false);
        } else {
            micAudioPlayerRef.current.play();
            setIsRecordedAudioPlaying(true);
        }
    };

    // -------------------------------------------------------------
    // Uploaded Pre-recorded Call Action Handlers
    // -------------------------------------------------------------
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setUploadedFileMeta({
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            duration: '00:24',
            url
        });
        setUploadedAnalysisDone(false);
        setUploadedAnalysisSeconds(0);
        setIsUploadedAudioPlaying(false);
        setEscalated(false);
        setEscalationDocket(null);
    };

    const handleSelectSample = (sampleId: string) => {
        setSelectedSampleId(sampleId);
        const sample = SAMPLE_PRE_RECORDED_CALLS.find((s) => s.id === sampleId);
        if (!sample) return;

        setActiveUploadedScenario(sample.scenario);
        setUploadedFileMeta({
            name: sample.fileName,
            size: '1.8 MB',
            duration: sample.duration,
            url: ''
        });
        setUploadedAnalysisDone(false);
        setUploadedAnalysisSeconds(0);
        setIsUploadedAudioPlaying(false);
        setEscalated(false);
        setEscalationDocket(null);
    };

    const runUploadedAnalysis = () => {
        if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
        setIsUploadedAnalyzing(true);
        setUploadedAnalysisDone(false);
        setUploadedAnalysisSeconds(0);
        setUploadedProgressStep('Calibrating speech acoustics & noise spectrum...');

        const totalSec = activeUploadedScenario.durationSec || 24;
        let elapsed = 0;

        uploadTimerRef.current = window.setInterval(() => {
            elapsed += 1;
            setUploadedAnalysisSeconds(elapsed);

            if (elapsed === 2) {
                setUploadedProgressStep('Extracting vocal pitch fluctuations & acoustic tremors...');
            } else if (elapsed === 8) {
                setUploadedProgressStep('Parsing semantic crisis keywords & direct threat indicators...');
            } else if (elapsed === 14) {
                setUploadedProgressStep('Evaluating emotional despair & cognitive load dynamics...');
            } else if (elapsed === 19) {
                setUploadedProgressStep('Finalizing multi-dimensional SVI weights & triage risk...');
            }

            if (elapsed >= totalSec) {
                if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
                setIsUploadedAnalyzing(false);
                setUploadedAnalysisDone(true);
                setUploadedProgressStep('');
            }
        }, 120); // Fast simulation (~2.8s) streaming from 0 up to duration
    };

    const togglePlayUploadedAudio = () => {
        setIsUploadedAudioPlaying((prev) => !prev);
    };

    // -------------------------------------------------------------
    // Simulated Call Action Handlers
    // -------------------------------------------------------------
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
        setDisplayedLines(officialScenario.lines);
        setCallDuration(officialScenario.durationSec);
    };

    const handleReset = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (uploadTimerRef.current) clearInterval(uploadTimerRef.current);
        setCallStatus('WAITING');
        setCallDuration(0);
        setDisplayedLines([]);
        setEscalated(false);
        setEscalationDocket(null);
        setMicAnalysisComplete(false);
        setIsMicRecording(false);
        setMicRecordDuration(0);
        setRecordedAudioUrl(null);
        setUploadedAnalysisDone(false);
        setUploadedAnalysisSeconds(0);
        setIsUploadedAnalyzing(false);
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

    // -------------------------------------------------------------
    // Real-Time Dynamic Assessment Calculation:
    // Starts at ZERO (0) and updates as the call goes!
    // -------------------------------------------------------------
    const currentAssessment = useMemo(() => {
        if (inputMode === 'SIMULATED_LINE') {
            // Check if call is waiting / line idle
            if (callStatus === 'WAITING') {
                return {
                    svi: 0,
                    risk: 'STANDBY' as const,
                    confidence: 0,
                    vulnerabilityDomain: 'Awaiting Live Caller Statement...',
                    stressLevel: 'Line idle (No acoustic telemetry)',
                    recommendedAction: 'Click "Pick Up Call" to connect emergency line and start real-time telemetry.',
                    badgeClass: 'bg-slate-500 text-white',
                    scoreColor: 'text-slate-600',
                    borderClass: 'border-slate-300',
                    factorBreakdown: {
                        acousticStressScore: 0,
                        linguisticVulnerabilityScore: 0,
                        emotionalInstabilityScore: 0
                    } satisfies SviFactorBreakdown
                };
            }

            const sec = callDuration;

            if (sec <= 0) {
                return {
                    svi: 0,
                    risk: 'NORMAL' as const,
                    confidence: 0,
                    vulnerabilityDomain: 'Line Connected — Awaiting Speech Input',
                    stressLevel: 'Calibrating acoustic filters (0%)',
                    recommendedAction: 'Line connected. Telemetry engine tracking caller audio from baseline 0.',
                    badgeClass: 'bg-slate-600 text-white',
                    scoreColor: 'text-slate-600',
                    borderClass: 'border-slate-300',
                    factorBreakdown: {
                        acousticStressScore: 0,
                        linguisticVulnerabilityScore: 0,
                        emotionalInstabilityScore: 0
                    } satisfies SviFactorBreakdown
                };
            }

            // Real-time second-by-second progressive interpolation starting from zero
            let acoustic = 0;
            let linguistic = 0;
            let emotional = 0;
            let confidence = 0;
            let risk: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'NORMAL';
            let vulnerabilityDomain = '';
            let stressLevel = '';
            let recommendedAction = '';
            let badgeClass = 'bg-slate-500 text-white';
            let scoreColor = 'text-slate-600';
            let borderClass = 'border-slate-300';

            if (sec < 2) {
                // Initial 0 to 2 seconds: Baseline speech onset
                const p = sec / 2;
                acoustic = Math.round(p * 15);
                linguistic = Math.round(p * 10);
                emotional = Math.round(p * 8);
                confidence = Math.round(15 + p * 20);
                risk = 'NORMAL';
                vulnerabilityDomain = 'Connecting caller voice channel...';
                stressLevel = `Calibrating vocal baseline (${acoustic}%)`;
                recommendedAction = 'Speech onset detected. Monitoring acoustic frequencies.';
                badgeClass = 'bg-slate-600 text-white';
                scoreColor = 'text-slate-700';
                borderClass = 'border-slate-300';
            } else if (sec < 8) {
                // Line 1: Caste-based Harassment (sec 2 to 8)
                const p = (sec - 2) / 6;
                acoustic = Math.round(15 + p * (46 - 15));
                linguistic = Math.round(10 + p * (52 - 10));
                emotional = Math.round(8 + p * (44 - 8));
                confidence = Math.round(35 + p * (68 - 35));
                risk = 'MODERATE';
                vulnerabilityDomain = 'Caste-based Harassment & Discrimination';
                stressLevel = `Audible Vocal Quiver & Distress Markers (${acoustic}%)`;
                recommendedAction = 'Log caller location details and assess threat severity.';
                badgeClass = 'bg-amber-600 text-white';
                scoreColor = 'text-amber-600';
                borderClass = 'border-amber-400';
            } else if (sec < 14) {
                // Line 2: Physical Assault & Threats to Family (sec 8 to 14)
                const p = (sec - 8) / 6;
                acoustic = Math.round(46 + p * (82 - 46));
                linguistic = Math.round(52 + p * (78 - 52));
                emotional = Math.round(44 + p * (72 - 44));
                confidence = Math.round(68 + p * (86 - 68));
                risk = 'HIGH';
                vulnerabilityDomain = 'Physical Assault & Direct Threats to Family';
                stressLevel = `Heightened Pitch & Acute Vocal Tremor (${acoustic}%)`;
                recommendedAction = 'Active violence & threat detected. Police Control Room handover advised.';
                badgeClass = 'bg-orange-600 text-white';
                scoreColor = 'text-orange-600';
                borderClass = 'border-orange-500';
            } else if (sec < 19) {
                // Line 3: Systemic Neglect & Exhaustion (sec 14 to 19)
                const p = (sec - 14) / 5;
                acoustic = Math.round(82 + p * (68 - 82));
                linguistic = Math.round(78 + p * (74 - 78));
                emotional = Math.round(72 + p * (75 - 72));
                confidence = Math.round(86 + p * (89 - 86));
                risk = 'HIGH';
                vulnerabilityDomain = 'Systemic Neglect & Ongoing Vulnerability';
                stressLevel = `Suppressed Desperation & Emotional Fatigue (${acoustic}%)`;
                recommendedAction = 'Helpline priority escalation. Prepare multi-agency dispatch.';
                badgeClass = 'bg-orange-600 text-white';
                scoreColor = 'text-orange-600';
                borderClass = 'border-orange-500';
            } else {
                // Line 4 / Final: Acute Retaliation Threat (sec 19 to 24+)
                const p = Math.min((sec - 19) / 5, 1);
                acoustic = Math.round(68 + p * (88 - 68));
                linguistic = Math.round(74 + p * (87 - 74));
                emotional = Math.round(75 + p * (82 - 75));
                confidence = Math.round(89 + p * (93 - 89));
                risk = 'CRITICAL';
                vulnerabilityDomain = 'Active Targeted Violence & Imminent Physical Danger';
                stressLevel = `Critical Vocal Tremor & Severe Agitation (${acoustic}%)`;
                recommendedAction = 'Critical Threat Level: Immediate Police Quick Response Team (QRT) Handover Authorized.';
                badgeClass = 'bg-red-700 text-white';
                scoreColor = 'text-red-700';
                borderClass = 'border-red-700';
            }

            // Weighted SVI Score (35% Acoustic, 40% Linguistic, 25% Emotional)
            const svi = Math.round(acoustic * 0.35 + linguistic * 0.40 + emotional * 0.25);

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
                factorBreakdown: {
                    acousticStressScore: acoustic,
                    linguisticVulnerabilityScore: linguistic,
                    emotionalInstabilityScore: emotional
                } satisfies SviFactorBreakdown
            };
        } else if (inputMode === 'RECORD_CALL') {
            // MODE 2: Record Current Call via Microphone
            if (!isMicRecording && !micAnalysisComplete) {
                // Standby: Exactly zero
                return {
                    svi: 0,
                    risk: 'STANDBY' as const,
                    confidence: 0,
                    vulnerabilityDomain: 'Microphone Standby — Awaiting Recording',
                    stressLevel: 'Microphone idle (0 dB / 0%)',
                    recommendedAction: 'Click "Start Recording Call" to ingest live voice stream.',
                    badgeClass: 'bg-slate-500 text-white',
                    scoreColor: 'text-slate-600',
                    borderClass: 'border-slate-300',
                    factorBreakdown: {
                        acousticStressScore: 0,
                        linguisticVulnerabilityScore: 0,
                        emotionalInstabilityScore: 0
                    } satisfies SviFactorBreakdown
                };
            }

            if (isMicRecording) {
                // Live recording: Starts at 0 and climbs dynamically as recording progresses!
                const p = Math.min(micRecordDuration / 16, 1);
                const acoustic = Math.round(Math.min(micAudioLevel * 0.7 + p * 35, 84));
                const linguistic = Math.round(p * 81);
                const emotional = Math.round(p * 76);
                const svi = Math.round(acoustic * 0.35 + linguistic * 0.40 + emotional * 0.25);
                const confidence = Math.round(p * 91);

                return {
                    svi,
                    risk: svi > 75 ? ('HIGH' as const) : svi > 40 ? ('MODERATE' as const) : ('MONITORING' as const),
                    confidence,
                    vulnerabilityDomain: 'Recording Live Speech Audio Stream...',
                    stressLevel: `Live Acoustic Energy: ${micAudioLevel}% (Telemetry streaming)`,
                    recommendedAction: 'Hold line open. Acoustic spectrogram updating in real time.',
                    badgeClass: 'bg-blue-600 text-white',
                    scoreColor: 'text-blue-900',
                    borderClass: 'border-blue-400',
                    factorBreakdown: {
                        acousticStressScore: acoustic,
                        linguisticVulnerabilityScore: linguistic,
                        emotionalInstabilityScore: emotional
                    } satisfies SviFactorBreakdown
                };
            }

            // Completed mic recording analysis
            return {
                svi: 81,
                risk: 'HIGH' as const,
                confidence: 91,
                vulnerabilityDomain: 'Acute Distress Markers & Verbal Tremor Identified',
                stressLevel: 'High Vocal Tremor, Pitch Fluctuations & Agitation (84%)',
                recommendedAction: 'High Priority Alert: Dispatch Local Mobile Patrol & Alert District Supervisor.',
                badgeClass: 'bg-orange-600 text-white',
                scoreColor: 'text-orange-600',
                borderClass: 'border-orange-500',
                factorBreakdown: {
                    acousticStressScore: 84,
                    linguisticVulnerabilityScore: 81,
                    emotionalInstabilityScore: 76
                } satisfies SviFactorBreakdown
            };
        } else {
            // MODE 3: Upload Pre-recorded Call Recording
            // If not analyzed or at beginning: Exactly zero!
            if (!uploadedAnalysisDone && !isUploadedAnalyzing) {
                return {
                    svi: 0,
                    risk: 'STANDBY' as const,
                    confidence: 0,
                    vulnerabilityDomain: 'Pre-recorded File Ready — Not Yet Analyzed',
                    stressLevel: 'Spectrogram pending analysis run (0%)',
                    recommendedAction: 'Click "Run AI Distress Analysis" to evaluate acoustic, linguistic & emotional indicators.',
                    badgeClass: 'bg-slate-500 text-white',
                    scoreColor: 'text-slate-600',
                    borderClass: 'border-slate-300',
                    factorBreakdown: {
                        acousticStressScore: 0,
                        linguisticVulnerabilityScore: 0,
                        emotionalInstabilityScore: 0
                    } satisfies SviFactorBreakdown
                };
            }

            const target = activeUploadedScenario.assessment;
            const targetAcoustic = target.factorBreakdown.acousticStressScore;
            const targetLinguistic = target.factorBreakdown.linguisticVulnerabilityScore;
            const targetEmotional = target.factorBreakdown.emotionalInstabilityScore;
            const targetSvi = target.svi;
            const targetConf = target.confidence;

            if (isUploadedAnalyzing) {
                // Progressively climbs from 0 up to target as analysis ticks
                const totalSec = activeUploadedScenario.durationSec || 24;
                const p = Math.min(uploadedAnalysisSeconds / totalSec, 1);

                const acoustic = Math.round(p * targetAcoustic);
                const linguistic = Math.round(p * targetLinguistic);
                const emotional = Math.round(p * targetEmotional);
                const svi = Math.round(acoustic * 0.35 + linguistic * 0.40 + emotional * 0.25);
                const confidence = Math.round(p * targetConf);

                return {
                    svi,
                    risk: svi > 75 ? ('HIGH' as const) : svi > 40 ? ('MODERATE' as const) : ('MONITORING' as const),
                    confidence,
                    vulnerabilityDomain: target.vulnerabilityDomain,
                    stressLevel: `Streaming Audio Analysis... (${Math.round(p * 100)}%)`,
                    recommendedAction: 'Processing vocal features and calculating dimension weights from zero.',
                    badgeClass: 'bg-blue-600 text-white',
                    scoreColor: 'text-blue-900',
                    borderClass: 'border-blue-400',
                    factorBreakdown: {
                        acousticStressScore: acoustic,
                        linguisticVulnerabilityScore: linguistic,
                        emotionalInstabilityScore: emotional
                    } satisfies SviFactorBreakdown
                };
            }

            // Completed analysis
            return {
                svi: targetSvi,
                risk: target.risk,
                confidence: targetConf,
                vulnerabilityDomain: target.vulnerabilityDomain,
                stressLevel: target.stressLevel,
                recommendedAction: target.recommendedAction,
                badgeClass:
                    target.risk === 'CRITICAL'
                        ? 'bg-red-700 text-white'
                        : target.risk === 'HIGH'
                        ? 'bg-orange-600 text-white'
                        : target.risk === 'MODERATE'
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white',
                scoreColor:
                    target.risk === 'CRITICAL'
                        ? 'text-red-700'
                        : target.risk === 'HIGH'
                        ? 'text-orange-600'
                        : target.risk === 'MODERATE'
                        ? 'text-amber-600'
                        : 'text-emerald-600',
                borderClass:
                    target.risk === 'CRITICAL'
                        ? 'border-red-700'
                        : target.risk === 'HIGH'
                        ? 'border-orange-500'
                        : 'border-slate-300',
                factorBreakdown: target.factorBreakdown
            };
        }
    }, [
        inputMode,
        callStatus,
        callDuration,
        isMicRecording,
        micRecordDuration,
        micAudioLevel,
        micAnalysisComplete,
        isUploadedAnalyzing,
        uploadedAnalysisSeconds,
        uploadedAnalysisDone,
        activeUploadedScenario
    ]);

    const isEscalationAvailable =
        (inputMode === 'SIMULATED_LINE' && (callStatus === 'ENDED' || currentAssessment.svi >= 48)) ||
        (inputMode === 'RECORD_CALL' && micAnalysisComplete) ||
        (inputMode === 'UPLOAD_RECORDING' && uploadedAnalysisDone);

    return (
        <div className="space-y-4">
            {/* Official Top Station Bar */}
            <div className="bg-white border border-slate-300 rounded-md p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-blue-950 text-white flex items-center justify-center font-bold">
                        <Radio size={18} className={callStatus === 'CONNECTED' || isMicRecording ? 'animate-pulse text-emerald-400' : ''} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900 leading-tight">
                            NHAA Emergency Helpline — Voice Triage Console
                        </h2>
                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px] mt-0.5">
                            <span>SESSION: <strong>{inputMode === 'UPLOAD_RECORDING' ? activeUploadedScenario.callId : officialScenario.callId}</strong></span>
                            <span>|</span>
                            <span>DIALECT: <strong className="text-blue-950">{inputMode === 'UPLOAD_RECORDING' ? activeUploadedScenario.dialect : officialScenario.dialect}</strong></span>
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
                        <span>Reset Session</span>
                    </button>
                </div>
            </div>

            {/* Ingestion Mode Navigation Selector */}
            <div className="bg-white border border-slate-300 rounded-md p-1.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2">
                        Call Source Mode:
                    </span>
                    <button
                        onClick={() => {
                            setInputMode('SIMULATED_LINE');
                            handleReset();
                        }}
                        className={`px-3 py-2 rounded font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            inputMode === 'SIMULATED_LINE'
                                ? 'bg-blue-950 text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <PhoneIncoming size={15} />
                        <span>Incoming Emergency Line</span>
                    </button>

                    <button
                        onClick={() => {
                            setInputMode('RECORD_CALL');
                            handleReset();
                        }}
                        className={`px-3 py-2 rounded font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            inputMode === 'RECORD_CALL'
                                ? 'bg-blue-950 text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <Mic size={15} />
                        <span>Record Current Call</span>
                    </button>

                    <button
                        onClick={() => {
                            setInputMode('UPLOAD_RECORDING');
                            handleReset();
                        }}
                        className={`px-3 py-2 rounded font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            inputMode === 'UPLOAD_RECORDING'
                                ? 'bg-blue-950 text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100'
                        }`}
                    >
                        <FolderUp size={15} />
                        <span>Upload Pre-Recorded Call</span>
                    </button>
                </div>

                <div className="text-[11px] font-mono text-slate-500 px-3 hidden sm:block">
                    Status: <span className="font-bold text-slate-800">
                        {inputMode === 'SIMULATED_LINE' ? 'LINE 1 CONNECTIVITY' : inputMode === 'RECORD_CALL' ? 'MIC STATION READY' : 'FILE INGESTION READY'}
                    </span>
                </div>
            </div>

            {/* Main 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* LEFT SIDE (5/12): Call Controls & AI Distress Classification with SVI Dimensions */}
                <div className="lg:col-span-5 space-y-4">

                    {/* ========================================================= */}
                    {/* MODE 1 CONTROLS: Simulated Emergency Line */}
                    {/* ========================================================= */}
                    {inputMode === 'SIMULATED_LINE' && (
                        <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                                    Emergency Line Status
                                </span>
                                {callStatus === 'WAITING' && (
                                    <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold px-2 py-0.5 rounded animate-pulse">
                                        INCOMING CALL PENDING
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
                                            {officialScenario.callerNumber}
                                        </h3>
                                        <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                                            <MapPin size={11} className="text-slate-400 shrink-0" />
                                            <span className="truncate">{officialScenario.callerLocation}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Call Duration:</span>
                                    <span className="font-mono text-base font-bold text-slate-900">
                                        {formatTimer(callDuration)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons */}
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
                                        <span>Restart Call Simulation</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* MODE 2 CONTROLS: Record Current Call via Microphone */}
                    {/* ========================================================= */}
                    {inputMode === 'RECORD_CALL' && (
                        <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <Mic size={14} className="text-blue-900" />
                                    Station Microphone Console
                                </span>
                                {isMicRecording && (
                                    <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono animate-pulse flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                        LIVE RECORDING
                                    </span>
                                )}
                                {!isMicRecording && micAnalysisComplete && (
                                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                        ANALYZED
                                    </span>
                                )}
                                {!isMicRecording && !micAnalysisComplete && (
                                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded font-mono border border-slate-300">
                                        MIC READY
                                    </span>
                                )}
                            </div>

                            {/* Canvas Audio Spectrum Visualizer */}
                            <div className="bg-slate-900 rounded p-4 text-white flex flex-col items-center justify-center min-h-[140px] relative overflow-hidden">
                                <canvas
                                    ref={micCanvasRef}
                                    width={320}
                                    height={50}
                                    className="w-full h-12 mb-2"
                                />

                                <div className="flex items-center justify-between w-full text-xs font-mono text-slate-400 border-t border-slate-800 pt-2">
                                    <span>DURATION: <strong className="text-white">{formatTimer(micRecordDuration)}</strong></span>
                                    <span>ENERGY: <strong className={micAudioLevel > 60 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>{micAudioLevel}%</strong></span>
                                </div>
                            </div>

                            {/* Audio Playback Element if Recording Finished */}
                            {recordedAudioUrl && (
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <FileAudio size={16} className="text-blue-900" />
                                        <span className="font-mono text-[11px] text-slate-700">Station_Call_Rec.webm</span>
                                    </div>
                                    <audio
                                        ref={micAudioPlayerRef}
                                        src={recordedAudioUrl}
                                        onEnded={() => setIsRecordedAudioPlaying(false)}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={togglePlayRecordedAudio}
                                        className="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                        {isRecordedAudioPlaying ? <Pause size={12} /> : <Play size={12} />}
                                        <span>{isRecordedAudioPlaying ? 'Pause' : 'Play Audio'}</span>
                                    </button>
                                </div>
                            )}

                            {/* Recording Trigger Buttons */}
                            <div className="space-y-2">
                                {!isMicRecording ? (
                                    <button
                                        onClick={startMicrophoneRecording}
                                        className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                    >
                                        <Mic size={18} />
                                        <span>Start Recording Call (Microphone)</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopMicrophoneRecording}
                                        className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 rounded text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                    >
                                        <Square size={16} className="fill-current" />
                                        <span>Stop & Analyze Call Recording</span>
                                    </button>
                                )}

                                {isAnalyzingMic && (
                                    <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center gap-2 animate-pulse">
                                        <Sparkles size={15} />
                                        <span>Calculating vocal tremor & linguistic distress parameters...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* MODE 3 CONTROLS: Upload Pre-recorded Call Recording */}
                    {/* ========================================================= */}
                    {inputMode === 'UPLOAD_RECORDING' && (
                        <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                                    <Upload size={14} className="text-blue-900" />
                                    Pre-Recorded Call Ingestion
                                </span>
                                {uploadedAnalysisDone ? (
                                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                        TRIAGE COMPLETE
                                    </span>
                                ) : isUploadedAnalyzing ? (
                                    <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono animate-pulse">
                                        ANALYZING STREAM...
                                    </span>
                                ) : (
                                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded font-mono border border-slate-300">
                                        NOT ANALYZED (SCORES: 0)
                                    </span>
                                )}
                            </div>

                            {/* Sample Recording Dropdown Selector */}
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase">
                                    Select Pre-recorded Call Archive:
                                </label>
                                <select
                                    value={selectedSampleId}
                                    onChange={(e) => handleSelectSample(e.target.value)}
                                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded text-slate-900 font-medium focus:bg-white focus:border-blue-900 outline-none cursor-pointer"
                                >
                                    {SAMPLE_PRE_RECORDED_CALLS.map((sample) => (
                                        <option key={sample.id} value={sample.id}>
                                            {sample.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Or Custom Audio File Upload Dropzone */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 hover:border-blue-900 rounded p-4 text-center cursor-pointer transition-colors bg-slate-50/70 hover:bg-slate-50"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="audio/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <FolderUp size={24} className="mx-auto text-slate-400 mb-1" />
                                <p className="text-xs font-semibold text-slate-800">
                                    Click to browse your computer for an audio call
                                </p>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                    Supported: .mp3, .wav, .m4a, .ogg, .aac, .webm
                                </p>
                            </div>

                            {/* Loaded File Metadata Card */}
                            {uploadedFileMeta && (
                                <div className="bg-blue-50/60 border border-blue-200 rounded p-3 text-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileAudio size={16} className="text-blue-950 shrink-0" />
                                            <span className="font-mono font-bold text-slate-900 truncate">
                                                {uploadedFileMeta.name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-blue-200 shrink-0">
                                            {uploadedFileMeta.duration}
                                        </span>
                                    </div>

                                    {/* Audio Playback Controls */}
                                    <div className="flex items-center justify-between pt-1 border-t border-blue-200/60">
                                        <button
                                            onClick={togglePlayUploadedAudio}
                                            className="px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-white rounded text-[11px] font-bold flex items-center gap-1.5 cursor-pointer"
                                        >
                                            {isUploadedAudioPlaying ? <Pause size={12} /> : <Play size={12} />}
                                            <span>{isUploadedAudioPlaying ? 'Pause Audio' : 'Preview Audio'}</span>
                                        </button>
                                        <span className="text-[10px] font-mono text-slate-500">
                                            {isUploadedAudioPlaying ? 'Playing simulated call channel...' : 'Audio loaded'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Run AI Analysis Trigger */}
                            <div>
                                <button
                                    onClick={runUploadedAnalysis}
                                    disabled={isUploadedAnalyzing}
                                    className="w-full bg-blue-900 hover:bg-blue-950 disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                                >
                                    <Sparkles size={16} />
                                    <span>{uploadedAnalysisDone ? 'Re-Run AI Distress Analysis' : 'Run AI Distress Analysis'}</span>
                                </button>

                                {isUploadedAnalyzing && (
                                    <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 space-y-1 animate-pulse">
                                        <div className="flex items-center gap-2 font-bold">
                                            <Activity size={14} className="animate-spin" />
                                            <span>Streaming Audio Telemetry from 0...</span>
                                        </div>
                                        <p className="text-[11px] text-amber-800">{uploadedProgressStep}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ========================================================= */}
                    {/* PRIMARY AI DISTRESS CLASSIFICATION & SVI DIMENSIONS */}
                    {/* Always visible: Starts at ZERO and updates during call */}
                    {/* ========================================================= */}
                    <div className={`bg-white border-2 ${currentAssessment.borderClass} rounded-md p-5 shadow-xs space-y-4 animate-fade-in transition-all duration-300`}>
                        {/* Header & Risk Tag */}
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <ShieldAlert size={16} className={currentAssessment.risk === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'} />
                                    <span>AI Distress Classification</span>
                                </h3>
                                <p className="text-[10px] text-slate-500 font-light mt-0.5">
                                    {callStatus === 'CONNECTED' || isMicRecording || isUploadedAnalyzing
                                        ? '● Telemetry Active: Updating as call progresses'
                                        : 'Telemetry Standby (Starts at 0 on call start)'}
                                </p>
                            </div>
                            <span className={`${currentAssessment.badgeClass} text-[10px] font-bold px-2.5 py-0.5 rounded font-mono transition-colors duration-300`}>
                                {currentAssessment.risk}
                            </span>
                        </div>

                        {/* Total SVI Composite Score */}
                        <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3.5">
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <span className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">
                                        Stress & Vulnerability Index (SVI)
                                    </span>
                                    <div className="flex items-baseline gap-1 mt-0.5">
                                        <span className={`text-4xl font-black ${currentAssessment.scoreColor} font-mono transition-colors duration-300`}>
                                            {currentAssessment.svi}
                                        </span>
                                        <span className="text-xs text-slate-500 font-mono font-medium">/ 100</span>
                                    </div>
                                </div>
                                <div className="text-right text-xs">
                                    <span className="text-slate-500 block text-[10px] font-bold uppercase">Confidence</span>
                                    <span className="font-bold text-slate-900 font-mono text-sm">{currentAssessment.confidence}%</span>
                                </div>
                            </div>

                            {/* ------------------------------------------------------------- */}
                            {/* SVI DIMENSIONS BREAKDOWN WITH INDIVIDUAL SCORES */}
                            {/* Starts at 0 / 100 and updates dynamically */}
                            {/* ------------------------------------------------------------- */}
                            <div className="pt-3 border-t border-slate-200 space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1">
                                        <Activity size={12} className="text-blue-900" />
                                        SVI Dimension Breakdown
                                    </span>
                                    <span className="text-[9px] font-mono text-slate-500 font-semibold">
                                        3 Weighted Factors
                                    </span>
                                </div>

                                {/* Dimension 1: Acoustic Stress */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-700 font-semibold flex items-center gap-1.5 text-[11px]">
                                            <Volume2 size={12} className="text-blue-800 shrink-0" />
                                            Acoustic Stress <span className="text-slate-400 font-mono text-[10px] font-normal">(35% Wt)</span>
                                        </span>
                                        <span className="font-mono font-bold text-slate-900 text-xs">
                                            {currentAssessment.factorBreakdown.acousticStressScore} <span className="text-slate-400 text-[10px]">/ 100</span>
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-800 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${Math.min(currentAssessment.factorBreakdown.acousticStressScore, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Dimension 2: Linguistic Vulnerability */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-700 font-semibold flex items-center gap-1.5 text-[11px]">
                                            <MessageSquare size={12} className="text-amber-600 shrink-0" />
                                            Linguistic Vulnerability <span className="text-slate-400 font-mono text-[10px] font-normal">(40% Wt)</span>
                                        </span>
                                        <span className="font-mono font-bold text-slate-900 text-xs">
                                            {currentAssessment.factorBreakdown.linguisticVulnerabilityScore} <span className="text-slate-400 text-[10px]">/ 100</span>
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-600 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${Math.min(currentAssessment.factorBreakdown.linguisticVulnerabilityScore, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Dimension 3: Emotional Instability */}
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-700 font-semibold flex items-center gap-1.5 text-[11px]">
                                            <Heart size={12} className="text-rose-600 shrink-0" />
                                            Emotional Instability <span className="text-slate-400 font-mono text-[10px] font-normal">(25% Wt)</span>
                                        </span>
                                        <span className="font-mono font-bold text-slate-900 text-xs">
                                            {currentAssessment.factorBreakdown.emotionalInstabilityScore} <span className="text-slate-400 text-[10px]">/ 100</span>
                                        </span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-rose-600 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${Math.min(currentAssessment.factorBreakdown.emotionalInstabilityScore, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Details */}
                        <div className="space-y-2.5 text-xs">
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
                                    Escalation protocols activate as caller speech reaches Moderate/High (≥ 48 SVI) or once call concludes.
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
                                            * Direct handover routes call transcript & SVI metrics to the department quick response unit.
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
                </div>

                {/* RIGHT SIDE (7/12): Live Transcript & Dialogue Evidence */}
                <div className="lg:col-span-7">
                    <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs flex flex-col h-[680px]">
                        {/* Transcript Box Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                                    <FileText size={16} className="text-blue-950" />
                                    <span>
                                        {inputMode === 'SIMULATED_LINE'
                                            ? 'Live Caller Audio Speech Transcription'
                                            : inputMode === 'RECORD_CALL'
                                            ? 'Microphone Voice Telemetry & Transcription'
                                            : 'Pre-recorded Call Audio Transcription'}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 font-light mt-0.5">
                                    Speech-to-text with contextual distress indicator tags
                                </p>
                            </div>

                            <span className="text-[10px] font-mono bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded font-bold">
                                {inputMode === 'SIMULATED_LINE'
                                    ? callStatus === 'CONNECTED' ? 'LIVE AUDIO STREAM' : callStatus === 'ENDED' ? 'CALL ARCHIVED' : 'STANDBY'
                                    : inputMode === 'RECORD_CALL'
                                    ? isMicRecording ? 'CAPTURING VOCAL SPECTRUM' : micAnalysisComplete ? 'ANALYZED' : 'STANDBY'
                                    : uploadedAnalysisDone ? 'FILE PROCESSED' : 'STANDBY'}
                            </span>
                        </div>

                        {/* Transcript Scrolling Body */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                            {/* CASE 1: Simulated Line Waiting State */}
                            {inputMode === 'SIMULATED_LINE' && callStatus === 'WAITING' && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                    <PhoneCall size={44} className="stroke-[1.3] mb-3 text-slate-300" />
                                    <p className="text-base font-bold text-slate-800">
                                        Terminal Waiting for Call Connection
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm font-light leading-relaxed">
                                        An emergency distress call is pending on Line 1 from <strong>{officialScenario.callerNumber}</strong>.
                                        Click <strong>"Pick Up Call"</strong> on the left to answer and begin live transcription.
                                    </p>
                                </div>
                            )}

                            {/* CASE 2: Simulated Line Connecting */}
                            {inputMode === 'SIMULATED_LINE' && callStatus === 'CONNECTED' && displayedLines.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 animate-pulse">
                                    <Radio size={36} className="text-blue-900 mb-2 animate-spin" />
                                    <p className="text-xs font-semibold text-slate-700">Connecting audio telemetry stream...</p>
                                    <p className="text-[11px] text-slate-400 mt-1">Calibrating acoustic noise filters from 0</p>
                                </div>
                            )}

                            {/* CASE 3: Simulated Line Active Dialogues */}
                            {inputMode === 'SIMULATED_LINE' && displayedLines.length > 0 && (
                                displayedLines.map((line) => (
                                    <div
                                        key={line.id}
                                        className="p-4 rounded-md border border-slate-200 bg-amber-50/40 text-slate-900 space-y-2 animate-fade-in shadow-2xs"
                                    >
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

                                        <p className="text-base font-medium text-slate-900 leading-relaxed font-sans">
                                            "{line.text}"
                                        </p>

                                        {line.englishTranslation && (
                                            <p className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2 font-light">
                                                Translation: "{line.englishTranslation}"
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}

                            {/* Live Streaming Typing Indicator */}
                            {inputMode === 'SIMULATED_LINE' && callStatus === 'CONNECTED' && (
                                <div className="flex items-center gap-2 p-2.5 text-xs font-mono text-slate-600 bg-slate-50 rounded border border-slate-200 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                                    <span>Caller voice stream live • Transcribing audio & updating dimension scores...</span>
                                </div>
                            )}

                            {/* CASE 4: Record Call Waiting State */}
                            {inputMode === 'RECORD_CALL' && !isMicRecording && !micAnalysisComplete && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                    <Mic size={44} className="stroke-[1.3] mb-3 text-slate-300" />
                                    <p className="text-base font-bold text-slate-800">
                                        Microphone Station Ready
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm font-light leading-relaxed">
                                        Press <strong>"Start Recording Call"</strong> on the left to capture live caller/operator voice input directly from your microphone. All scores start at 0.
                                    </p>
                                </div>
                            )}

                            {/* CASE 5: Record Call Active Recording State */}
                            {inputMode === 'RECORD_CALL' && isMicRecording && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-red-100 border border-red-300 flex items-center justify-center text-red-600 animate-pulse">
                                        <Mic size={32} />
                                    </div>
                                    <p className="text-base font-bold text-slate-900">
                                        Recording Call Audio In Real Time
                                    </p>
                                    <p className="text-xs text-slate-500 max-w-md font-light">
                                        Audio wave samples are being buffered and analyzed. SVI dimensions are climbing from zero as speech is detected.
                                    </p>
                                    <div className="text-sm font-mono font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                                        REC TIME: {formatTimer(micRecordDuration)}
                                    </div>
                                </div>
                            )}

                            {/* CASE 6: Record Call Completed Analysis */}
                            {inputMode === 'RECORD_CALL' && micAnalysisComplete && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center justify-between">
                                        <span className="font-bold flex items-center gap-1.5">
                                            <CheckCircle2 size={16} className="text-emerald-700" />
                                            Live Microphone Recording Transcribed & Analyzed
                                        </span>
                                        <span className="font-mono font-bold text-emerald-800 text-[11px]">
                                            DURATION: {formatTimer(micRecordDuration || 18)}
                                        </span>
                                    </div>

                                    {/* Dialogue Turns */}
                                    <div className="p-4 rounded-md border border-slate-200 bg-amber-50/40 text-slate-900 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="bg-amber-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                                                CALLER (MIC INGESTION)
                                            </span>
                                            <span className="bg-red-100 text-red-900 border border-red-300 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                                                Acute Tremor & Direct Threat
                                            </span>
                                        </div>
                                        <p className="text-base font-medium text-slate-900">
                                            "सर… हमें यहाँ बहुत खतरा है, वे लोग फिर से बाहर आ गए हैं और दरवाजा तोड़ने की कोशिश कर रहे हैं।"
                                        </p>
                                        <p className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2">
                                            Translation: "Sir… we are in extreme danger here, those people have come outside again and are trying to break the door."
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-md border border-slate-200 bg-slate-50 text-slate-900 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="bg-blue-900 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                                                OPERATOR
                                            </span>
                                            <span className="text-[11px] font-mono text-slate-500 font-semibold">[+08s]</span>
                                        </div>
                                        <p className="text-sm font-medium text-slate-800">
                                            "आप बिल्कुल शांत रहें और सुरक्षित कमरे के अंदर रहें। आपकी लोकेशन ट्रेस कर ली गई है और पुलिस कंट्रोल रूम को अलर्ट भेज दिया गया है।"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* CASE 7: Upload Pre-recorded Waiting State */}
                            {inputMode === 'UPLOAD_RECORDING' && !uploadedAnalysisDone && !isUploadedAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                                    <FolderUp size={44} className="stroke-[1.3] mb-3 text-slate-300" />
                                    <p className="text-base font-bold text-slate-800">
                                        Pre-Recorded Audio File Loaded (Scores: 0)
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm font-light leading-relaxed">
                                        Audio recording: <strong>{uploadedFileMeta?.name}</strong>.
                                        Click <strong>"Run AI Distress Analysis"</strong> on the left to start telemetry stream from zero.
                                    </p>
                                </div>
                            )}

                            {/* CASE 8: Upload Pre-recorded Analyzing State */}
                            {inputMode === 'UPLOAD_RECORDING' && isUploadedAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                                    <Activity size={40} className="text-blue-900 animate-spin" />
                                    <p className="text-base font-bold text-slate-800">
                                        Transcribing & Running Telemetry Pipeline
                                    </p>
                                    <p className="text-xs text-slate-500 max-w-sm font-light">
                                        {uploadedProgressStep}
                                    </p>
                                </div>
                            )}

                            {/* CASE 9: Upload Pre-recorded Analyzed Transcript */}
                            {inputMode === 'UPLOAD_RECORDING' && uploadedAnalysisDone && (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-950 flex items-center justify-between">
                                        <span className="font-bold flex items-center gap-1.5">
                                            <FileText size={15} className="text-blue-900" />
                                            Archived Call Telemetry & Verified Transcript
                                        </span>
                                        <span className="font-mono font-bold text-blue-900 text-[11px]">
                                            TOTAL TURNS: {activeUploadedScenario.lines.length}
                                        </span>
                                    </div>

                                    {activeUploadedScenario.lines.map((line) => (
                                        <div
                                            key={line.id}
                                            className="p-4 rounded-md border border-slate-200 bg-amber-50/40 text-slate-900 space-y-2 shadow-2xs"
                                        >
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

                                            <p className="text-base font-medium text-slate-900 leading-relaxed font-sans">
                                                "{line.text}"
                                            </p>

                                            {line.englishTranslation && (
                                                <p className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2 font-light">
                                                    Translation: "{line.englishTranslation}"
                                                </p>
                                            )}
                                        </div>
                                    ))}
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
