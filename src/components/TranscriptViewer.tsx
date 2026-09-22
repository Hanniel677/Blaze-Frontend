import React, { useState, useRef, useEffect } from 'react';
import type { TranscriptItem } from '../types';
import { Play, AlertCircle, Search, Languages, Quote } from 'lucide-react';

interface TranscriptViewerProps {
    transcript: TranscriptItem[];
    onSelectTime: (seconds: number) => void;
    activeTime: number; // Current playback time in seconds
}

const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcript, onSelectTime, activeTime }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showTranslations, setShowTranslations] = useState(true);
    const activeItemRef = useRef<HTMLDivElement | null>(null);

    const parseTimestamp = (ts: string): number => {
        const parts = ts.split(':');
        if (parts.length === 2) {
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        }
        return 0;
    };

    // Auto-scroll active item into view
    useEffect(() => {
        if (activeItemRef.current) {
            activeItemRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [activeTime]);

    const getIndicatorBadge = (type: string, label: string, severity: string) => {
        let style = 'bg-zinc-100 text-zinc-800 border-zinc-200';
        switch (type) {
            case 'fear':
                style = 'bg-rose-50 border-rose-200 text-rose-800';
                break;
            case 'intimidation':
            case 'threat':
            case 'coercion':
                style = 'bg-red-50 border-red-200 text-red-900';
                break;
            case 'vulnerability':
                style = 'bg-amber-50 border-amber-200 text-amber-900';
                break;
            case 'trauma':
                style = 'bg-purple-50 border-purple-200 text-purple-900';
                break;
            case 'depression':
            case 'isolation':
                style = 'bg-sky-50 border-sky-200 text-sky-900';
                break;
            case 'suicide':
                style = 'bg-red-100 border-red-300 text-red-950 font-bold';
                break;
        }

        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border leading-none shadow-2xs ${style}`}>
                <AlertCircle size={12} className="stroke-[2.5]" />
                <span className="font-semibold">{label}</span>
                <span className="text-[10px] opacity-75 font-mono uppercase">[{severity}]</span>
            </div>
        );
    };

    const filteredTranscript = transcript.filter(item => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.text.toLowerCase().includes(q) ||
            (item.translatedText && item.translatedText.toLowerCase().includes(q)) ||
            (item.indicator && item.indicator.label.toLowerCase().includes(q)) ||
            item.speaker.toLowerCase().includes(q)
        );
    });

    return (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm flex flex-col h-[540px] select-none text-zinc-900 transition-all hover:border-zinc-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-100">
                <div>
                    <h3 className="font-display font-medium text-base text-zinc-900">
                        Synchronized Interaction Transcript
                    </h3>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        Real-time annotated dialogue with distress triggers
                    </p>
                </div>

                {/* Search Bar & Translate toggle */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search transcript..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-40 sm:w-48 pl-8 pr-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full text-xs text-zinc-800 placeholder-zinc-400 focus:bg-white focus:border-zinc-400 outline-none transition-all"
                        />
                    </div>

                    <button
                        onClick={() => setShowTranslations(!showTranslations)}
                        className={`p-1.5 px-2.5 rounded-full text-xs font-mono flex items-center gap-1 border transition-colors cursor-pointer ${
                            showTranslations
                                ? 'bg-zinc-900 text-white border-zinc-900'
                                : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'
                        }`}
                        title="Toggle Institutional Translation"
                    >
                        <Languages size={12} />
                        <span className="text-[10px] font-bold">EN</span>
                    </button>
                </div>
            </div>

            {/* Scrolling transcript body */}
            <div className="flex-1 overflow-y-auto mt-4 pr-1.5 space-y-3">
                {filteredTranscript.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400">
                        <Search size={28} className="stroke-[1.5] mb-2" />
                        <p className="text-xs font-medium">No matching phrases found</p>
                    </div>
                ) : (
                    filteredTranscript.map((item, idx) => {
                        const itemSeconds = parseTimestamp(item.timestamp);
                        const nextItem = filteredTranscript[idx + 1];
                        const nextSeconds = nextItem ? parseTimestamp(nextItem.timestamp) : Infinity;

                        const isActivelyPlaying = activeTime >= itemSeconds && activeTime < nextSeconds;

                        return (
                            <div
                                key={item.id || idx}
                                ref={isActivelyPlaying ? activeItemRef : null}
                                className={`p-4 rounded-2xl border transition-all duration-200 ${
                                    isActivelyPlaying
                                        ? 'bg-zinc-100/90 border-zinc-400 shadow-sm scale-[1.01]'
                                        : 'bg-zinc-50/50 hover:bg-zinc-50 border-zinc-100'
                                }`}
                            >
                                {/* Speaker & Seek Timestamp Button */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
                                                item.speaker === 'Caller'
                                                    ? 'bg-zinc-900 text-white'
                                                    : 'bg-zinc-200 text-zinc-700'
                                            }`}
                                        >
                                            {item.speaker}
                                        </span>
                                        {isActivelyPlaying && (
                                            <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-zinc-900 uppercase">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                Active Stream
                                            </span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => onSelectTime(itemSeconds)}
                                        className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-zinc-500 hover:text-zinc-900 bg-white hover:bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer shadow-2xs"
                                        aria-label={`Jump audio player to timestamp ${item.timestamp}`}
                                    >
                                        <Play size={10} fill="currentColor" />
                                        <span>{item.timestamp}</span>
                                    </button>
                                </div>

                                {/* Spoken Original Text */}
                                <p className="text-sm text-zinc-900 font-medium leading-relaxed">
                                    {item.text}
                                </p>

                                {/* English Translation preview */}
                                {showTranslations && item.translatedText && (
                                    <p className="text-xs text-zinc-500 italic mt-1.5 pl-2 border-l-2 border-zinc-300 font-light">
                                        "{item.translatedText}"
                                    </p>
                                )}

                                {/* Detected Indicator Badge */}
                                {item.indicator && (
                                    <div className="mt-3">
                                        {getIndicatorBadge(item.indicator.type, item.indicator.label, item.indicator.severity)}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer tip */}
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-light">
                <span className="flex items-center gap-1.5">
                    <Quote size={12} />
                    Click any timestamp pill to jump audio playback
                </span>
                <span className="font-mono text-[10px] uppercase">
                    {filteredTranscript.length} Nodes
                </span>
            </div>
        </div>
    );
};

export default TranscriptViewer;
