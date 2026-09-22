import React, { useState } from 'react';
import type { RiskCategory, CaseAssessment } from '../types';
import { ShieldCheck, Flag, CheckSquare, Siren, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';
import { analysisService } from '../services/analysisService';

interface HumanReviewProps {
    caseId: string;
    initialRisk: RiskCategory;
    onReviewSaved: (updatedCase: CaseAssessment) => void;
    onOpenReport?: () => void;
}

const HumanReview: React.FC<HumanReviewProps> = ({
    caseId,
    initialRisk,
    onReviewSaved,
    onOpenReport
}) => {
    const [confirmedRisk, setConfirmedRisk] = useState<RiskCategory>(initialRisk);
    const [overrideReason, setOverrideReason] = useState('');
    const [flagged, setFlagged] = useState(false);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);

    // Emergency Dispatch Modal State
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [dispatchUnit, setDispatchUnit] = useState('Emergency Helpline Quick Response Team (QRT)');
    const [dispatchPriority, setDispatchPriority] = useState<'STANDARD' | 'URGENT' | 'IMMEDIATE_INTERVENTION'>('IMMEDIATE_INTERVENTION');
    const [isDispatched, setIsDispatched] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        setTimeout(() => {
            const updated = analysisService.saveOperatorReview(
                caseId,
                notes,
                flagged,
                confirmedRisk,
                'Priya Sharma',
                confirmedRisk !== initialRisk ? overrideReason : undefined,
                isDispatched,
                isDispatched
                    ? {
                          unit: dispatchUnit,
                          dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                          priority: dispatchPriority
                      }
                    : undefined
            );
            setSaving(false);
            setSavedSuccess(true);

            if (updated) {
                onReviewSaved(updated);
            }

            setTimeout(() => {
                setSavedSuccess(false);
            }, 3500);
        }, 600);
    };

    const handleConfirmDispatch = () => {
        setIsDispatched(true);
        setShowDispatchModal(false);
    };

    const riskCategories: RiskCategory[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

    return (
        <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col justify-between select-none text-zinc-900 transition-all hover:border-zinc-300">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div>
                        <h3 className="font-display font-medium text-base text-zinc-900">
                            Operator Triage Verification Console
                        </h3>
                        <p className="text-xs text-zinc-500 font-light mt-0.5">
                            Validate AI distress findings, record review findings & dispatch emergency units
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600">
                        <CheckSquare size={16} />
                    </div>
                </div>

                {/* Risk Classification Selector */}
                <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        Confirm or Override Risk Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {riskCategories.map((risk) => {
                            const isActive = confirmedRisk === risk;
                            return (
                                <button
                                    type="button"
                                    key={risk}
                                    onClick={() => setConfirmedRisk(risk)}
                                    className={`py-2 px-1 rounded-2xl text-xs font-mono font-bold border text-center transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm'
                                            : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                                    }`}
                                >
                                    {risk}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Override Reason Dropdown if Risk Changed */}
                {confirmedRisk !== initialRisk && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1.5 animate-fade-in">
                        <label className="block text-[10px] font-bold text-amber-900 uppercase tracking-wider">
                            Justification for Deviation from AI Score
                        </label>
                        <select
                            value={overrideReason}
                            onChange={(e) => setOverrideReason(e.target.value)}
                            className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-zinc-900 outline-none"
                            required
                        >
                            <option value="">Select reason for override...</option>
                            <option value="Acoustic background noise distorted voice pitch">Acoustic background noise distorted voice pitch</option>
                            <option value="Direct escalation from regional emergency supervisor">Direct escalation from regional emergency supervisor</option>
                            <option value="Caller explicitly verified safe status on follow-up query">Caller explicitly verified safe status on follow-up query</option>
                            <option value="Immediate third-party threat confirmed in caller vicinity">Immediate third-party threat confirmed in caller vicinity</option>
                        </select>
                    </div>
                )}

                {/* Supervisor Escalation Flag */}
                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200/80 p-3.5 rounded-2xl">
                    <div>
                        <p className="text-xs font-semibold text-zinc-800">Flag for Senior Reviewer Escort</p>
                        <p className="text-[10px] text-zinc-500 font-light mt-0.5">
                            Prioritize in supervisor desk queue for second-opinion review
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFlagged(!flagged)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                            flagged
                                ? 'bg-red-500 border-red-600 text-white shadow-xs'
                                : 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-100'
                        }`}
                        title="Toggle Supervisor Escalation Flag"
                    >
                        <Flag size={14} className={flagged ? 'fill-current' : ''} />
                    </button>
                </div>

                {/* Operator Review Notes Textarea */}
                <div className="space-y-1.5">
                    <label htmlFor="notes" className="block text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                        Operator Assessment Findings & Action Notes
                    </label>
                    <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Log clinical notes, direct observations, contact precautions or de-escalation steps taken..."
                        className="block w-full p-3.5 bg-zinc-50 border border-zinc-200 rounded-2xl text-zinc-900 text-xs placeholder-zinc-400 focus:bg-white focus:border-zinc-500 transition-all outline-none resize-none font-sans"
                    />
                </div>

                {/* Emergency Dispatch Banner if triggered */}
                {isDispatched && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-900">
                        <div className="flex items-center gap-2">
                            <Siren size={16} className="text-red-600 animate-pulse" />
                            <div>
                                <p className="font-bold">Emergency Team Dispatched</p>
                                <p className="text-[10px] text-red-700">{dispatchUnit}</p>
                            </div>
                        </div>
                        <span className="text-[9px] font-mono bg-red-100 px-2 py-0.5 rounded font-bold uppercase">
                            {dispatchPriority}
                        </span>
                    </div>
                )}

                {/* Action Buttons: Emergency Dispatch + Save Review + Generate Report */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowDispatchModal(true)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                        >
                            <Siren size={14} />
                            <span>Emergency Dispatch</span>
                        </button>

                        {onOpenReport && (
                            <button
                                type="button"
                                onClick={onOpenReport}
                                className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 px-3 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Print / Download Assessment Report"
                            >
                                <FileText size={14} />
                                <span>Report</span>
                            </button>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-zinc-900 hover:bg-black disabled:bg-zinc-700 text-white font-semibold py-2.5 px-6 rounded-2xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
                    >
                        {saving ? (
                            <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Saving Record...</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={14} />
                                <span>Complete Review</span>
                            </>
                        )}
                    </button>
                </div>

                {savedSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
                        <CheckCircle2 size={16} className="text-emerald-600" />
                        <span>Case Assessment Logged & Signed by Priya Sharma</span>
                    </div>
                )}
            </form>

            {/* Emergency Dispatch Confirmation Modal */}
            {showDispatchModal && (
                <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border border-zinc-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h4 className="font-display font-bold text-base text-zinc-900">
                                    Initiate Crisis Dispatch
                                </h4>
                                <p className="text-xs text-zinc-500 font-light">
                                    Route case #{caseId} to regional emergency intervention services
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <label className="block font-semibold text-zinc-700 mb-1">
                                    Intervention Unit
                                </label>
                                <select
                                    value={dispatchUnit}
                                    onChange={e => setDispatchUnit(e.target.value)}
                                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 outline-none"
                                >
                                    <option value="Emergency Helpline Quick Response Team (QRT)">
                                        Emergency Helpline Quick Response Team (QRT)
                                    </option>
                                    <option value="District Social Protection & Trauma Counselor">
                                        District Social Protection & Trauma Counselor
                                    </option>
                                    <option value="National Emergency Cyber Crime Coordination Desk">
                                        National Emergency Cyber Crime Coordination Desk
                                    </option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-semibold text-zinc-700 mb-1">
                                    Dispatch Priority Tier
                                </label>
                                <select
                                    value={dispatchPriority}
                                    onChange={e => setDispatchPriority(e.target.value as any)}
                                    className="w-full p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800 outline-none"
                                >
                                    <option value="IMMEDIATE_INTERVENTION">Tier 1: Immediate Field Intervention (&lt;15 mins)</option>
                                    <option value="URGENT">Tier 2: Urgent Counselor Follow-up (&lt;1 hour)</option>
                                    <option value="STANDARD">Tier 3: Standard Welfare Verification (&lt;24 hours)</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDispatchModal(false)}
                                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmDispatch}
                                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                                <Siren size={14} />
                                <span>Authorize Dispatch</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HumanReview;
