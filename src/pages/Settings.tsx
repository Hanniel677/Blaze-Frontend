import React, { useState } from 'react';
import {
    User,
    CheckCircle2,
    Shield,
    PhoneCall,
    Bell
} from 'lucide-react';
import type { Operator } from '../types';
import { authService } from '../services/authService';

const Settings: React.FC = () => {
    const [operator, setOperator] = useState<Operator | null>(() => authService.getOperator() || {
        id: 'OP-0482',
        name: 'Priya Sharma',
        email: 'priya.sharma@erss112.gov.in',
        role: 'Duty Officer',
        department: 'ERSS Emergency Triage'
    });
    const [name, setName] = useState(() => operator?.name || 'Priya Sharma');
    const [email, setEmail] = useState(() => operator?.email || 'priya.sharma@erss112.gov.in');
    const [role, setRole] = useState(() => operator?.role || 'Duty Officer & Triage In-Charge');
    const [department, setDepartment] = useState(() => operator?.department || 'National Emergency Response Centre (112)');
    const [profileSaved, setProfileSaved] = useState(false);

    // Audio & station preferences
    const [ringToneEnabled, setRingToneEnabled] = useState(true);
    const [autoScrollTranscript, setAutoScrollTranscript] = useState(true);
    const [highDistressAlert, setHighDistressAlert] = useState(true);

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const updated = authService.updateProfile({
            name,
            email,
            role,
            department
        });
        if (updated) {
            setOperator(updated);
            setProfileSaved(true);
            setTimeout(() => setProfileSaved(false), 2500);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-slate-300 rounded-md p-4 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900">
                    Operator Station Settings
                </h2>
                <p className="text-xs text-slate-500 font-light mt-0.5">
                    Duty officer credentials, station preferences, and emergency department handover routing
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left (7/12): Operator Profile */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Operator Profile Card */}
                    <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                <User size={15} className="text-blue-900" />
                                <span>Operator Station Profile</span>
                            </h3>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold border border-slate-200">
                                {operator?.id || 'OP-0482'}
                            </span>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Operator Full Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 outline-none focus:bg-white focus:border-blue-900"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Staff ID
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        value={operator?.id || 'OP-0482'}
                                        className="w-full px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-slate-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-semibold text-slate-700 mb-1">
                                    Official Email Address
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 outline-none focus:bg-white focus:border-blue-900"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Official Designation / Role
                                    </label>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 outline-none focus:bg-white focus:border-blue-900"
                                    />
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        Helpline Unit
                                    </label>
                                    <input
                                        type="text"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-900 outline-none focus:bg-white focus:border-blue-900"
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex items-center gap-3">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-950 hover:bg-blue-900 text-white font-bold rounded text-xs transition-colors cursor-pointer"
                                >
                                    Save Profile
                                </button>
                                {profileSaved && (
                                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                        <CheckCircle2 size={13} /> Profile Updated
                                    </span>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Station Audio & Alert Preferences */}
                    <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs space-y-4">
                        <div className="border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                <Bell size={15} className="text-blue-900" />
                                <span>Operator Station Preferences</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-light mt-0.5">
                                Configure audio prompts and transcript display behavior for this terminal
                            </p>
                        </div>

                        <div className="space-y-3 text-xs">
                            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 cursor-pointer">
                                <div>
                                    <span className="font-semibold text-slate-900 block">Emergency Ring Tone Chime</span>
                                    <span className="text-slate-500 font-light text-[11px]">Play chime when an incoming distress call reaches the desk</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={ringToneEnabled}
                                    onChange={(e) => setRingToneEnabled(e.target.checked)}
                                    className="w-4 h-4 accent-blue-900 cursor-pointer"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 cursor-pointer">
                                <div>
                                    <span className="font-semibold text-slate-900 block">Auto-scroll Live Caller Dialogue</span>
                                    <span className="text-slate-500 font-light text-[11px]">Keep newest caller statement visible automatically</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={autoScrollTranscript}
                                    onChange={(e) => setAutoScrollTranscript(e.target.checked)}
                                    className="w-4 h-4 accent-blue-900 cursor-pointer"
                                />
                            </label>

                            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 cursor-pointer">
                                <div>
                                    <span className="font-semibold text-slate-900 block">High Distress Visual Alert</span>
                                    <span className="text-slate-500 font-light text-[11px]">Highlight terminal border when caller SVI exceeds critical threshold</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={highDistressAlert}
                                    onChange={(e) => setHighDistressAlert(e.target.checked)}
                                    className="w-4 h-4 accent-blue-900 cursor-pointer"
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right (5/12): Official Department Handover Directory */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white border border-slate-300 rounded-md p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                                <Shield size={15} className="text-blue-900" />
                                <span>Emergency Escalation Lines</span>
                            </h3>
                            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                CHANNELS ONLINE
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 font-light">
                            Direct dispatch lines connected to this operator console for immediate call transfer and intervention.
                        </p>

                        <div className="space-y-2.5 text-xs">
                            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded bg-red-100 text-red-700 flex items-center justify-center font-bold">
                                        <PhoneCall size={14} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block">Police Control Room (PCR / QRT)</span>
                                        <span className="text-[11px] text-slate-500">Active harassment, physical violence & threats</span>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-xs bg-red-700 text-white px-2 py-0.5 rounded">
                                    112 / PCR
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                        <Shield size={14} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block">Special Cell (SC/ST Protection)</span>
                                        <span className="text-[11px] text-slate-500">Targeted discrimination & systemic grievance</span>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-xs bg-amber-700 text-white px-2 py-0.5 rounded">
                                    DISTRICT CELL
                                </span>
                            </div>

                            <div className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                                        <PhoneCall size={14} />
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-900 block">Women & Child Helpline Cell</span>
                                        <span className="text-[11px] text-slate-500">Domestic violence, abuse & juvenile distress</span>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-xs bg-blue-900 text-white px-2 py-0.5 rounded">
                                    1090 / 1098
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
