import type { Operator } from '../types';

const STORAGE_KEY = 'sahaaya_operator';

const DEFAULT_OPERATOR: Operator = {
    id: 'OP-0482',
    name: 'Priya Sharma',
    email: 'priya.sharma@erss112.gov.in',
    role: 'Duty Officer & Emergency Triage Lead',
    department: 'National Emergency Response Centre',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240'
};

export const DEMO_OPERATORS: Operator[] = [
    {
        id: 'OP-0482',
        name: 'Priya Sharma',
        email: 'priya.sharma@erss112.gov.in',
        role: 'Duty Officer',
        department: 'ERSS Emergency Triage',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=240'
    },
    {
        id: 'OP-0119',
        name: 'Rajan Sharma',
        email: 'rajan.sharma@sahaaya.ai',
        role: 'Senior Triage Officer',
        department: 'Helpline Operations',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=240'
    }
];

export const authService = {
    getOperator(): Operator | null {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (!stored) {
                // Return default logged in operator for initial seamless dev experience if desired, or null
                return null;
            }
            return JSON.parse(stored);
        } catch {
            return null;
        }
    },

    isAuthenticated(): boolean {
        return this.getOperator() !== null;
    },

    login(emailOrId: string, passwordHex: string): Promise<Operator> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!emailOrId || !passwordHex) {
                    reject(new Error('Operator ID / Email and password are required.'));
                    return;
                }

                if (passwordHex.length < 4) {
                    reject(new Error('Password must be at least 4 characters.'));
                    return;
                }

                const cleanInput = emailOrId.trim();
                const matchedDemo = DEMO_OPERATORS.find(
                    op => op.email.toLowerCase() === cleanInput.toLowerCase() || op.id.toLowerCase() === cleanInput.toLowerCase()
                );

                let operator: Operator;

                if (matchedDemo) {
                    operator = matchedDemo;
                } else {
                    const rawName = cleanInput.split('@')[0] || 'Operator';
                    const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
                    operator = {
                        id: `OP-${Math.floor(1000 + Math.random() * 9000)}`,
                        name: formattedName === 'Admin' ? 'Priya Sharma' : formattedName,
                        email: cleanInput.includes('@') ? cleanInput : `${cleanInput}@erss112.gov.in`,
                        role: 'Triage Specialist',
                        department: 'Helpline Monitoring Desk',
                        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=240'
                    };
                }

                localStorage.setItem(STORAGE_KEY, JSON.stringify(operator));
                resolve(operator);
            }, 600);
        });
    },

    loginAsDemo(demoIndex: number = 0): Operator {
        const op = DEMO_OPERATORS[demoIndex] || DEFAULT_OPERATOR;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(op));
        return op;
    },

    updateProfile(updates: Partial<Operator>): Operator | null {
        const current = this.getOperator();
        if (!current) return null;
        const updated: Operator = {
            ...current,
            ...updates
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
    },

    logout(): void {
        localStorage.removeItem(STORAGE_KEY);
    }
};
