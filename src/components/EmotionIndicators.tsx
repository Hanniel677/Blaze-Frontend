import React from 'react';
import type { EmotionMetric } from '../types';
import { HeartCrack } from 'lucide-react';

interface EmotionIndicatorsProps {
    emotions: EmotionMetric[];
}

const EmotionIndicators: React.FC<EmotionIndicatorsProps> = ({ emotions }) => {
    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'HIGH':
                return 'text-rose-900 bg-rose-50 border-rose-200';
            case 'MEDIUM':
                return 'text-amber-900 bg-amber-50 border-amber-200';
            case 'LOW':
                return 'text-zinc-600 bg-zinc-100 border-zinc-200';
            default:
                return 'text-zinc-500 bg-zinc-50 border-zinc-200';
        }
    };

    const getBarColor = (name: string, level: string) => {
        if (name === 'Neutral') return 'bg-zinc-400';
        if (level === 'HIGH') return 'bg-zinc-900';
        if (level === 'MEDIUM') return 'bg-amber-500';
        return 'bg-zinc-300';
    };

    return (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between select-none text-zinc-900 transition-all hover:border-zinc-300">
            <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-zinc-100">
                    <div>
                        <h3 className="font-display font-medium text-base text-zinc-900">
                            Emotional State Frequencies
                        </h3>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            Detected affective distribution extracted from vocal signals
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                        <HeartCrack size={16} />
                    </div>
                </div>

                {/* Emotion Bars */}
                <div className="space-y-4">
                    {emotions.map((emotion) => (
                        <div key={emotion.name} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-zinc-800">{emotion.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold font-mono rounded-md border ${getLevelBadge(emotion.level)}`}>
                                        {emotion.level}
                                    </span>
                                    <span className="font-mono font-bold text-zinc-900">{emotion.value}%</span>
                                </div>
                            </div>

                            {/* Progress Slider Bar */}
                            <div className="h-2 w-full bg-zinc-100 border border-zinc-200/60 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(emotion.name, emotion.level)}`}
                                    style={{ width: `${emotion.value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 mt-6 text-[10px] text-zinc-400 font-light leading-relaxed">
                * Note: Emotion distributions denote real-time acoustic stress frequencies, not psychological clinical diagnoses.
            </div>
        </div>
    );
};

export default EmotionIndicators;
