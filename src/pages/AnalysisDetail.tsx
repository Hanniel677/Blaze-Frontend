import React, { useState } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    Languages,
    HelpCircle,
    ShieldCheck,
    AlertTriangle,
    FileText,
    ChevronLeft,
    ChevronRight,
    MapPin,
    PhoneCall
} from 'lucide-react';
import type { CaseAssessment } from '../types';
import { analysisService } from '../services/analysisService';

// Reusable Components
import AudioPlayer from '../components/AudioPlayer';
import ProcessingPipeline from '../components/ProcessingPipeline';
import TranscriptViewer from '../components/TranscriptViewer';
import SpeechAnalysis from '../components/SpeechAnalysis';
import EmotionIndicators from '../components/EmotionIndicators';
import VulnerabilityIndicators from '../components/VulnerabilityIndicators';
import SVIVisualization from '../components/SVIVisualization';
import HumanReview from '../components/HumanReview';
import ReportModal from '../components/ReportModal';

const AnalysisDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const triggerAnalyse = searchParams.get('analyse') === 'true';

    // Lazy load initial case data
    const [item, setItem] = useState<CaseAssessment | null>(() => {
        return id ? analysisService.getCaseById(id) : null;
    });

    const [isProcessing, setIsProcessing] = useState<boolean>(() => {
        const initialCase = id ? analysisService.getCaseById(id) : null;
        return triggerAnalyse && (initialCase ? initialCase.status !== 'COMPLETE' : true);
    });

    const [activeTime, setActiveTime] = useState(0);
    const [seekTime, setSeekTime] = useState<number | undefined>(undefined);
    const [showReportModal, setShowReportModal] = useState(false);

    // Get case list for previous/next navigation
    const allCases = analysisService.getCases();
    const currentIndex = allCases.findIndex(c => c.id === id);
    const prevCase = currentIndex > 0 ? allCases[currentIndex - 1] : null;
    const nextCase = currentIndex >= 0 && currentIndex < allCases.length - 1 ? allCases[currentIndex + 1] : null;

    const handlePipelineComplete = () => {
        if (!id || !item) return;

        // Populate completed SVI score parameters
        const completedOverrides: Partial<CaseAssessment> = {
            svi: item.svi > 0 ? item.svi : 87,
            risk: item.risk !== 'LOW' ? item.risk : 'CRITICAL',
            confidence: 94,
            status: 'COMPLETE',
            factorBreakdown: {
                acousticStressScore: 89,
                linguisticVulnerabilityScore: 92,
                emotionalInstabilityScore: 82
            },
            speechMetrics: {
                ...item.speechMetrics,
                speechStressValue: 89,
                emotionalSignal: 'Fear / Acute Distress'
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
            explainability: [
                { id: '01', title: 'Explicit Fear & Danger Admissions', description: 'Explicit verbal admission of fear when discussing return home ("मुझे वापस घर जाने में बहुत डर लग रहा है").', evidence: '00:12 Transcript Statement', category: 'Linguistic', timestamp: '00:12' },
                { id: '02', title: 'Intimidation & Gagging Threats', description: 'Coercive speech triggers detected ("उन्होंने मुझे किसी को भी बताने से मना किया था"). Severe external pressure.', evidence: '00:20 Transcript Statement', category: 'Linguistic', timestamp: '00:20' },
                { id: '03', title: 'High Pitch Tremor & Vocal Instability', description: 'Pitch fluctuation patterns and voice tremor signals index stress levels at 89%.', evidence: 'Acoustic Signal Extraction', category: 'Acoustic', timestamp: '00:18' },
                { id: '04', title: 'Long Pauses During Threat Disclosure', description: 'Multiple instances of hesitancy pauses exceeding 3.5 seconds when threat details are referenced.', evidence: 'Pause Cadence Analysis', category: 'Acoustic', timestamp: '00:30' },
                { id: '05', title: 'Dependent Vulnerability & Confinement', description: 'Language indicating protective actions for dependents and prolonged confinement.', evidence: '00:42 Transcript Statement', category: 'Contextual', timestamp: '00:42' }
            ]
        };

        const updated = analysisService.updateCaseStatus(id, 'COMPLETE', completedOverrides);
        setItem(updated);
        setIsProcessing(false);
    };

    const handleSelectTime = (seconds: number) => {
        setSeekTime(seconds);
    };

    const handleReviewSaved = (updatedCase: CaseAssessment) => {
        setItem(updatedCase);
    };

    const parseDurationToSeconds = (durStr: string): number => {
        const parts = durStr.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
        return 272;
    };

    if (!item) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center gap-4 text-center max-w-md mx-auto">
                <AlertTriangle size={42} className="text-red-500 stroke-[1.5]" />
                <h3 className="text-xl font-bold text-zinc-900 tracking-tight">Case Record Not Found</h3>
                <p className="text-xs text-zinc-500 font-light mt-1.5 leading-relaxed">
                    The requested helpline case ({id}) is not present in storage. Please verify your ledger parameters.
                </p>
                <Link
                    to="/dashboard"
                    className="mt-4 text-xs font-bold text-zinc-950 bg-zinc-100 hover:bg-zinc-200 px-5 py-2.5 rounded-full transition-colors"
                >
                    Return to Triage Ledger
                </Link>
            </div>
        );
    }

    const durationSec = parseDurationToSeconds(item.duration);

    // Render Processing view if simulation is active
    if (isProcessing) {
        return (
            <div className="min-h-[75vh] flex flex-col justify-center items-center px-4">
                <span className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase mb-4 font-bold">
                    SAHAAYA MULTI-STAGE TRIAGE PIPELINE
                </span>
                <ProcessingPipeline
                    isStarted={isProcessing}
                    onComplete={handlePipelineComplete}
                />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in text-zinc-900 selection:bg-[var(--color-accent-lime)]">
            {/* Header with Case Navigation & Actions */}
            <div className="border-b border-zinc-200/90 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-950 transition-colors font-semibold"
                        >
                            <ArrowLeft size={13} />
                            <span>Triage Ledger</span>
                        </Link>
                        <span className="text-zinc-300">/</span>
                        <span className="text-xs font-mono text-zinc-500 font-bold">{item.id}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="font-display font-black text-3xl text-zinc-950 tracking-tight leading-none">
                            Case #{item.id}
                        </h2>

                        {item.operatorReview?.isReviewed ? (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1 flex items-center gap-1.5 shadow-2xs">
                                <ShieldCheck size={13} className="stroke-[2.5] text-emerald-600" />
                                Reviewed & Signed by Priya Sharma
                            </span>
                        ) : (
                            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                                Pending Review Sign-off
                            </span>
                        )}

                        {item.operatorReview?.flagged && (
                            <span className="text-[11px] font-bold text-red-800 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                                Escalated to Supervisor Queue
                            </span>
                        )}
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap gap-4 text-xs text-zinc-500 font-mono font-medium pt-1">
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-zinc-400" />
                            Duration: <strong className="text-zinc-800">{item.duration}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Languages size={13} className="text-zinc-400" />
                            Dialect: <strong className="text-zinc-800">{item.language}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <PhoneCall size={13} className="text-zinc-400" />
                            Caller: <strong className="text-zinc-800">{item.callerIdMasked || '+91-PROTECTED'}</strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-zinc-400" />
                            Zone: <strong className="text-zinc-800">{item.locationMasked || 'Helpline Queue'}</strong>
                        </span>
                    </div>
                </div>

                {/* Right Top Actions: Prev/Next & Generate Report */}
                <div className="flex items-center gap-2">
                    {/* Previous/Next Case buttons */}
                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-full border border-zinc-200/80">
                        <button
                            disabled={!prevCase}
                            onClick={() => prevCase && navigate(`/analysis/${prevCase.id}`)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                            title={prevCase ? `Previous: Case ${prevCase.id}` : 'No previous case'}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            disabled={!nextCase}
                            onClick={() => nextCase && navigate(`/analysis/${nextCase.id}`)}
                            className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                            title={nextCase ? `Next: Case ${nextCase.id}` : 'No next case'}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <button
                        onClick={() => setShowReportModal(true)}
                        className="bg-zinc-950 hover:bg-black text-white px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                        <FileText size={14} />
                        <span>Print Report</span>
                    </button>
                </div>
            </div>

            {/* Main Interactive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT 7/12: Audio Scrubber, Transcript, Explainability Evidence */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Interactive Audio Player Timeline */}
                    <AudioPlayer
                        waveform={item.speechMetrics.pitchWaveform}
                        durationSec={durationSec}
                        onTimeUpdate={setActiveTime}
                        seekTime={seekTime}
                    />

                    {/* Synchronized Transcript Scrubber */}
                    <TranscriptViewer
                        transcript={item.transcript}
                        onSelectTime={handleSelectTime}
                        activeTime={activeTime}
                    />

                    {/* Explainability Node Evidence Map */}
                    <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 md:p-8 shadow-sm select-none transition-all hover:border-zinc-300">
                        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-6">
                            <div>
                                <h3 className="font-display font-medium text-base text-zinc-950">
                                    Explainability Evidence Nodes
                                </h3>
                                <p className="text-xs text-zinc-500 font-light mt-0.5">
                                    Correlating SVI score contributors directly to vocal and dialogue evidence
                                </p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                                <HelpCircle size={16} />
                            </div>
                        </div>

                        {item.explainability.length === 0 ? (
                            <p className="text-xs text-zinc-400 italic">No elevation evidence nodes logged.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {item.explainability.map((exp) => (
                                    <div
                                        key={exp.id}
                                        onClick={() => {
                                            if (exp.timestamp) {
                                                const parts = exp.timestamp.split(':');
                                                if (parts.length === 2) {
                                                    handleSelectTime(parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10));
                                                }
                                            }
                                        }}
                                        className="p-4 bg-zinc-50/70 hover:bg-zinc-100 border border-zinc-200/70 rounded-2xl transition-all space-y-2 cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-mono font-bold text-zinc-900 bg-white border border-zinc-200 px-2 py-0.5 rounded-full shadow-2xs">
                                                NODE #{exp.id}
                                            </span>
                                            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider group-hover:text-zinc-700">
                                                {exp.evidence}
                                            </span>
                                        </div>

                                        <h4 className="text-xs font-bold text-zinc-900 leading-snug">
                                            {exp.title}
                                        </h4>
                                        <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT 5/12: SVI Visualization, Speech Acoustics, Emotions, Vulnerabilities, Review Console */}
                <div className="lg:col-span-5 space-y-6">
                    {/* SVI Composite & Factor Breakdown */}
                    <SVIVisualization
                        score={item.svi}
                        risk={item.risk}
                        confidence={item.confidence}
                        factorBreakdown={item.factorBreakdown}
                    />

                    {/* Speech Analytics Graph */}
                    <SpeechAnalysis metrics={item.speechMetrics} />

                    {/* Detected Emotional Frequencies */}
                    <EmotionIndicators emotions={item.emotions} />

                    {/* Semantic Vulnerability Indicators */}
                    <VulnerabilityIndicators vulnerabilities={item.vulnerabilities} />

                    {/* Operator Verification & Emergency Dispatch Console */}
                    <HumanReview
                        caseId={item.id}
                        initialRisk={item.risk}
                        onReviewSaved={handleReviewSaved}
                        onOpenReport={() => setShowReportModal(true)}
                    />
                </div>
            </div>

            {/* Printable Triage Assessment Report Modal */}
            {showReportModal && (
                <ReportModal
                    assessment={item}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </div>
    );
};

export default AnalysisDetail;
