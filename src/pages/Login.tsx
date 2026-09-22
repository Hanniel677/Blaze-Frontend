import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, Activity, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { authService } from '../services/authService';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [emailOrId, setEmailOrId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await authService.login(emailOrId, password);
            navigate('/analysis');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Invalid credentials.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleQuickDemo = () => {
        authService.loginAsDemo(0);
        navigate('/analysis');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800">
            {/* Top Official Banner */}
            <div className="bg-blue-950 text-white p-4 shadow-sm border-b border-blue-900">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded bg-blue-900 border border-blue-700 flex items-center justify-center text-amber-400 font-bold">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-base tracking-tight leading-tight">
                                Government of India — Emergency Response Support System (ERSS)
                            </h1>
                            <p className="text-xs text-blue-200">
                                Sahaaya AI Voice Distress & Vulnerability Triage Desk (112 / ERSS Portal)
                            </p>
                        </div>
                    </div>

                    <span className="hidden sm:inline-block text-[11px] font-mono text-emerald-400 bg-blue-900 px-2.5 py-1 rounded border border-blue-800 font-bold">
                        DUTY OPERATOR DESK
                    </span>
                </div>
            </div>

            {/* Tricolor Ribbon */}
            <div className="gov-tricolor" />

            {/* Main Form Center Box */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="bg-white border border-slate-300 rounded-md p-6 sm:p-8 max-w-md w-full shadow-sm space-y-6">
                    <div className="border-b border-slate-200 pb-4 text-center">
                        <h2 className="text-lg font-bold text-slate-900">
                            Operator Station Sign In
                        </h2>
                        <p className="text-xs text-slate-500 font-light mt-1">
                            Access automated speech-to-text triage & emergency dispatch
                        </p>
                    </div>

                    {/* Quick Access Button */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-center space-y-2">
                        <span className="text-[11px] font-bold text-blue-900 uppercase block tracking-wider">
                            Express Login (Duty Officer)
                        </span>
                        <button
                            type="button"
                            onClick={handleQuickDemo}
                            className="w-full py-2 px-3 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded text-xs transition-colors cursor-pointer shadow-xs"
                        >
                            Sign In as Duty Officer (Priya Sharma)
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded font-medium">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Operator Staff ID / Official Email
                            </label>
                            <div className="relative">
                                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="priya.sharma@erss112.gov.in"
                                    value={emailOrId}
                                    onChange={(e) => setEmailOrId(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Station Security Password
                            </label>
                            <div className="relative">
                                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 outline-none focus:bg-white focus:border-blue-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-950 hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                        >
                            <span>Authenticate Operator Station</span>
                            <ArrowRight size={14} />
                        </button>
                    </form>

                    <div className="text-center pt-2 text-[11px] text-slate-400 font-mono flex items-center justify-center gap-1.5 border-t border-slate-100">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        <span>256-Bit Encrypted Helpline Channel</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 text-slate-400 text-xs py-2 text-center border-t border-slate-800">
                National Emergency Response Support System (ERSS 112) — Ministry of Home Affairs
            </div>
        </div>
    );
};

export default Login;
