import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    FastForward,
    Rewind,
    Repeat
} from 'lucide-react';
import Waveform from './Waveform';

interface AudioPlayerProps {
    waveform: number[];
    durationSec: number;
    onTimeUpdate: (time: number) => void;
    seekTime?: number;
    audioUrl?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    waveform,
    durationSec,
    onTimeUpdate,
    seekTime
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [volume, setVolume] = useState(80);
    const [isMuted, setIsMuted] = useState(false);
    const [isLooping, setIsLooping] = useState(false);

    const timerRef = useRef<number | null>(null);
    const lastSeekRef = useRef<number | undefined>(undefined);

    // Web Audio Synthesizer for realistic auditory feedback
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    const initWebAudio = () => {
        if (!audioContextRef.current) {
            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const stopSynthTone = useCallback(() => {
        try {
            if (gainNodeRef.current && audioContextRef.current) {
                gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.05);
            }
            setTimeout(() => {
                if (oscillatorRef.current) {
                    oscillatorRef.current.stop();
                    oscillatorRef.current.disconnect();
                    oscillatorRef.current = null;
                }
            }, 60);
        } catch {
            // ignore
        }
    }, []);

    const startSynthTone = useCallback(() => {
        try {
            initWebAudio();
            if (!audioContextRef.current) return;

            stopSynthTone();

            const ctx = audioContextRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, ctx.currentTime);

            // Subtle modulated gentle tone with volume scaling
            const targetVolume = isMuted ? 0 : (volume / 100) * 0.04;
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(targetVolume, ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();

            oscillatorRef.current = osc;
            gainNodeRef.current = gain;
        } catch {
            // Audio context not allowed or unsupported
        }
    }, [isMuted, volume, stopSynthTone]);

    // Update volume on gain node
    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            const targetVolume = isMuted ? 0 : (volume / 100) * 0.04;
            gainNodeRef.current.gain.setValueAtTime(targetVolume, audioContextRef.current.currentTime);
        }
    }, [volume, isMuted]);

    // Synchronize seek requests from parent (e.g. clicking timestamp in transcript)
    useEffect(() => {
        if (seekTime !== undefined && seekTime >= 0 && seekTime !== lastSeekRef.current && seekTime <= durationSec) {
            lastSeekRef.current = seekTime;
            setCurrentTime(seekTime);
        }
    }, [seekTime, durationSec]);

    const handleTimeTick = useCallback(() => {
        setCurrentTime(prev => {
            if (prev >= durationSec) {
                if (isLooping) {
                    onTimeUpdate(0);
                    return 0;
                }
                setIsPlaying(false);
                stopSynthTone();
                return durationSec;
            }
            const next = Math.min(prev + 1, durationSec);
            onTimeUpdate(next);
            return next;
        });
    }, [durationSec, isLooping, onTimeUpdate, stopSynthTone]);

    useEffect(() => {
        if (isPlaying) {
            startSynthTone();
            const intervalMs = 1000 / speed;
            timerRef.current = window.setInterval(handleTimeTick, intervalMs);
        } else {
            stopSynthTone();
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopSynthTone();
        };
    }, [isPlaying, speed, handleTimeTick, startSynthTone, stopSynthTone]);

    const togglePlay = () => {
        if (currentTime >= durationSec) {
            setCurrentTime(0);
            onTimeUpdate(0);
        }
        setIsPlaying(!isPlaying);
    };

    const handleReset = () => {
        setCurrentTime(0);
        onTimeUpdate(0);
        setIsPlaying(false);
    };

    const handleSeek = (time: number) => {
        const rounded = Math.round(time);
        setCurrentTime(rounded);
        onTimeUpdate(rounded);
    };

    const handleSkip = (seconds: number) => {
        const next = Math.max(0, Math.min(durationSec, currentTime + seconds));
        setCurrentTime(next);
        onTimeUpdate(next);
    };

    return (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 shadow-sm space-y-5 select-none text-zinc-900 transition-all hover:border-zinc-300">
            {/* Header info */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-800">
                        Audio Telemetry Stream
                    </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
                    24-BIT / 48kHz DECODED
                </span>
            </div>

            {/* Waveform Player timeline */}
            <Waveform
                waveform={waveform}
                currentTime={currentTime}
                duration={durationSec}
                onSeek={handleSeek}
            />

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-zinc-100">
                {/* Left Controls: Rewind, Play/Pause, Fast Forward, Restart */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSkip(-5)}
                        className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Skip backward 5 seconds"
                        aria-label="Skip backward 5 seconds"
                    >
                        <Rewind size={14} />
                    </button>

                    <button
                        onClick={togglePlay}
                        className="w-11 h-11 rounded-full bg-zinc-900 hover:bg-black text-white flex items-center justify-center transition-all shadow-md active:scale-95 cursor-pointer"
                        aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
                    >
                        {isPlaying ? (
                            <Pause size={18} fill="currentColor" />
                        ) : (
                            <Play size={18} fill="currentColor" className="ml-0.5" />
                        )}
                    </button>

                    <button
                        onClick={() => handleSkip(5)}
                        className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Skip forward 5 seconds"
                        aria-label="Skip forward 5 seconds"
                    >
                        <FastForward size={14} />
                    </button>

                    <button
                        onClick={handleReset}
                        className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer ml-1"
                        title="Restart playback"
                        aria-label="Restart playback"
                    >
                        <RotateCcw size={13} />
                    </button>

                    <button
                        onClick={() => setIsLooping(!isLooping)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                            isLooping
                                ? 'bg-zinc-900 text-[var(--color-accent-lime)]'
                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-400'
                        }`}
                        title={isLooping ? 'Disable Loop' : 'Enable Loop'}
                    >
                        <Repeat size={13} />
                    </button>
                </div>

                {/* Right Controls: Volume & Speed */}
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Volume Control */}
                    <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200/80 px-3 py-1.5 rounded-full">
                        <button
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-zinc-600 hover:text-zinc-900 transition-colors"
                            aria-label={isMuted ? 'Unmute' : 'Mute'}
                        >
                            {isMuted || volume === 0 ? (
                                <VolumeX size={14} className="text-red-500" />
                            ) : (
                                <Volume2 size={14} />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={isMuted ? 0 : volume}
                            onChange={e => {
                                setVolume(Number(e.target.value));
                                if (isMuted) setIsMuted(false);
                            }}
                            className="w-16 h-1 accent-zinc-900"
                            aria-label="Volume level slider"
                        />
                    </div>

                    {/* Speed Multipliers */}
                    <div className="flex items-center gap-1 bg-zinc-100 border border-zinc-200/80 p-0.5 rounded-full text-[11px] font-mono">
                        {[0.5, 1, 1.25, 1.5, 2].map(rate => (
                            <button
                                key={rate}
                                onClick={() => setSpeed(rate)}
                                className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                                    speed === rate
                                        ? 'bg-white text-zinc-900 shadow-xs'
                                        : 'text-zinc-500 hover:text-zinc-900'
                                }`}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
