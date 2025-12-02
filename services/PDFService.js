import PDFDocument from 'pdfkit'

export const pdfService = {
  buildBugsPDF,
}

export function buildBugsPDF(bugs) {
  const doc = new PDFDocument()

  bugs.forEach((bug, idx) => {
    doc.text(`Bug ID: ${bug._id || bug.id}`)
    doc.text(`Title: ${bug.title}`)
    doc.text(`Description: ${bug.description}`)
    doc.text(`Severity: ${bug.severity}`)
    doc.text(`CreatedAt: ${bug.createdAt}`)

    // Separate bugs with spacing and a divider line
    if (idx < bugs.length - 1) {
      doc.moveDown(1)
      doc.text('-------------------------------')
      doc.moveDown(1)
    }
  })

  return doc
}
