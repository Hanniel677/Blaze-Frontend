import React from 'react';
import type { SpeechMetrics } from '../types';
import { Mic, Activity, Clock, Zap } from 'lucide-react';

interface SpeechAnalysisProps {
    metrics: SpeechMetrics;
}

const SpeechAnalysis: React.FC<SpeechAnalysisProps> = ({ metrics }) => {
    // Generate smooth SVG pitch curve path
    const generateSvgPath = (points: number[]) => {
        if (!points || points.length === 0) return '';
        const width = 280;
        const height = 40;
        const step = width / (points.length - 1);

        return points.map((p, index) => {
            const x = (index * step).toFixed(1);
            const y = (height - (p / 100) * height).toFixed(1);
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    const getRateColor = (rate: string) => {
        switch (rate) {
            case 'Fast':
            case 'Elevated':
                return 'text-amber-700 bg-amber-50 border-amber-200';
            case 'Slurred':
                return 'text-rose-700 bg-rose-50 border-rose-200';
            default:
                return 'text-emerald-700 bg-emerald-50 border-emerald-200';
        }
    };

    return (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between select-none text-zinc-900 transition-all hover:border-zinc-300">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-100">
                    <div>
                        <h3 className="font-display font-medium text-base text-zinc-900">
                            Speech Acoustics & Cadence
                        </h3>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            Real-time pitch tremors, hesitancy pauses and stress pressure
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                        <Mic size={16} />
                    </div>
                </div>

                {/* 4-Item Grid of Core Acoustic Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-2xl">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                            Speaking Rate
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold font-mono border ${getRateColor(metrics.speakingRate)}`}>
                                {metrics.speakingRate}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-2xl">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                            Pause Frequency
                        </span>
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-xs font-semibold font-mono text-zinc-800 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
                                {metrics.pauseFrequency}
                            </span>
                        </div>
                    </div>

                    <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-2xl">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block flex items-center gap-1">
                            <Clock size={11} />
                            Hesitancy Pauses
                        </span>
                        <p className="text-sm font-bold font-mono text-zinc-900 mt-1">
                            {metrics.longPauses} <span className="text-xs font-normal text-zinc-500">(&gt;3.5s)</span>
                        </p>
                    </div>

                    <div className="p-3 bg-zinc-50 border border-zinc-200/70 rounded-2xl">
                        <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block flex items-center gap-1">
                            <Activity size={11} />
                            Pitch Variation
                        </span>
                        <p className="text-sm font-bold font-mono text-zinc-900 mt-1">
                            {metrics.pitchVariation}
                        </p>
                    </div>
                </div>

                {/* Acoustic Visualizations */}
                <div className="space-y-4 border-t border-zinc-100 pt-5">
                    {/* Pitch Waveform Sparkline Curve */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-600">
                            <span className="uppercase tracking-wider">Acoustic Pitch Contour</span>
                            <span className="font-mono text-[10px] text-zinc-400">HERTZ / VARIATION</span>
                        </div>

                        <div className="h-12 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center px-4 overflow-hidden relative">
                            <svg className="w-full h-10 overflow-visible" viewBox="0 0 280 40">
                                <line x1="0" y1="20" x2="280" y2="20" stroke="#e4e4e7" strokeWidth="1" strokeDasharray="3,3" />
                                <path
                                    d={generateSvgPath(metrics.pitchWaveform)}
                                    fill="none"
                                    stroke="#18181b"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Pause Sequence Cadence */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-600">
                            <span className="uppercase tracking-wider">Dialogue Pause Rhythm</span>
                            <span className="font-mono text-[10px] text-zinc-400">{metrics.longPauses} Prolonged</span>
                        </div>

                        <div className="h-8 bg-zinc-50 rounded-2xl border border-zinc-200/80 flex items-center px-3 justify-between gap-1 select-none font-mono">
                            {metrics.pauseSequence.map((isPause, idx) => (
                                <span
                                    key={idx}
                                    className={`text-xs transition-all ${
                                        isPause ? 'text-zinc-900 font-extrabold transform scale-125' : 'text-zinc-300'
                                    }`}
                                    title={isPause ? 'Pause latency point' : 'Continuous phonation'}
                                >
                                    ●
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Speech Stress Pressure Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-zinc-600">
                            <span className="uppercase tracking-wider flex items-center gap-1">
                                <Zap size={12} className="text-zinc-500" />
                                Vocal Stress Pressure
                            </span>
                            <span className="font-mono font-bold text-zinc-900">
                                {metrics.speechStressValue}%
                            </span>
                        </div>

                        <div className="relative h-4 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/80 flex items-center">
                            <div
                                className="h-full bg-zinc-900 transition-all duration-700 ease-out rounded-full"
                                style={{ width: `${metrics.speechStressValue}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Primary Emotion Indicator Footer */}
            <div className="border-t border-zinc-100 pt-4 mt-6 flex justify-between items-center text-xs">
                <span className="text-zinc-500 uppercase tracking-wider font-semibold text-[10px]">
                    Acoustic Emotion Signal:
                </span>
                <span className="font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full">
                    {metrics.emotionalSignal}
                </span>
            </div>
        </div>
    );
};

export default SpeechAnalysis;
