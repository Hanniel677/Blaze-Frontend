import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Download,
    ArrowRight,
    Trash2
} from 'lucide-react';
import { OFFICIAL_CALLER_SCENARIO } from '../data/demoScript';

interface CallRecord {
    id: string;
    time: string;
    date: string;
    language: string;
    duration: string;
    svi: number;
    risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    status: 'DISPATCHED' | 'RESOLVED' | 'MONITORING';
    callerMasked: string;
}

const INITIAL_CALLS: CallRecord[] = [
    {
        id: OFFICIAL_CALLER_SCENARIO.callId,
        time: '10:42 AM',
        date: '22-09-2026',
        language: 'Hindi',
        duration: '00:24',
        svi: OFFICIAL_CALLER_SCENARIO.assessment.svi,
        risk: OFFICIAL_CALLER_SCENARIO.assessment.risk,
        status: 'DISPATCHED',
        callerMasked: OFFICIAL_CALLER_SCENARIO.callerNumber
    },
    {
        id: 'ERSS-2026-0481',
        time: '10:36 AM',
        date: '22-09-2026',
        language: 'Tamil',
        duration: '06:18',
        svi: 64,
        risk: 'HIGH',
        status: 'RESOLVED',
        callerMasked: '+91 94XXX-XX874'
    },
    {
        id: 'ERSS-2026-0480',
        time: '10:14 AM',
        date: '22-09-2026',
        language: 'Telugu',
        duration: '05:10',
        svi: 72,
        risk: 'HIGH',
        status: 'DISPATCHED',
        callerMasked: '+91 97XXX-XX331'
    },
    {
        id: 'ERSS-2026-0479',
        time: '10:02 AM',
        date: '22-09-2026',
        language: 'English',
        duration: '03:41',
        svi: 28,
        risk: 'MODERATE',
        status: 'MONITORING',
        callerMasked: '+91 99XXX-XX412'
    },
    {
        id: 'ERSS-2026-0478',
        time: '09:45 AM',
        date: '22-09-2026',
        language: 'English',
        duration: '02:15',
        svi: 14,
        risk: 'LOW',
        status: 'RESOLVED',
        callerMasked: '+91 96XXX-XX905'
    }
];

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [calls] = useState<CallRecord[]>(INITIAL_CALLS);
    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState('ALL');

    const filteredCalls = calls.filter(c => {
        const matchesSearch =
            !searchQuery.trim() ||
            c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.callerMasked.includes(searchQuery);

        const matchesRisk = riskFilter === 'ALL' || c.risk === riskFilter;

        return matchesSearch && matchesRisk;
    });

    const getRiskBadge = (risk: string) => {
        switch (risk) {
            case 'CRITICAL':
                return 'bg-red-700 text-white font-bold';
            case 'HIGH':
                return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
            case 'MODERATE':
                return 'bg-slate-100 text-slate-700 border border-slate-300';
            case 'LOW':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const handleExportCsv = () => {
        const headers = 'Call ID,Date,Time,Language,Duration,SVI Score,Risk,Status,Caller\n';
        const rows = calls.map(c =>
            `${c.id},${c.date},${c.time},${c.language},${c.duration},${c.svi},${c.risk},${c.status},${c.callerMasked}`
        ).join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ERSS_Triage_Ledger_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white border border-slate-300 rounded-md p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Emergency Response Call Ledger
                    </h2>
                    <p className="text-xs text-slate-500 font-light mt-0.5">
                        Central registry of voice calls triaged by Sahaaya AI automated acoustic telemetry
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleExportCsv}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                        <Download size={14} />
                        <span>Export CSV Ledger</span>
                    </button>


                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-300 rounded-md p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Total Calls Logged
                    </span>
                    <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{calls.length}</p>
                </div>

                <div className="bg-white border border-slate-300 rounded-md p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                        High Risk Calls
                    </span>
                    <p className="text-2xl font-bold font-mono text-amber-800 mt-1">
                        {calls.filter(c => c.risk === 'HIGH').length}
                    </p>
                </div>

                <div className="bg-red-700 text-white rounded-md p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-red-200 uppercase tracking-wider block">
                        Critical Action Required
                    </span>
                    <p className="text-2xl font-bold font-mono text-white mt-1">
                        {calls.filter(c => c.risk === 'CRITICAL').length}
                    </p>
                </div>

                <div className="bg-white border border-slate-300 rounded-md p-4 shadow-xs">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                        Field Units Dispatched
                    </span>
                    <p className="text-2xl font-bold font-mono text-emerald-800 mt-1">
                        {calls.filter(c => c.status === 'DISPATCHED').length}
                    </p>
                </div>
            </div>

            {/* Ledger Table Box */}
            <div className="bg-white border border-slate-300 rounded-md shadow-xs overflow-hidden">
                {/* Search & Filter Strip */}
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by Call ID, Dialect..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-52 sm:w-64 pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-900"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Filter Risk:</span>
                        <select
                            value={riskFilter}
                            onChange={e => setRiskFilter(e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 outline-none"
                        >
                            <option value="ALL">All Risk Levels</option>
                            <option value="CRITICAL">Critical Only</option>
                            <option value="HIGH">High Only</option>
                            <option value="MODERATE">Moderate Only</option>
                            <option value="LOW">Low Only</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                                <th className="p-3">Call Incident ID</th>
                                <th className="p-3">Logged Date / Time</th>
                                <th className="p-3 text-center">Dialect</th>
                                <th className="p-3 text-center">Duration</th>
                                <th className="p-3 text-center">SVI Score</th>
                                <th className="p-3 text-center">Triage Classification</th>
                                <th className="p-3 text-center">Action Status</th>
                                <th className="p-3 text-right">Terminal Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredCalls.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-3 font-mono font-bold text-slate-900">
                                        {item.id}
                                    </td>
                                    <td className="p-3 text-slate-600">
                                        {item.date} {item.time}
                                    </td>
                                    <td className="p-3 text-center font-medium text-slate-800">
                                        {item.language}
                                    </td>
                                    <td className="p-3 text-center font-mono text-slate-600">
                                        {item.duration}
                                    </td>
                                    <td className="p-3 text-center font-mono font-bold text-slate-900 text-sm">
                                        {item.svi}
                                    </td>
                                    <td className="p-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getRiskBadge(item.risk)}`}>
                                            {item.risk}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        {item.status === 'DISPATCHED' ? (
                                            <span className="text-red-700 font-bold bg-red-50 border border-red-200 px-2 py-0.5 rounded text-[10px]">
                                                QRT Dispatched
                                            </span>
                                        ) : item.status === 'RESOLVED' ? (
                                            <div className="flex flex-col items-center">
                                                <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px]">
                                                    Resolved
                                                </span>
                                                <span className="text-[10px] text-slate-400 mt-1 italic leading-tight text-center max-w-[155px] flex items-center justify-center gap-1">
                                                    <Trash2 size={10} className="shrink-0 text-slate-400" />
                                                    <span>This incident info will be auto deleted in 30 days</span>
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-[10px]">
                                                {item.status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right">
                                        <button
                                            onClick={() => navigate('/analysis')}
                                            className="px-2.5 py-1 bg-blue-900 hover:bg-blue-950 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
                                        >
                                            <span>Open Terminal</span>
                                            <ArrowRight size={11} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
