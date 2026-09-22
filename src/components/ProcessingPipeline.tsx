import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface ProcessingPipelineProps {
    onComplete: () => void;
    isStarted: boolean;
}

const STAGES = [
    { title: 'VOICE STREAM INGESTED', desc: 'Decoding 24-bit audio frames & acoustic noise reduction' },
    { title: 'LANGUAGE & DIALECT IDENTIFIED', desc: 'Classifying dialect patterns and acoustic cadence models' },
    { title: 'PHONETIC SPEECH TRANSCRIBED', desc: 'Whisper deep neural acoustic model transcript extraction' },
    { title: 'ACOUSTIC CADENCE ANALYSED', desc: 'Pitch tremors, speaking rate and hesitancy pauses logged' },
    { title: 'EMOTION FREQUENCIES PARSED', desc: 'Evaluating fear, acute distress, sadness and instability' },
    { title: 'VULNERABILITY DOMAINS EXTRACTED', desc: 'Parsing intimidation, confinement, and trauma markers' },
    { title: 'COMPOSITING SVI SCORE', desc: 'Generating multi-dimensional Stress & Vulnerability Index' }
];

const ProcessingPipeline: React.FC<ProcessingPipelineProps> = ({ onComplete, isStarted }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!isStarted) return;

        const timer = setInterval(() => {
            setCurrentIdx((prev) => {
                if (prev >= STAGES.length - 1) {
                    clearInterval(timer);
                    setTimeout(() => {
                        onCompleteRef.current();
                    }, 600);
                    return STAGES.length;
                }
                return prev + 1;
            });
        }, 750);

        return () => clearInterval(timer);
    }, [isStarted]);

    if (!isStarted) return null;

    const progressPercent = Math.min(Math.round(((currentIdx + 1) / STAGES.length) * 100), 100);

    return (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 md:p-8 shadow-xl max-w-lg w-full mx-auto animate-fade-in select-none text-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-zinc-900 text-[var(--color-accent-lime)] flex items-center justify-center shadow-sm">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                    <div>
                        <h3 className="font-display font-medium text-base text-zinc-900">
                            AI Triage Analysis Pipeline
                        </h3>
                        <p className="text-xs text-zinc-500 font-light">
                            Real-time multi-stage signal decomposition
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full">
                        {progressPercent}%
                    </span>
                </div>
            </div>

            {/* Progress Track Bar */}
            <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden mb-6 border border-zinc-200/60">
                <div
                    className="h-full bg-zinc-900 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${progressPercent}%` }}
                />
            </div>

            {/* Stage List */}
            <div className="space-y-2.5">
                {STAGES.map((stage, index) => {
                    const isDone = index < currentIdx;
                    const isActive = index === currentIdx;
                    const isPending = index > currentIdx;

                    return (
                        <div
                            key={stage.title}
                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                                isActive
                                    ? 'bg-zinc-900 text-white border-zinc-800 shadow-md scale-[1.01]'
                                    : isDone
                                    ? 'bg-zinc-50 border-zinc-200/60 text-zinc-700'
                                    : 'bg-white border-transparent text-zinc-350 opacity-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center">
                                    {isDone && (
                                        <CheckCircle2 size={16} className="text-emerald-500 stroke-[2.5]" />
                                    )}
                                    {isActive && (
                                        <Sparkles size={16} className="text-[var(--color-accent-lime)] animate-pulse" />
                                    )}
                                    {isPending && (
                                        <span className="w-2 h-2 bg-zinc-300 rounded-full" />
                                    )}
                                </div>
                                <div>
                                    <span className="text-xs font-mono font-bold tracking-wider block leading-tight">
                                        {stage.title}
                                    </span>
                                    <span className={`text-[10px] font-light mt-0.5 block ${isActive ? 'text-zinc-300' : 'text-zinc-400'}`}>
                                        {stage.desc}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProcessingPipeline;
