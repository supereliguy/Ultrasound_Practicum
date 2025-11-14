// --- Case vignettes (for in-page display) ---
    const caseVignettes = {
      "Case 1: Pericardial Tamponade": {
        stem: "Stem: A 55-year-old man with a history of lung cancer presents with shortness of breath, tachycardia, and a blood pressure of 88/60.",
        study: "Cardiac / RUSH Exam",
        findings: "Large circumferential pericardial effusion, diastolic right ventricular (RV) collapse, plethoric/non-collapsing IVC.",
        mdm: "Call for pericardiocentesis tray, cardiology consult, and begin fluid resuscitation."
      },
      "Case 2: Massive PE": {
        stem: "Stem: A 68-year-old woman presents with acute-onset dyspnea and chest pain. She is tachycardic, and her O2 sat is 85%.",
        study: "Cardiac / RUSH Exam",
        findings: "Severely dilated right ventricle (RV > LV), paradoxical septal bowing ('D-sign'), McConnell's sign.",
        mdm: "Administer O2, order STAT CT-PE, and consider thrombolytics."
      },
      "Case 3: Pneumothorax": {
        stem: "Stem: A 22-year-old tall, thin male presents with sudden-onset, sharp left-sided chest pain and shortness of breath.",
        study: "Pulmonary / E-FAST",
        findings: "Absence of lung sliding on the affected side, 'A-lines' only, and (ideally) identification of a 'lung point.'",
        mdm: "Prepare for needle decompression or chest tube."
      },
      "Case 4: Pleural Effusion": {
        stem: "Stem: A 70-year-old woman with a history of breast cancer presents with progressive shortness of breath, cough, and dullness to percussion at the right lung base.",
        study: "Pulmonary",
        findings: "Large anechoic (or complex) fluid collection above the diaphragm, 'spine sign,' and associated lung atelectasis.",
        mdm: "Prepare for diagnostic/therapeutic thoracentesis."
      },
      "Case 5: Hydronephrosis": {
        stem: "Stem: A 40-year-old man presents with 10/10 colicky right flank pain that radiates to his groin, nausea, and vomiting.",
        study: "Renal",
        findings: "Moderate or severe hydronephrosis on the affected side. (Bonus: identifies ureteral jets in the bladder).",
        mdm: "Administer pain control/antiemetics, obtain urinalysis, and consult urology if signs of infection."
      },
      "Case 6: Cholecystitis": {
        stem: "Stem: A 48-year-old woman presents with 12 hours of right upper quadrant pain, fever, and nausea, especially after eating a fatty meal.",
        study: "Gallbladder / RUQ",
        findings: "Gallstones, gallbladder wall thickening (>3mm), pericholecystic fluid, and a Sonographic Murphy's sign.",
        mdm: "Make NPO, administer antibiotics/pain control, and consult general surgery."
      },
      "Case 7: AAA": {
        stem: "Stem: A 72-year-old male with a history of hypertension presents with severe abdominal and back pain and one episode of syncope. He is pale and hypotensive.",
        study: "Aorta / RUSH Exam",
        findings: "Aortic diameter > 3 cm (e.g., 6.5 cm) measured outer-wall to outer-wall, possibly with an intramural thrombus.",
        mdm: "Stop all further diagnostics, establish two large-bore IVs, call vascular surgery emergently, and begin transport to the OR."
      },
      "Case 8: Cardiogenic Shock": {
        stem: "Stem: A 62-year-old man with a history of CAD presents with severe dyspnea, chest discomfort, and altered mental status. He is cold, clammy, and hypotensive (BP 82/55).",
        study: "Cardiac / RUSH Exam",
        findings: "Severely reduced ejection fraction with global hypokinesis, B-lines bilaterally (pulmonary edema), plethoric IVC with minimal collapse (<50%).",
        mdm: "Start inotropic support (e.g., dobutamine), consider IABP, obtain 12-lead ECG, activate cardiology, and prepare for possible cardiac catheterization."
      }
    };

    document.addEventListener('DOMContentLoaded', () => {
      // Scoring listeners
      document.querySelectorAll('.score-select').forEach(select => {
        select.addEventListener('change', calculateTotals);
      });

      // Set today's date once
      const dateEl = document.getElementById('exam-date');
      if (dateEl && !dateEl.value) dateEl.valueAsDate = new Date();

      // Vignettes display
      document.getElementById('station-1-case').addEventListener('change', updateVignette);
      document.getElementById('station-2-case').addEventListener('change', updateVignette);

      // Summary generation
      document.getElementById('generate-summary-btn').addEventListener('click', () => {
        // First, update the on-page summary
        displaySummary();
        // Then, trigger the PDF download
        downloadVectorPDF();
      });
    });

    function displaySummary() {
      const container = document.getElementById('summary-container');
      const summaryNode = buildSummaryNode();
      container.innerHTML = ''; // Clear previous summary
      container.appendChild(summaryNode);
    }

    function downloadVectorPDF() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // --- 1. GATHER DATA ---
      const resident = document.getElementById('resident-name')?.value.trim() || '—';
      const proctor = document.getElementById('proctor-name')?.value.trim() || '—';
      const pgy = document.getElementById('resident-pgy')?.value.trim() || '—';
      const date = document.getElementById('exam-date')?.value.trim() || new Date().toISOString().slice(0, 10);

      const s1 = collectStationScores(1);
      const s2 = collectStationScores(2);
      const grandTotal = s1.total + s2.total;

      const case1 = getAssignedCase(1);
      const case2 = getAssignedCase(2);

      const feedback = document.getElementById('proctor-feedback')?.value.trim() || '—';

      // --- 2. BUILD FILENAME ---
      let filename = 'EM_POCUS_Practicum_Summary.pdf';
      if (resident !== '—') {
        const nameParts = resident.split(' ').filter(Boolean);
        const lastName = nameParts.pop() || 'Resident';
        const firstName = nameParts.shift() || 'Unknown';
        filename = `${lastName}_${firstName}_EM_POCUS_Practicum_${date}.pdf`;
      }

      // --- 3. CONSTRUCT PDF ---
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      let cursorY = margin;
      let finalY = 0; // Variable to track the bottom of the tables

      // Title
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text("EM POCUS Practicum – Summary", pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 10;

      // Meta Details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Resident: ${resident}`, margin, cursorY);
      doc.text(`Proctor: ${proctor}`, pageWidth / 2, cursorY);
      cursorY += 6;
      doc.text(`PGY: ${pgy}`, margin, cursorY);
      doc.text(`Date: ${date}`, pageWidth / 2, cursorY);
      cursorY += 10;

      // Tables
      const tableHeaders = [['Item', 'Score', 'Notes']];
      const tableBodyS1 = s1.rows.map(r => [r.label, r.score, r.note || ' ']);
      const tableBodyS2 = s2.rows.map(r => [r.label, r.score, r.note || ' ']);

      const tableOptions = {
        headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 'auto' }
        },
        didDrawPage: (data) => {
          // This hook is called after a table is drawn. We use it to get the final Y position.
          finalY = data.cursor.y;
        }
      };

      // Station 1 Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Station 1: ${case1}`, margin, cursorY);
      cursorY += 2;
      doc.autoTable({
        head: tableHeaders,
        body: tableBodyS1,
        ...tableOptions,
        startY: cursorY,
        margin: { left: margin, right: margin }
      });
      cursorY = finalY + 8; // Move cursor below the first table

      // Station 2 Table
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Station 2: ${case2}`, margin, cursorY);
      cursorY += 2;
      doc.autoTable({
        head: tableHeaders,
        body: tableBodyS2,
        ...tableOptions,
        startY: cursorY,
        margin: { left: margin, right: margin }
      });
      cursorY = finalY + 10; // Move cursor below the second table

      // Grand Total
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const passFailStatus = grandTotal >= 37 ? 'PASS' : 'FAIL';
      const passFailColor = grandTotal >= 37 ? '#228B22' : '#8B0000';
      const totalText = `Grand Total: ${grandTotal} / 52`;
      const totalWidth = doc.getTextWidth(totalText);
      const statusWidth = doc.getTextWidth(passFailStatus);

      doc.setTextColor(0, 0, 0);
      doc.text(totalText, pageWidth - margin - totalWidth, cursorY);
      doc.setTextColor(passFailColor);
      doc.text(passFailStatus, pageWidth - margin - totalWidth - statusWidth - 5, cursorY);
      cursorY += 10;

      // Feedback
      doc.setTextColor(0, 0, 0); // Reset color
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("Proctor Feedback:", margin, cursorY);
      cursorY += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const feedbackLines = doc.splitTextToSize(feedback, pageWidth - (margin * 2));
      doc.text(feedbackLines, margin, cursorY);
      cursorY += (feedbackLines.length * 4) + 10;

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 10);

      // --- 4. SAVE ---
      doc.save(filename);
    }

    function calculateTotals() {
      let station1Total = 0, station2Total = 0;
      document.querySelectorAll('.score-select[data-station="1"]').forEach(s => station1Total += parseInt(s.value) || 0);
      document.querySelectorAll('.score-select[data-station="2"]').forEach(s => station2Total += parseInt(s.value) || 0);

      const grandTotal = station1Total + station2Total;

      document.getElementById('station-1-total').textContent = station1Total;
      document.getElementById('station-2-total').textContent = station2Total;
      document.getElementById('grand-total').textContent = grandTotal;

      const passFailStatusEl = document.getElementById('pass-fail-status');
      if (grandTotal >= 37) {
        passFailStatusEl.textContent = 'PASS';
        passFailStatusEl.className = 'pass';
      } else {
        passFailStatusEl.textContent = 'FAIL';
        passFailStatusEl.className = 'fail';
      }
    }

    function updateVignette(event) {
      const select = event.target;
      const selectedCase = select.value;
      const stationNum = select.id.includes('station-1') ? '1' : '2';
      const container = document.getElementById(`station-${stationNum}-vignette`);
      const data = caseVignettes[selectedCase];

      if (data) {
        container.innerHTML = `
          <p class="italic">${data.stem}</p>
          <hr class="my-2 border-gray-300">
          <p><strong class="font-semibold text-gray-700">Expected Study:</strong> ${data.study}</p>
          <p><strong class="font-semibold text-gray-700">Key Findings:</strong> ${data.findings}</p>
          <p><strong class="font-semibold text-gray-700">Integration (MDM):</strong> ${data.mdm}</p>
        `;
        container.style.display = 'block';
      } else {
        container.innerHTML = '';
        container.style.display = 'none';
      }
    }

    // ===== Summary Export (build compact one-page report and export) =====
    function getStationLabels() {
      return [
        "A. Exam Selection – Correct exam",
        "B1. Probe Selection",
        "B2. Machine Setup",
        "B3. Patient Positioning",
        "B4. Image Acquisition (All views)",
        "B5. Image Optimization",
        "C1. Interpretation – Anatomy",
        "C2. Interpretation – Pathology",
        "D1. Clinical Integration – Summary",
        "D2. Clinical Integration – MDM"
      ];
    }

    function collectStationScores(stationNum) {
      const labels = getStationLabels();
      const selects = Array.from(document.querySelectorAll(`select.score-select[data-station="${stationNum}"]`));
      const rows = selects.map((sel, idx) => {
        const rowEl = sel.closest('tr');
        const noteEl = rowEl.querySelector('.notes-input');
        return {
          label: labels[idx] || `Item ${idx+1}`,
          score: parseInt(sel.value || "0", 10),
          note: noteEl ? noteEl.value.trim() : ''
        };
      });
      const total = rows.reduce((s, r) => s + (Number.isFinite(r.score) ? r.score : 0), 0);
      return { rows, total };
    }

    function getAssignedCase(stationNum) {
      const sel = document.getElementById(`station-${stationNum}-case`);
      return sel && sel.value ? sel.value : "—";
    }

    function buildSummaryNode() {
      // Meta
      const resident = (document.getElementById('resident-name')?.value || '').trim() || '—';
      const proctor  = (document.getElementById('proctor-name')?.value || '').trim()  || '—';
      const pgy      = (document.getElementById('resident-pgy')?.value || '').trim()  || '—';
      const date     = (document.getElementById('exam-date')?.value || '').trim()     || new Date().toISOString().slice(0,10);

      // Scores
      const s1 = collectStationScores(1);
      const s2 = collectStationScores(2);
      const grand = s1.total + s2.total;
      const passFailStatus = grand >= 37 ? 'PASS' : 'FAIL';
      const passFailClass = grand >= 37 ? 'pass' : 'fail';

      // Cases
      const case1 = getAssignedCase(1);
      const case2 = getAssignedCase(2);

      // Feedback
      const feedbackRaw = (document.getElementById('proctor-feedback')?.value || '').trim();
      const feedback = feedbackRaw.length > 1200 ? (feedbackRaw.slice(0, 1200) + ' …') : feedbackRaw;

      const makeTable = (stationTitle, data, caseName) => {
        const body = data.rows.map(r => `
          <tr>
            <td>${r.label}</td>
            <td class="score-cell">${Number.isFinite(r.score) ? r.score : '—'}</td>
            <td class="notes-cell">${r.note || ''}</td>
          </tr>
        `).join('');
        return `
          <h2>${stationTitle}</h2>
          <div class="small"><span class="chip">${caseName}</span></div>
          <table>
            <thead><tr><th>Item</th><th>Score</th><th>Notes</th></tr></thead>
            <tbody>${body}</tbody>
          </table>
          <div class="totals">Total: <span class="grand">${data.total}</span> / 26</div>
        `;
      };

      // Build container
      const wrap = document.createElement('div');
      wrap.id = 'summary-pdf'; // Re-use styles where possible
      wrap.innerHTML = `
        <h1>EM POCUS Practicum – Summary</h1>
        <div class="meta">
          <div><span>Resident:</span> ${resident}</div>
          <div><span>Proctor:</span> ${proctor}</div>
          <div><span>PGY:</span> ${pgy}</div>
          <div><span>Date:</span> ${date}</div>
        </div>

        <div class="station-summary-container">
          ${makeTable('Station 1', s1, case1)}
          ${makeTable('Station 2', s2, case2)}
        </div>

        <div class="totals" style="margin-top:0.6rem;">
          <span id="summary-pass-fail-status" class="${passFailClass}">${passFailStatus}</span>
          Grand Total: <span class="grand">${grand}</span> / 52
        </div>

        <h2 style="margin-top:0.6rem;">Proctor Feedback</h2>
        <div class="notes">${feedback || '—'}</div>

        <div class="small">Generated ${new Date().toLocaleString()}</div>
      `;
      return wrap;
    }
