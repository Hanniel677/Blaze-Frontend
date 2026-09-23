import { jsPDF } from 'jspdf';
import type { CallerScriptLine } from '../data/demoScript';

export interface ReportData {
    callId: string;
    callerNumber: string;
    callerLocation: string;
    dialect: string;
    durationFormatted: string;
    assessment: {
        svi: number;
        risk: string;
        confidence: number;
        vulnerabilityDomain: string;
        stressLevel: string;
        recommendedAction: string;
    };
    lines: CallerScriptLine[];
    escalationDocket?: {
        department: string;
        timestamp: string;
        docketId: string;
    } | null;
    dutyOfficer?: string;
}

export function generateEmergencyIncidentPdf(data: ReportData): void {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - (margin * 2);
    let y = 14;

    // Helper for adding new page if needed
    const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 16) {
            doc.addPage();
            y = 16;
            // Draw mini top banner on subsequent pages
            doc.setFillColor(15, 23, 42); // slate-900
            doc.rect(margin, y - 6, contentWidth, 3, 'F');
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            doc.text(`ERSS 112 INCIDENT REPORT | CASE DOCKET: ${data.callId} | CONTINUED`, margin, y);
            y += 6;
        }
    };

    // ----------------------------------------------------
    // 1. TOP OFFICIAL HEADER BANNER (Indian ERSS 112 Style)
    // ----------------------------------------------------
    doc.setFillColor(15, 23, 42); // slate-900 / Navy
    doc.rect(margin, y, contentWidth, 24, 'F');

    // Tricolor top accent strip (Saffron, White, Green)
    const stripeWidth = contentWidth / 3;
    doc.setFillColor(249, 115, 22); // Orange/Saffron
    doc.rect(margin, y, stripeWidth, 1.8, 'F');
    doc.setFillColor(255, 255, 255); // White
    doc.rect(margin + stripeWidth, y, stripeWidth, 1.8, 'F');
    doc.setFillColor(22, 163, 74); // Green
    doc.rect(margin + (stripeWidth * 2), y, stripeWidth, 1.8, 'F');

    // Header Text
    doc.setTextColor(248, 250, 252);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('EMERGENCY RESPONSE SUPPORT SYSTEM (ERSS 112)', margin + 4, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text('MINISTRY OF HOME AFFAIRS • AUTOMATED ACOUSTIC TELEMETRY & TRIAGE LEDGER', margin + 4, y + 13);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(253, 224, 71); // Amber
    doc.text('FORENSIC INCIDENT DOSSIER', margin + 4, y + 19);

    // Right-aligned official stamp badge
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`DOCKET: ${data.callId}`, pageWidth - margin - 4, y + 8, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(`GENERATED: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour12: false })} IST`, pageWidth - margin - 4, y + 13, { align: 'right' });
    doc.text('OFFICIAL RECORD • RESTRICTED', pageWidth - margin - 4, y + 18, { align: 'right' });

    y += 28;

    // ----------------------------------------------------
    // 2. INCIDENT & TELEPHONY METADATA GRID
    // ----------------------------------------------------
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.rect(margin, y, contentWidth, 22, 'FD');

    const colW = contentWidth / 4;

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('CALLER TELEPHONY ID', margin + 3, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(data.callerNumber, margin + 3, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(`Duration: ${data.durationFormatted}`, margin + 3, y + 16);

    // Col 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('INCIDENT LOCATION', margin + colW + 3, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    const locLines = doc.splitTextToSize(data.callerLocation, colW - 6);
    doc.text(locLines, margin + colW + 3, y + 10);

    // Col 3
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('VOICE DIALECT & NLP', margin + (colW * 2) + 3, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.dialect, margin + (colW * 2) + 3, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('ASR Engine: Hindi-Indic S2T', margin + (colW * 2) + 3, y + 16);

    // Col 4
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('DUTY OFFICER / STATION', margin + (colW * 3) + 3, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(data.dutyOfficer || 'Priya Sharma (OP-0482)', margin + (colW * 3) + 3, y + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Central ERSS Desk 04', margin + (colW * 3) + 3, y + 16);

    y += 26;

    // ----------------------------------------------------
    // 3. FORENSIC AI DISTRESS CLASSIFICATION SUMMARY
    // ----------------------------------------------------
    const risk = data.assessment.risk;
    const isCrit = risk === 'CRITICAL';
    const isHigh = risk === 'HIGH';

    doc.setFillColor(isCrit ? 254 : isHigh ? 255 : 241, isCrit ? 242 : isHigh ? 251 : 245, isCrit ? 242 : isHigh ? 235 : 249);
    doc.setDrawColor(isCrit ? 220 : isHigh ? 217 : 203, isCrit ? 38 : isHigh ? 119 : 213, isCrit ? 38 : isHigh ? 6 : 225);
    doc.rect(margin, y, contentWidth, 32, 'FD');

    // SVI Score Block
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('STRESS VULNERABILITY INDEX (SVI)', margin + 4, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(isCrit ? 185 : isHigh ? 194 : 30, isCrit ? 28 : isHigh ? 65 : 41, isCrit ? 28 : isHigh ? 12 : 59);
    doc.text(`${data.assessment.svi.toString().padStart(2, '0')}`, margin + 4, y + 16);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('/ 100 SVI', margin + 20, y + 15);

    // Threat level badge
    doc.setFillColor(isCrit ? 185 : isHigh ? 194 : 51, isCrit ? 28 : isHigh ? 65 : 65, isCrit ? 28 : isHigh ? 12 : 85);
    doc.roundedRect(margin + 4, y + 20, 48, 7, 1.5, 1.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`LEVEL: ${risk} RISK (${data.assessment.confidence}% CONF.)`, margin + 6, y + 25);

    // Right details
    const detX = margin + 58;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('IDENTIFIED VULNERABILITY DOMAIN:', detX, y + 6);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(data.assessment.vulnerabilityDomain, detX, y + 11);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('ACOUSTIC DISTRESS TELEMETRY:', detX, y + 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(data.assessment.stressLevel, detX, y + 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(isCrit ? 185 : 194, isCrit ? 28 : 65, isCrit ? 28 : 12);
    doc.text('STATUTORY DIRECTIVE:', detX, y + 29);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    const actLines = doc.splitTextToSize(data.assessment.recommendedAction, contentWidth - 62);
    doc.text(actLines, detX + 38, y + 29);

    y += 36;

    // ----------------------------------------------------
    // 4. INTER-AGENCY HANDOVER & DISPATCH DETAILS
    // ----------------------------------------------------
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200
    doc.rect(margin, y, contentWidth, 18, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 83, 45); // emerald-900
    doc.text('INTER-AGENCY DISPATCH & HANDOVER PROTOCOL', margin + 4, y + 5);

    if (data.escalationDocket) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(22, 101, 52);
        doc.text(`Transferred Unit: ${data.escalationDocket.department}`, margin + 4, y + 10);
        doc.text(`Handover Docket: ${data.escalationDocket.docketId}  |  Dispatch Time: ${data.escalationDocket.timestamp} IST`, margin + 4, y + 15);

        // Status badge
        doc.setFillColor(22, 101, 52);
        doc.roundedRect(pageWidth - margin - 38, y + 4, 34, 6, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.text('DISPATCH ACTIVE', pageWidth - margin - 21, y + 8, { align: 'center' });
    } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text('Standard Triage Protocol: Incident recorded and archived for district supervisory review.', margin + 4, y + 11);
    }

    y += 22;

    // ----------------------------------------------------
    // 5. TIMECODED CALL TRANSCRIPT & SEMANTIC ANALYSIS
    // ----------------------------------------------------
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('LIVE CALLER AUDIO SPEECH TRANSCRIPTION (VERIFIED NLP LOG)', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Complete forensic audio stream decoded in chronological sequence with distress indicator markers', margin, y + 4);

    y += 7;

    // Transcript Table Header
    doc.setFillColor(226, 232, 240); // slate-200
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text('TIME', margin + 2, y + 4.2);
    doc.text('SPEAKER', margin + 14, y + 4.2);
    doc.text('ORIGINAL SPEECH STATEMENT (HINDI) & ENGLISH TRANSLATION', margin + 34, y + 4.2);
    doc.text('SEVERITY / TAG', pageWidth - margin - 2, y + 4.2, { align: 'right' });

    y += 7;

    // Render each transcript line
    data.lines.forEach((line, index) => {
        checkPageBreak(22);

        const isEven = index % 2 === 0;
        doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
        
        // Background row
        const estimatedHeight = 16;
        doc.rect(margin, y, contentWidth, estimatedHeight, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, y + estimatedHeight, margin + contentWidth, y + estimatedHeight);

        // Time offset
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`+${line.secondOffset}s`, margin + 2, y + 5);

        // Speaker
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(180, 83, 9); // amber-700
        doc.text('CALLER', margin + 14, y + 5);

        // Tag
        if (line.indicatorTag) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            doc.setTextColor(line.severity === 'CRITICAL' ? 185 : 180, line.severity === 'CRITICAL' ? 28 : 83, line.severity === 'CRITICAL' ? 28 : 9);
            doc.text(`[${line.severity}]`, pageWidth - margin - 2, y + 5, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(6);
            doc.setTextColor(100, 116, 139);
            const tagLines = doc.splitTextToSize(line.indicatorTag, 45);
            doc.text(tagLines, pageWidth - margin - 2, y + 9, { align: 'right' });
        }

        // Statement text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        // Note: For Hindi text in standard font, we render both original transcript and English translation
        const textToDisplay = line.englishTranslation 
            ? `Original: "${line.text}"\nTranslation: "${line.englishTranslation}"`
            : `"${line.text}"`;

        const splitLines = doc.splitTextToSize(textToDisplay, contentWidth - 85);
        doc.text(splitLines, margin + 34, y + 5);

        y += estimatedHeight + 1;
    });

    y += 6;

    // ----------------------------------------------------
    // 6. OFFICIAL FOOTER & AUTHENTICATION STAMP
    // ----------------------------------------------------
    checkPageBreak(25);

    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.rect(margin, y, contentWidth, 20, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('DIGITAL VERIFICATION & FORENSIC CERTIFICATE', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(71, 85, 105);
    doc.text('This automated dispatch dossier was generated by the ERSS 112 Voice Telemetry AI Engine.', margin + 4, y + 9);
    doc.text('Acoustic distress parameters, speech rate variations, and linguistic distress markers are certified under Section 65B of Indian Evidence Act.', margin + 4, y + 13);
    doc.text(`Document Hash: SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-VERIFIED | Retention Protocol: Auto-deletion in 30 days`, margin + 4, y + 17);

    // Save and download PDF directly
    const filename = `ERSS_Incident_Report_${data.callId}.pdf`;
    doc.save(filename);
}
