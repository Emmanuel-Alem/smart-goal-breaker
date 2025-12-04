import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import type { Goal } from "./api";

// Export as JSON
export function exportAsJSON(goals: Goal[]) {
  const data = JSON.stringify(goals, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  saveAs(blob, `goals-export-${getDateString()}.json`);
}

// Export as CSV
export function exportAsCSV(goals: Goal[]) {
  const headers = ["Goal", "Complexity Score", "Complexity Level", "Created At", "Step 1", "Step 2", "Step 3", "Step 4", "Step 5"];
  
  const rows = goals.map((goal) => {
    const sortedTasks = goal.tasks.sort((a, b) => a.step_number - b.step_number);
    const steps = sortedTasks.map((t) => `"${t.description.replace(/"/g, '""')}"`);
    
    // Pad with empty strings if less than 5 steps
    while (steps.length < 5) {
      steps.push('""');
    }

    return [
      `"${goal.title.replace(/"/g, '""')}"`,
      goal.complexity_score,
      getComplexityLevel(goal.complexity_score),
      new Date(goal.created_at).toLocaleDateString(),
      ...steps,
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, `goals-export-${getDateString()}.csv`);
}

// Export as PDF
export function exportAsPDF(goals: Goal[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Smart Goal Breaker - Goals Export", margin, y);
  y += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(128, 128, 128);
  doc.text(`Exported on ${new Date().toLocaleDateString()}`, margin, y);
  doc.setTextColor(0, 0, 0);
  y += 15;

  goals.forEach((goal, index) => {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Goal title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(goal.title, maxWidth);
    doc.text(titleLines, margin, y);
    y += titleLines.length * 6 + 2;

    // Complexity and date
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(
      `${getComplexityLevel(goal.complexity_score)} (${goal.complexity_score}/10) • ${new Date(goal.created_at).toLocaleDateString()}`,
      margin,
      y
    );
    doc.setTextColor(0, 0, 0);
    y += 8;

    // Steps
    const sortedTasks = goal.tasks.sort((a, b) => a.step_number - b.step_number);
    sortedTasks.forEach((task) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const stepText = `${task.step_number}. ${task.description}`;
      const stepLines = doc.splitTextToSize(stepText, maxWidth - 5);
      doc.text(stepLines, margin + 5, y);
      y += stepLines.length * 5 + 2;
    });

    y += 10;

    // Separator line (except for last goal)
    if (index < goals.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, y - 5, pageWidth - margin, y - 5);
    }
  });

  doc.save(`goals-export-${getDateString()}.pdf`);
}

// Export as DOC (DOCX)
export async function exportAsDOC(goals: Goal[]) {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: "Smart Goal Breaker - Goals Export",
      heading: HeadingLevel.TITLE,
      spacing: { after: 200 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Exported on ${new Date().toLocaleDateString()}`,
          color: "808080",
          size: 20,
        }),
      ],
      spacing: { after: 400 },
    })
  );

  goals.forEach((goal, index) => {
    // Goal title
    children.push(
      new Paragraph({
        text: goal.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 100 },
      })
    );

    // Complexity and date
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${getComplexityLevel(goal.complexity_score)} (${goal.complexity_score}/10) • ${new Date(goal.created_at).toLocaleDateString()}`,
            color: "808080",
            size: 20,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    // Steps
    const sortedTasks = goal.tasks.sort((a, b) => a.step_number - b.step_number);
    sortedTasks.forEach((task) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${task.step_number}. `,
              bold: true,
            }),
            new TextRun({
              text: task.description,
            }),
          ],
          spacing: { after: 100 },
          indent: { left: 360 },
        })
      );
    });

    // Add spacing between goals
    if (index < goals.length - 1) {
      children.push(
        new Paragraph({
          text: "",
          spacing: { after: 200 },
          border: {
            bottom: { style: "single", size: 6, color: "DDDDDD" },
          },
        })
      );
    }
  });

  const doc = new Document({
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `goals-export-${getDateString()}.docx`);
}

// Helper functions
function getDateString(): string {
  return new Date().toISOString().split("T")[0];
}

function getComplexityLevel(score: number): string {
  if (score <= 3) return "Easy";
  if (score <= 6) return "Medium";
  return "Hard";
}
