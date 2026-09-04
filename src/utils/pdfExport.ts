import jsPDF from 'jspdf';
import { CalculationInputs, CalculationResults, DuctMaterial } from '../types';

export function exportCalculationToPDF(
  inputs: CalculationInputs,
  results: CalculationResults,
  ductMaterial: DuctMaterial,
  canvasElement?: HTMLCanvasElement | null
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, pageWidth - 2 * margin, 20, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('LAPORAN TEKNIS ANALISA & DESAIN ISOLASI TERMAL', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  const modeStr = inputs.mode === 'design' ? 'MODE DESAIN (OPTIMISASI TEBAL)' : 'MODE DIAGNOSA (AUDIT KINERJA EKSISTING)';
  doc.text(`ThermoDuct Analyzer | ${modeStr} | Dibuat: ${new Date().toLocaleString('id-ID')}`, margin + 6, y + 14);

  y += 25;

  // Summary KPI Cards (4 cards in a row)
  const cardW = (pageWidth - 2 * margin - 9) / 4;
  const cardH = 18;

  // Card 1: Heat Loss
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL HEAT LOSS', margin + 3, y + 5);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${(results.heatLossTotalW / 1000).toFixed(2)} kW`, margin + 3, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Flux: ${results.heatFluxWm2} W/m²`, margin + 3, y + 15.5);

  // Card 2: Surface Temp & Safety
  const c2X = margin + cardW + 3;
  doc.roundedRect(c2X, y, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('SUHU PERMUKAAN', c2X + 3, y + 5);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  if (results.personnelProtectionStatus === 'safe') {
    doc.setTextColor(22, 163, 74); // green
  } else if (results.personnelProtectionStatus === 'warning') {
    doc.setTextColor(217, 119, 6); // amber
  } else {
    doc.setTextColor(220, 38, 38); // red
  }
  doc.text(`${results.outerSurfaceTempC}°C`, c2X + 3, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(results.personnelProtectionStatus === 'safe' ? 'Aman Sentuh (ASTM)' : 'Peringatan Suhu Tinggi', c2X + 3, y + 15.5);

  // Card 3: Recommended Insulation / Status
  const c3X = c2X + cardW + 3;
  doc.roundedRect(c3X, y, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    inputs.hasInsulation === false
      ? 'STATUS ISOLASI'
      : inputs.mode === 'design'
      ? 'REKOMENDASI ISOLASI'
      : 'EFEKTIF ISOLASI',
    c3X + 3,
    y + 5
  );
  doc.setFontSize(inputs.hasInsulation === false ? 9.5 : 11);
  doc.setFont('helvetica', 'bold');
  if (inputs.hasInsulation === false) {
    doc.setTextColor(217, 119, 6); // amber
    doc.text('Tanpa Isolasi (Bare)', c3X + 3, y + 12);
  } else {
    doc.setTextColor(15, 23, 42);
    doc.text(`${results.recommendedInsulationThicknessMm} mm`, c3X + 3, y + 12);
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    inputs.hasInsulation === false
      ? `Rek. Pasang: ${results.recommendedInsulationThicknessMm} mm`
      : `Tebal Shell: ${results.recommendedDuctThicknessMm} mm`,
    c3X + 3,
    y + 15.5
  );

  // Card 4: Financial Annual Cost
  const c4X = c3X + cardW + 3;
  doc.roundedRect(c4X, y, cardW, cardH, 2, 2, 'FD');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('BIAYA ENERGI / THN', c4X + 3, y + 5);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  const costJt = (results.financial.annualCostIdr / 1000000).toFixed(1);
  doc.text(`Rp ${costJt} Juta`, c4X + 3, y + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(`Emisi: ${results.financial.co2EmissionsTonsPerYear} T CO₂`, c4X + 3, y + 15.5);

  y += cardH + 6;

  // Embedded Canvas Image if provided
  if (canvasElement) {
    try {
      const imgData = canvasElement.toDataURL('image/png');
      const imgWidth = pageWidth - 2 * margin;
      const imgHeight = 65;
      doc.addImage(imgData, 'PNG', margin, y, imgWidth, imgHeight);
      y += imgHeight + 6;
    } catch (e) {
      console.warn('Could not embed canvas to PDF', e);
    }
  }

  // Section 1: Parameter Operasi & Desain
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('1. PARAMETER OPERASI, GEOMETRI & LINGKUNGAN', margin, y);
  y += 4;

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - 2 * margin, 28, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - 2 * margin, 28, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);

  const col1 = margin + 4;
  const col2 = margin + 65;
  const col3 = margin + 125;

  const shapeStr =
    inputs.shape === 'cylindrical'
      ? `Silinder / Pipa (ID: ${inputs.innerDiameterMm} mm)`
      : inputs.shape === 'kiln'
      ? `Rotary Kiln (ID: ${inputs.innerDiameterMm} mm)`
      : `Ducting Persegi (${inputs.widthMm} x ${inputs.heightMm} mm)`;

  doc.text(`• Bentuk: ${shapeStr}`, col1, y + 5);
  doc.text(`• Panjang Ducting: ${inputs.lengthM} meter`, col1, y + 10);
  doc.text(`• Plat Shell: ${ductMaterial.name.split('(')[0]} (${inputs.ductThicknessMm} mm)`, col1, y + 15);
  doc.text(`• Sistem Isolasi: ${inputs.hasInsulation === false ? 'Bare Duct (Tanpa Isolasi)' : `${inputs.layers.length} Lapisan`}`, col1, y + 20);
  doc.text(`• Tekanan Operasi: ${inputs.internalPressureBar} bar (Gauge)`, col1, y + 25);

  doc.text(`• Jenis Fluida: ${inputs.fluidType.toUpperCase()}`, col2, y + 5);
  doc.text(`• Suhu Fluida (T_f): ${inputs.fluidTempC} °C`, col2, y + 10);
  doc.text(`• Kecepatan Fluida: ${inputs.fluidVelocityMs} m/s`, col2, y + 15);
  doc.text(`• Rezim Aliran: ${results.flowType}`, col2, y + 20);
  doc.text(`• Reynolds (Re): ${results.reynoldsNumber.toLocaleString()}`, col2, y + 25);

  doc.text(`• Suhu Lingkungan (Ambient): ${inputs.ambientTempC} °C`, col3, y + 5);
  doc.text(`• Kecepatan Angin: ${inputs.windSpeedMs} m/s`, col3, y + 10);
  doc.text(`• Emisivitas Permukaan: ${inputs.externalEmissivity}`, col3, y + 15);
  if (inputs.mode === 'design') {
    doc.text(`• Target Suhu Luar: ${inputs.targetOuterTempC} °C`, col3, y + 20);
  } else {
    doc.text(`• Suhu Luar Terukur: ${inputs.measuredOuterTempC} °C`, col3, y + 20);
  }

  y += 32;

  // Section 2: Spesifikasi Lapisan Dinding & Profil Termal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('2. SPESIFIKASI LAPISAN DINDING & DISTRIBUSI TEMPERATUR', margin, y);
  y += 4;

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, pageWidth - 2 * margin, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');

  doc.text('Posisi', margin + 3, y + 4.2);
  doc.text('Nama Lapisan / Material', margin + 30, y + 4.2);
  doc.text('Tebal (mm)', margin + 95, y + 4.2);
  doc.text('T_Dalam (°C)', margin + 120, y + 4.2);
  doc.text('T_Luar (°C)', margin + 145, y + 4.2);
  doc.text('Status Termal', margin + 165, y + 4.2);

  y += 6;

  // Table rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);

  results.layerResults.forEach((lyr, index) => {
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - 2 * margin, 5.5, 'F');
    }
    doc.setTextColor(15, 23, 42);

    const posLabel =
      lyr.position === 'inside'
        ? 'Refractory Dalam'
        : lyr.position === 'duct_wall'
        ? 'Ducting Shell'
        : 'Isolasi Luar';

    doc.text(posLabel, margin + 3, y + 4);
    doc.text(lyr.name.length > 34 ? lyr.name.slice(0, 32) + '...' : lyr.name, margin + 30, y + 4);
    doc.text(`${lyr.thicknessMm.toFixed(1)}`, margin + 95, y + 4);
    doc.text(`${lyr.tInnerC.toFixed(1)}`, margin + 120, y + 4);
    doc.text(`${lyr.tOuterC.toFixed(1)}`, margin + 145, y + 4);

    if (lyr.isOverheating) {
      doc.setTextColor(220, 38, 38);
      doc.text(`Overheat (> ${lyr.maxServiceTempC}°C)`, margin + 165, y + 4);
    } else {
      doc.setTextColor(22, 163, 74);
      doc.text('Aman', margin + 165, y + 4);
    }

    y += 5.5;
  });

  y += 4;

  // Section 3: Diagnostic / Engineering Assessment Notes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('3. KESIMPULAN REKAYASA & REKOMENDASI AUDIT', margin, y);
  y += 4;

  const boxHeight = results.diagnostic ? 28 : 24;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - 2 * margin, boxHeight, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  let note1 = `• Status Keselamatan: ${results.statusMessage}`;
  let note2 = `• Efisiensi Termal: h_in = ${results.internalConvectionHi} W/m²·K, h_out = ${results.externalConvectionHo} W/m²·K, h_rad = ${results.radiationHr} W/m²·K.`;
  let note3 = `• Ketebalan Shell Plat: Terpasang ${inputs.ductThicknessMm} mm vs min. kode ${results.recommendedDuctThicknessMm} mm (Safety factor = ${results.ductSafetyFactor}x).`;

  doc.text(note1, margin + 4, y + 5);
  doc.text(note2, margin + 4, y + 10);
  doc.text(note3, margin + 4, y + 15);

  if (results.diagnostic) {
    const diagNote1 = `• Diagnosa Keausan: Isolasi ${results.diagnostic.insulationWearPercent}% degradasi (Tebal efektif: ${results.diagnostic.effectiveThicknessMm} mm, Efisiensi: ${results.diagnostic.insulationEfficiencyPercent}%). Plat: ${results.diagnostic.ductIntegrityStatus}.`;
    const diagNote2 = `• Kebutuhan Isolasi: ${results.diagnostic.insulationUrgency} | Rekomendasi: ${results.diagnostic.recommendations[0] || 'Lakukan audit berkala.'}`;
    doc.text(diagNote1, margin + 4, y + 20);
    doc.text(diagNote2, margin + 4, y + 25);
  } else {
    const potNote = `• Potensi Efisiensi Biaya: Penghematan hingga Rp ${(results.financial.potentialSavingsIdr / 1000000).toFixed(1)} Juta/tahun dapat dicapai dengan ketebalan isolasi optimal.`;
    doc.text(potNote, margin + 4, y + 20);
  }

  // Footer page number & signature line
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('Divalidasi oleh Sistem Analisa Termal ThermoDuct | Standar Referensi: ASTM C1055, ASME B31.3, SMACNA', margin, pageHeight - 8);
  doc.text('Hal 1 / 1', pageWidth - margin - 15, pageHeight - 8);

  // Save PDF
  const filename = `ThermoDuct_Report_${inputs.shape}_${Date.now()}.pdf`;
  doc.save(filename);
}
