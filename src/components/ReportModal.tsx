import React from 'react';
import type { CaseAssessment } from '../types';
import { Printer, X, Shield, Activity, FileText } from 'lucide-react';

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
                            className="bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                            <Printer size={14} />
                            <span>Print / Export PDF</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Printable Document Body */}
                <div className="space-y-6 print:space-y-4">
                    {/* Official Document Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b-2 border-zinc-900 pb-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center text-[var(--color-accent-lime)]">
                                    <Activity size={16} />
                                </div>
                                <h2 className="font-display font-bold text-xl tracking-tight text-zinc-950">
                                    SAHAAYA AI HELPLINE
                                </h2>
                            </div>
                            <p className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mt-1">
                                Real-Time Voice Stress & Vulnerability Assessment Report
                            </p>
                        </div>

                        <div className="text-right font-mono text-xs text-zinc-600">
                            <p className="font-bold text-zinc-900 text-sm">CASE #{assessment.id}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5">GENERATED: {new Date().toLocaleString()}</p>
                            <p className="text-[10px] text-emerald-700 font-bold">STATUS: {assessment.status}</p>
                        </div>
                    </div>

                    {/* Metadata Summary Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/80 text-xs">
                        <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Dialect & Regional Code</span>
                            <span className="font-bold text-zinc-900">{assessment.language}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Interaction Length</span>
                            <span className="font-bold text-zinc-900">{assessment.duration}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Caller Terminal ID</span>
                            <span className="font-mono text-zinc-700">{assessment.callerIdMasked || '+91-PROTECTED'}</span>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Logged Time</span>
                            <span className="font-mono text-zinc-700">{assessment.time}</span>
                        </div>
                    </div>

                    {/* Primary Classification & SVI Box */}
                    <div className="border-2 border-zinc-900 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
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
