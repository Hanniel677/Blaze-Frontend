import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

interface AudioRecorderProps {
    onAudioReady: (file: File | Blob, durationSec: number, simulatedFilename: string) => void;
    selectedLanguage: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onAudioReady, selectedLanguage }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [permissionError, setPermissionError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const drawVisualizer = useCallback(() => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const render = () => {
            if (!isRecording) return;

            animFrameRef.current = requestAnimationFrame(render);
            analyserRef.current?.getByteFrequencyData(dataArray);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / 32) - 2;
            let x = 0;

            for (let i = 0; i < 32; i++) {
                const sampleIndex = Math.floor((i / 32) * (bufferLength / 2));
                const value = dataArray[sampleIndex] || (Math.random() * 80 + 20);
                const percent = value / 255;
                const barHeight = Math.max(percent * canvas.height, 4);

                // Gradient from dark to accent lime
                const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
                gradient.addColorStop(0, '#18181b');
                gradient.addColorStop(1, '#d9f13b');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 3);
                ctx.fill();

                x += barWidth + 2;
            }
        };

        render();
    }, [isRecording]);

    useEffect(() => {
        if (isRecording) {
            drawVisualizer();
        } else {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        }
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isRecording, drawVisualizer]);

    const startRecording = async () => {
        setPermissionError(null);
        setRecordedBlob(null);
        setRecordingTime(0);
        audioChunksRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
            const audioCtx = new AudioContextClass();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setRecordedBlob(blob);
            };

            mediaRecorder.start(200);
            setIsRecording(true);

            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch {
            // If mic access blocked or headless test environment, trigger simulated recording mode
            setPermissionError('Direct microphone permission unavailable. Switched to simulated voice ingestion mode.');
            setIsRecording(true);
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopRecording = () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (!recordedBlob) {
            // Generate simulated fallback blob
            const fallbackBlob = new Blob(['simulated_voice_stream'], { type: 'audio/mp3' });
            setRecordedBlob(fallbackBlob);
        }
    };

    const handleConfirmAnalysis = () => {
        const finalSec = Math.max(recordingTime, 12);
        const fileName = `Live_Rec_${selectedLanguage}_${new Date().toISOString().slice(11, 19).replace(/:/g, '-')}.mp3`;
        const blobToSubmit = recordedBlob || new Blob(['simulated_voice_data'], { type: 'audio/mp3' });
        onAudioReady(blobToSubmit, finalSec, fileName);
    };

    const formatSeconds = (sec: number) => {
        const mins = Math.floor(sec / 60).toString().padStart(2, '0');
        const secs = (sec % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-6 select-none">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-display font-medium text-base text-zinc-900">
                        Live Voice Stream Ingestion
                    </h3>
                    <p className="text-xs text-zinc-500 font-light mt-0.5">
                        Capture audio directly from station headset or terminal input
                    </p>
                </div>
                <span className="text-[10px] font-mono text-zinc-600 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full font-bold uppercase">
                    DIALECT: {selectedLanguage}
                </span>
            </div>

            {/* Visualizer Canvas & Status Display */}
            <div className="bg-zinc-950 rounded-2xl p-6 text-white flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-pattern-dark opacity-40 pointer-events-none" />

                {isRecording ? (
                    <div className="w-full flex flex-col items-center gap-3 relative z-10">
                        <canvas
                            ref={canvasRef}
                            width={320}
                            height={60}
                            className="w-full max-w-sm h-16"
                        />
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                            <span className="text-sm font-mono font-bold tracking-widest text-red-400">
                                REC [{formatSeconds(recordingTime)}]
                            </span>
                        </div>
                    </div>
                ) : recordedBlob ? (
                    <div className="flex flex-col items-center gap-2 relative z-10 text-center">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                            <CheckCircle2 size={24} />
                        </div>
                        <p className="text-sm font-semibold text-zinc-100">
                            Voice Recording Staged ({formatSeconds(recordingTime || 15)})
                        </p>
                        <p className="text-xs text-zinc-400 font-light">
                            Waveform parameters encoded. Ready for AI Triage.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 relative z-10 text-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                            <Mic size={22} />
                        </div>
                        <p className="text-sm font-medium text-zinc-300">
                            Microphone Ready
                        </p>
                        <p className="text-xs text-zinc-500 font-light">
                            Click "Start Recording" to begin streaming live audio
                        </p>
                    </div>
                )}
            </div>

            {permissionError && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl font-light">
                    {permissionError}
                </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {!isRecording && !recordedBlob && (
                    <button
                        onClick={startRecording}
                        className="w-full bg-zinc-900 hover:bg-black text-white py-3 px-6 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:scale-[1.01]"
                    >
                        <Mic size={15} />
                        <span>Start Microphone Recording</span>
                    </button>
                )}

                {isRecording && (
                    <button
                        onClick={stopRecording}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer animate-pulse"
                    >
                        <Square size={15} />
                        <span>Stop Recording ({formatSeconds(recordingTime)})</span>
                    </button>
                )}

                {recordedBlob && (
                    <div className="w-full flex items-center gap-3">
                        <button
                            onClick={startRecording}
                            className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-3 px-4 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                            <RefreshCw size={14} />
                            <span>Retake Audio</span>
                        </button>

                        <button
                            onClick={handleConfirmAnalysis}
                            className="flex-2 bg-[var(--color-accent-lime)] hover:bg-[var(--color-accent-lime-hover)] text-zinc-950 py-3 px-6 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-lime-300/20 cursor-pointer"
                        >
                            <Sparkles size={15} />
                            <span>Initiate AI Triage Analysis</span>
                            <Play size={12} fill="currentColor" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AudioRecorder;
