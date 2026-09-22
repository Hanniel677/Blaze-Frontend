import React, { useState } from 'react';
import type { RiskCategory, SviFactorBreakdown } from '../types';
import { ShieldAlert, Activity, MessageSquare, Heart } from 'lucide-react';

interface SVIVisualizationProps {
    score: number; // 0-100
    risk: RiskCategory;
    confidence: number; // 0-100
    factorBreakdown?: SviFactorBreakdown;
}

const SVIVisualization: React.FC<SVIVisualizationProps> = ({
    score,
    risk,
    confidence,
    factorBreakdown = {
        acousticStressScore: Math.round(score * 0.95),
        linguisticVulnerabilityScore: Math.round(score * 1.02),
        emotionalInstabilityScore: Math.round(score * 0.88)
    }
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'factors'>('overview');

    const getRiskColor = (cat: RiskCategory) => {
        switch (cat) {
            case 'CRITICAL':
                return 'bg-zinc-900 text-white border-zinc-800 shadow-md ring-1 ring-zinc-700';
            case 'HIGH':
                return 'bg-amber-100 text-amber-900 border-amber-300 ring-1 ring-amber-300';
            case 'MODERATE':
                return 'bg-zinc-100 text-zinc-800 border-zinc-300';
            case 'LOW':
                return 'bg-[var(--color-accent-lime)] text-zinc-950 border-lime-300 font-bold';
        }
    };

    const getRiskDescription = (cat: RiskCategory) => {
        switch (cat) {
            case 'CRITICAL':
                return 'Acute critical distress markers detected. Immediate operator de-escalation and supervisor emergency routing required.';
            case 'HIGH':
                return 'Elevated trauma, coercion, or severe isolation indicators present. High-priority case queue handling advised.';
            case 'MODERATE':
                return 'Moderate situational distress identified. Standard triage monitoring with scheduled call follow-up recommended.';
            case 'LOW':
                return 'Conversational parameters and vocal energy within normative baseline. Low-priority supportive guidance.';
        }
    };

    const positionPercent = Math.min(Math.max(score, 0), 100);

    return (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between select-none text-zinc-900 transition-all hover:border-zinc-300 relative overflow-hidden">
            {/* Ambient backdrop for critical */}
            {risk === 'CRITICAL' && (
                <div className="absolute -right-16 -top-16 w-60 h-60 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
            )}

            <div>
                {/* Header & Tabs */}
                <div className="flex items-center justify-between mb-6 pb-2">
                    <div>
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                            Stress & Vulnerability Index
                        </h3>
                    </div>

                    <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-full border border-zinc-200 text-[10px] font-mono font-bold">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                                activeTab === 'overview'
                                    ? 'bg-white text-zinc-900 shadow-2xs'
                                    : 'text-zinc-500 hover:text-zinc-800'
                            }`}
                        >
                            COMPOSITE
                        </button>
                        <button
                            onClick={() => setActiveTab('factors')}
                            className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                                activeTab === 'factors'
                                    ? 'bg-white text-zinc-900 shadow-2xs'
                                    : 'text-zinc-500 hover:text-zinc-800'
                            }`}
                        >
                            WEIGHTS
                        </button>
                    </div>
                </div>

                {activeTab === 'overview' ? (
                    <>
                        {/* Score & Risk Badge Display */}
                        <div className="flex items-end justify-between gap-4 mt-2">
                            <div className="flex items-baseline">
                                <span className="font-display font-medium text-6xl text-black tracking-tighter">
                                    {score}
                                </span>
                                <span className="text-zinc-400 font-mono text-sm ml-2">/100 SVI</span>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className={`px-4 py-1.5 text-[11px] uppercase font-bold tracking-widest rounded-full border ${getRiskColor(risk)}`}>
                                    {risk} RISK
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-200">
                                    <span>CONFIDENCE:</span>
                                    <span className="font-bold text-zinc-900">{confidence}%</span>
                                </div>
                            </div>
                        </div>

                        {/* Gradient Risk Spectrum Gauge */}
                        <div className="relative mt-10 mb-8">
                            {/* Segmented Track */}
                            <div className="h-2.5 w-full bg-zinc-100 rounded-full flex overflow-hidden border border-zinc-200 shadow-inner">
                                <div className="w-1/4 h-full bg-[var(--color-accent-lime)] opacity-80" title="Low (0-25)" />
                                <div className="w-1/4 h-full bg-zinc-300 border-l border-zinc-400" title="Moderate (26-50)" />
                                <div className="w-1/4 h-full bg-amber-400 border-l border-zinc-400" title="High (51-75)" />
                                <div className="w-1/4 h-full bg-zinc-900 border-l border-zinc-400" title="Critical (76-100)" />
                            </div>

                            {/* Gauge Indicator Slider Needle */}
                            <div
                                className="absolute -top-2 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out"
                                style={{ left: `${positionPercent}%` }}
                            >
                                <div className="w-6 h-6 rounded-full bg-white border-2 border-black shadow-md flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-black" />
                                </div>
                            </div>

                            {/* Scale Axis Indicators */}
                            <div className="flex justify-between mt-3 text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                                <span>LOW (0)</span>
                                <span>MOD (25)</span>
                                <span>HIGH (50)</span>
                                <span className="text-zinc-900 font-extrabold">CRITICAL (75+)</span>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Factor Breakdown Weights Tab */
                    <div className="space-y-4 my-2 animate-fade-in">
                        {/* Acoustic Stress Factor */}
                        <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                                    <Activity size={14} className="text-zinc-600" />
                                    Acoustic Stress (35% Weight)
                                </span>
                                <span className="font-mono font-bold text-zinc-900">
                                    {factorBreakdown.acousticStressScore}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-zinc-900 transition-all duration-500 rounded-full"
                                    style={{ width: `${Math.min(factorBreakdown.acousticStressScore, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Linguistic Vulnerability Factor */}
                        <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                                    <MessageSquare size={14} className="text-zinc-600" />
                                    Linguistic Vulnerability (40% Weight)
                                </span>
                                <span className="font-mono font-bold text-zinc-900">
                                    {factorBreakdown.linguisticVulnerabilityScore}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-amber-500 transition-all duration-500 rounded-full"
                                    style={{ width: `${Math.min(factorBreakdown.linguisticVulnerabilityScore, 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Emotional Instability Factor */}
                        <div className="p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold text-zinc-800 flex items-center gap-1.5">
                                    <Heart size={14} className="text-zinc-600" />
                                    Emotional Instability (25% Weight)
                                </span>
                                <span className="font-mono font-bold text-zinc-900">
                                    {factorBreakdown.emotionalInstabilityScore}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-rose-500 transition-all duration-500 rounded-full"
                                    style={{ width: `${Math.min(factorBreakdown.emotionalInstabilityScore, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Guidance Alert Banner */}
            <div className="border-t border-zinc-100 pt-5 mt-2">
                <div className="flex items-start gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/70">
                    <div className="p-1.5 bg-white text-zinc-900 rounded-xl shrink-0 shadow-2xs border border-zinc-200">
                        <ShieldAlert size={15} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">
                            Guidance Protocol
                        </p>
                        <p className="text-xs text-zinc-700 mt-1.5 font-medium leading-relaxed">
                            {getRiskDescription(risk)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SVIVisualization;
