import React, { useRef, useState } from 'react';
import type { MouseEvent } from 'react';

interface WaveformProps {
    waveform: number[];
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
}

const Waveform: React.FC<WaveformProps> = ({ waveform, currentTime, duration, onSeek }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoverTime, setHoverTime] = useState<number | null>(null);
    const [hoverPosPercent, setHoverPosPercent] = useState<number>(0);

    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

    const formatTime = (time: number): string => {
        if (isNaN(time) || time < 0) return '00:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || duration === 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const ratio = clickX / rect.width;
        setHoverTime(ratio * duration);
        setHoverPosPercent(ratio * 100);
    };

    const handleMouseLeave = () => {
        setHoverTime(null);
    };

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current || duration === 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const ratio = clickX / rect.width;
        onSeek(ratio * duration);
    };

    return (
        <div className="space-y-2 select-none w-full">
            {/* Waveform Scrubber Area */}
            <div
                ref={containerRef}
                onClick={handleClick}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="h-24 bg-zinc-50 border border-zinc-200/80 rounded-2xl px-3 py-2 flex items-end justify-between gap-[2px] sm:gap-[3px] cursor-pointer group relative overflow-hidden transition-all hover:border-zinc-300"
                role="slider"
                aria-label="Audio timeline track scrubber"
                aria-valuemin={0}
                aria-valuemax={duration}
                aria-valuenow={currentTime}
            >
                {/* Background Active Region Glow */}
                <div
                    className="absolute inset-y-0 left-0 bg-zinc-900/5 pointer-events-none transition-all duration-150"
                    style={{ width: `${progressPercent}%` }}
                />

                {/* Hover Playhead Guide Line & Tooltip */}
                {hoverTime !== null && (
                    <>
                        <div
                            className="absolute top-0 bottom-0 w-[1.5px] bg-zinc-400/80 pointer-events-none z-20"
                            style={{ left: `${hoverPosPercent}%` }}
                        />
                        <div
                            className="absolute top-2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-md pointer-events-none z-30 tracking-wider"
                            style={{ left: `${hoverPosPercent}%` }}
                        >
                            {formatTime(hoverTime)}
                        </div>
                    </>
                )}

                {/* Current Playhead Marker Needle */}
                <div
                    className="absolute top-0 bottom-0 w-[2px] bg-zinc-900 pointer-events-none z-10 transition-all duration-100 shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                    style={{ left: `${progressPercent}%` }}
                >
                    <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full -ml-[4px] -mt-1 shadow-sm border border-white" />
                </div>

                {/* Frequency amplitude bars */}
                {waveform.map((height, index) => {
                    const barPercent = (index / waveform.length) * 100;
                    const isPlayed = barPercent <= progressPercent;

                    return (
                        <div
                            key={index}
                            className={`flex-1 rounded-full transition-all duration-200 ${
                                isPlayed
                                    ? 'bg-zinc-900 group-hover:bg-black'
                                    : 'bg-zinc-200 group-hover:bg-zinc-300'
                            }`}
                            style={{
                                height: `${Math.max(height, 12)}%`,
                                transformOrigin: 'bottom',
                                transform: isPlayed ? 'scaleY(1.02)' : 'none'
                            }}
                        />
                    );
                })}
            </div>

            {/* Time Indicators */}
            <div className="flex justify-between items-center text-[11px] font-mono text-zinc-500 font-semibold px-1">
                <span className="text-zinc-900 font-bold bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 rounded">
                    {formatTime(currentTime)}
                </span>
                <span className="text-zinc-400">
                    TOTAL: {formatTime(duration)}
                </span>
            </div>
        </div>
    );
};

export default Waveform;
