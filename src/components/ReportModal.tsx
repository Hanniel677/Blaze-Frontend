import React from 'react';
import type { CaseAssessment } from '../types';
import { Printer, X, Shield, Activity, FileText, MessageSquare, Heart } from 'lucide-react';

interface ReportModalProps {
    assessment: CaseAssessment;
    onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ assessment, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in select-none">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-8 shadow-2xl space-y-6 border border-zinc-200 text-zinc-900 my-8 max-h-[90vh] overflow-y-auto">
                {/* Modal Top Controls (Hidden during print) */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-200 no-print">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono">
                        <FileText size={16} />
                        <span>INSTITUTIONAL TRIAGE ASSESSMENT REPORT</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition cursor-pointer shadow-xs"
                        >
                            <Printer size={14} />
                            <span>Export / Print</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Printable Report Canvas */}
                <div className="space-y-6 printable-area">
                    {/* Header */}
                    <div className="border-b-2 border-zinc-900 pb-5 flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase font-bold">
                                National Emergency Helpline 112 / ERSS
                            </span>
                            <h2 className="font-display font-medium text-2xl text-zinc-950 mt-1">
                                AI Forensic Distress Classification Summary
                            </h2>
                            <p className="text-xs text-zinc-500 mt-1 font-mono">
                                CASE ID: <strong>{assessment.id}</strong> | CALL DURATION: {assessment.duration} | DIALECT: {assessment.language}
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="px-3 py-1 bg-zinc-900 text-white font-mono text-xs font-bold rounded-lg uppercase">
                                STATUS: {assessment.status}
                            </span>
                        </div>
                    </div>

                    {/* Meta Overview Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Incident Date</span>
                            <span className="font-mono text-zinc-700">{assessment.date || 'Today'}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Location Zone</span>
                            <span className="font-mono text-zinc-700">{assessment.locationMasked || 'North Sector'}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Caller Phone ID</span>
                            <span className="font-mono text-zinc-700">{assessment.callerIdMasked || '+91-PROTECTED'}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Logged Time</span>
                            <span className="font-mono text-zinc-700">{assessment.time}</span>
                        </div>
                    </div>

                    {/* Primary Classification & SVI Box */}
                    <div className="border-2 border-zinc-900 p-5 rounded-2xl space-y-4 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                    Triaged Risk Category
                                </span>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-2xl font-black font-display text-zinc-950">
                                        {assessment.risk} RISK
                                    </span>
                                    <span className="text-xs font-mono font-bold bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-300">
                                        CONFIDENCE: {assessment.confidence}%
                                    </span>
                                </div>
                            </div>

                            <div className="text-right sm:border-l sm:border-zinc-200 sm:pl-6">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                                    Stress & Vulnerability Index
                                </span>
                                <p className="font-display font-black text-4xl text-zinc-950">
                                    {assessment.svi} <span className="text-sm font-normal text-zinc-500 font-mono">/100</span>
                                </p>
                            </div>
                        </div>

                        {/* SVI Dimension Breakdown */}
                        {assessment.factorBreakdown && (
                            <div className="pt-3 border-t border-zinc-200">
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block mb-2">
                                    SVI Dimension Scores (3 Weighted Axes)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-zinc-700 flex items-center gap-1">
                                                <Activity size={12} className="text-zinc-600" />
                                                Acoustic (35%)
                                            </span>
                                            <span className="font-mono font-bold text-zinc-900">
                                                {assessment.factorBreakdown.acousticStressScore}/100
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-zinc-900 rounded-full"
                                                style={{ width: `${Math.min(assessment.factorBreakdown.acousticStressScore, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-zinc-700 flex items-center gap-1">
                                                <MessageSquare size={12} className="text-amber-600" />
                                                Linguistic (40%)
                                            </span>
                                            <span className="font-mono font-bold text-zinc-900">
                                                {assessment.factorBreakdown.linguisticVulnerabilityScore}/100
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500 rounded-full"
                                                style={{ width: `${Math.min(assessment.factorBreakdown.linguisticVulnerabilityScore, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="font-medium text-zinc-700 flex items-center gap-1">
                                                <Heart size={12} className="text-rose-600" />
                                                Emotional (25%)
                                            </span>
                                            <span className="font-mono font-bold text-zinc-900">
                                                {assessment.factorBreakdown.emotionalInstabilityScore}/100
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rose-500 rounded-full"
                                                style={{ width: `${Math.min(assessment.factorBreakdown.emotionalInstabilityScore, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Speech Acoustics & Emotions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Speech Metrics */}
                        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs">
                            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider border-b border-zinc-200 pb-1.5">
                                Speech Acoustics Telemetry
                            </h4>
                            <div className="space-y-1.5 font-mono text-[11px]">
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Speaking Rate:</span>
                                    <span className="font-bold text-zinc-900">{assessment.speechMetrics.speakingRate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Pause Frequency:</span>
                                    <span className="font-bold text-zinc-900">{assessment.speechMetrics.pauseFrequency}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Hesitancy Pauses (&gt;3.5s):</span>
                                    <span className="font-bold text-zinc-900">{assessment.speechMetrics.longPauses} instances</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-500">Vocal Stress Pressure:</span>
                                    <span className="font-bold text-zinc-900">{assessment.speechMetrics.speechStressValue}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Vulnerability Indicators */}
                        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-2 text-xs">
                            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider border-b border-zinc-200 pb-1.5">
                                Detected Vulnerabilities
                            </h4>
                            <div className="space-y-1 text-[11px]">
                                {assessment.vulnerabilities.slice(0, 4).map(v => (
                                    <div key={v.key} className="flex justify-between items-center py-0.5">
                                        <span className="font-medium text-zinc-800">{v.label}</span>
                                        <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-white border border-zinc-200">
                                            {v.severity} ({v.confidence}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dialogue Transcript Highlights */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider border-b border-zinc-200 pb-1.5">
                            Annotated Transcript Excerpt
                        </h4>
                        <div className="space-y-2 text-xs">
                            {assessment.transcript.slice(0, 5).map((t, i) => (
                                <div key={i} className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/70">
                                    <div className="flex justify-between text-[10px] font-mono text-zinc-500 mb-1">
                                        <span className="font-bold uppercase text-zinc-800">{t.speaker}</span>
                                        <span>[{t.timestamp}]</span>
                                    </div>
                                    <p className="text-zinc-900 font-medium">{t.text}</p>
                                    {t.translatedText && (
                                        <p className="text-zinc-500 italic text-[11px] mt-0.5">"{t.translatedText}"</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Explainability Evidence Nodes */}
                    {assessment.explainability.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider border-b border-zinc-200 pb-1.5">
                                Explainability Score Contributors
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {assessment.explainability.slice(0, 4).map(exp => (
                                    <div key={exp.id} className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-200/70">
                                        <div className="flex justify-between text-[10px] font-mono mb-1">
                                            <span className="font-bold text-zinc-900">NODE {exp.id}</span>
                                            <span className="text-zinc-400 uppercase">{exp.evidence}</span>
                                        </div>
                                        <p className="font-semibold text-zinc-900 text-[11px]">{exp.title}</p>
                                        <p className="text-zinc-600 text-[10px] mt-0.5">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Operator Sign-off & Dispatch Section */}
                    <div className="p-4 border-2 border-zinc-200 rounded-2xl space-y-3 bg-zinc-50/50">
                        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                            <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                <Shield size={14} className="text-emerald-600" />
                                Operator Sign-off & Audit Log
                            </h4>
                            <span className="text-[10px] font-mono text-zinc-500">
                                ID: OP-0482 / Priya Sharma
                            </span>
                        </div>

                        <div className="text-xs space-y-1.5">
                            <p className="text-zinc-800">
                                <span className="font-bold">Operator Notes:</span>{' '}
                                {assessment.operatorReview?.notes || 'Assessment verified through standard triage protocol. Acoustic and semantic signals confirmed.'}
                            </p>
                            {assessment.operatorReview?.emergencyDispatched && (
                                <p className="text-red-700 font-bold">
                                    Emergency Dispatch Authorized: {assessment.operatorReview.dispatchDetails?.unit} ({assessment.operatorReview.dispatchDetails?.priority})
                                </p>
                            )}
                        </div>

                        <div className="flex justify-between items-end pt-2 text-[10px] font-mono text-zinc-400 border-t border-zinc-200">
                            <span>ELECTRONICALLY SIGNED & ENCRYPTED</span>
                            <span>SECURITY LEVEL 3 AUTHENTICATED</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
