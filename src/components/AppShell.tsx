import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Activity,
    PhoneCall,
    FileText,
    Settings,
    LogOut,
    ShieldCheck
} from 'lucide-react';
import type { Operator } from '../types';
import { authService } from '../services/authService';

interface AppShellProps {
    children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [operator] = useState<Operator | null>(() => authService.getOperator() || {
        id: 'OP-0482',
        name: 'Priya Sharma',
        email: 'priya.sharma@erss112.gov.in',
        role: 'Duty Officer',
        department: 'Emergency Triage Desk'
    });

    const [currentTime, setCurrentTime] = useState<string>(() => new Date().toLocaleTimeString('en-IN', { hour12: false }));

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Live Call Triage', path: '/analysis', icon: PhoneCall },
        { name: 'Emergency Call Ledger', path: '/dashboard', icon: FileText },
        { name: 'System Settings', path: '/settings', icon: Settings },
    ];

    const currentPath = location.pathname;

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
            {/* Top Official National Emergency Helpline Bar */}
            <div className="bg-slate-900 text-slate-200 text-[11px] px-4 py-1 flex flex-wrap items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <span className="font-semibold text-amber-400">EMERGENCY RESPONSE SUPPORT SYSTEM (ERSS)</span>
                    <span className="hidden sm:inline text-slate-400">|</span>
                    <span className="hidden sm:inline">National Emergency: <strong className="text-white">112</strong></span>
                    <span className="hidden md:inline">Women Helpline: <strong className="text-white">1091</strong></span>
                    <span className="hidden md:inline">Cyber Crime: <strong className="text-white">1930</strong></span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <ShieldCheck size={12} /> SECURED TERMINAL
                    </span>
                    <span>{currentTime} IST</span>
                </div>
            </div>

            {/* Official Portal Header */}
            <header className="bg-blue-950 text-white shadow-sm border-b border-blue-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    {/* Official Emblem & Portal Title */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-blue-900 border border-blue-700 flex items-center justify-center text-amber-400 font-bold shrink-0">
                            <Activity size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-display font-bold text-lg leading-tight tracking-tight text-white">
                                    SAHAAYA AI : आपातकालीन आवाज़ ट्राइएज
                                </h1>
                            </div>
                        </div>
                    </div>

                    {/* Operator Station Info & Logout */}
                    {operator && (
                        <div className="flex items-center gap-3 self-end md:self-auto bg-blue-900/60 border border-blue-800 px-3 py-1.5 rounded-lg text-xs">
                            <div className="text-right">
                                <span className="font-semibold block text-slate-100">{operator.name}</span>
                                <span className="text-[10px] text-blue-300 font-mono">STAFF ID: {operator.id}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-1 hover:bg-red-600 hover:text-white text-slate-300 rounded transition-colors"
                                title="Sign out"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Navigation Bar */}
                <div className="bg-blue-900 border-t border-blue-800">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
                        {navItems.map((item) => {
                            const isActive = currentPath.startsWith(item.path);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold tracking-wide transition-colors whitespace-nowrap border-b-2 ${
                                        isActive
                                            ? 'border-amber-400 text-amber-300 bg-blue-950/50'
                                            : 'border-transparent text-blue-200 hover:text-white hover:bg-blue-800/50'
                                    }`}
                                >
                                    <Icon size={14} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Tricolor Ribbon */}
                <div className="gov-tricolor" />
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
                {children}
            </main>

            {/* Minimalist Government Footer */}
            <footer className="bg-slate-900 text-slate-400 text-xs py-3 border-t border-slate-800 text-center">
                <p>Government of India — Emergency Response Support System (ERSS 112)</p>
            </footer>
        </div>
    );
};

export default AppShell;
