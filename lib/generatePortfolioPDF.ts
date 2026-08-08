// Client-side PDF generation for portfolio export.
// Uses jsPDF + jspdf-autotable — no server required.
// Must only be called from browser context ('use client' components).
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { PortfolioResponse, PortfolioHolding } from '@/types/portfolio.types'
import { gradeLabel } from '@/lib/portfolioGrade'
import { notoSansRegularBase64, notoSansBoldBase64 } from '@/lib/fonts/notoSansFonts'

// ── Types ────────────────────────────────────────────────────────────────────

interface HoldingWithTargets extends PortfolioHolding {
  target_1?: number | null
  target_2?: number | null
  target_3?: number | null
}

type RGB = [number, number, number]

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_W  = 210
const MARGIN  = 20
const CW      = PAGE_W - MARGIN * 2   // 170mm

const BLACK : RGB = [0, 0, 0]
const GRAY  : RGB = [107, 114, 128]
const LGRAY : RGB = [229, 231, 235]
const FAINT : RGB = [249, 250, 251]

const BLUE  : RGB = [6,   100, 232]
const RED   : RGB = [239, 68,  68]
const GREEN : RGB = [16,  185, 129]

const PALETTE: RGB[] = [
  [6, 100, 232], [110, 86, 207], [16, 185, 129], [245, 158, 11], [239, 68, 68],
  [139, 92, 246], [6, 182, 212], [132, 204, 22], [249, 115, 22], [236, 72, 153],
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function divScore(holdings: HoldingWithTargets[]): number {
  if (!holdings.length) return 0
  const hhi = holdings.reduce((s, h) => s + ((h.percentage_allocation ?? 0) / 100) ** 2, 0)
  return Math.round((1 - hhi) * 100) / 10
}

function rupees(n: number | null | undefined): string {
  if (n == null) return '—'
  return '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

function cleanSymbol(s: string | null | undefined): string {
  if (!s) return '—'
  return s.replace(/\.(NSE|BSE)$/i, '')
}

function dateLabel(): string {
  return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

const COMPANY_ABBREVIATIONS: Record<string, string> = {
  'Tata Consultancy Services Ltd': 'Tata Consultancy',
  'Reliance Industries Ltd':       'Reliance Industries',
  'HDFC Bank Ltd':                 'HDFC Bank',
  'Infosys Ltd':                   'Infosys',
  'Wipro Ltd':                     'Wipro',
}

function shortenCompany(name: string | null | undefined): string {
  if (!name) return '—'
  return COMPANY_ABBREVIATIONS[name] ?? name
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generatePortfolioPDF(
  result: PortfolioResponse,
  type: 'swing' | 'position' = 'swing',
): void {
  const { summary, portfolio } = result
  const holdings = portfolio as HoldingWithTargets[]

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })

  // Register NotoSans (subset: ASCII + U+2014 + U+20B9) for proper ₹ rendering
  doc.addFileToVFS('NotoSans-Regular.ttf', notoSansRegularBase64)
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal')
  doc.addFileToVFS('NotoSans-Bold.ttf', notoSansBoldBase64)
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold')

  const date = dateLabel()
  let y = MARGIN

  // ── HEADER ─────────────────────────────────────────────────────────────────

  doc.setFont('NotoSans', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...BLACK)
  doc.text('SENTIQUANT', MARGIN, y)

  doc.setFont('NotoSans', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...GRAY)
  doc.text(date, PAGE_W - MARGIN, y, { align: 'right' })

  y += 6
  doc.setFontSize(11)
  doc.text('AI Portfolio Report', MARGIN, y)

  y += 5
  doc.setDrawColor(...LGRAY)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, y, PAGE_W - MARGIN, y)

  y += 8

  // ── SUMMARY STATS ──────────────────────────────────────────────────────────

  const g    = gradeLabel(summary.average_score)
  const div  = divScore(holdings)
  const strat = type === 'swing' ? 'Swing Trading' : 'Position Trading'
  const deployed = summary.total_budget > 0
    ? ((summary.total_allocated / summary.total_budget) * 100).toFixed(1) + '%'
    : '0%'

  const COL = CW / 4
  const rows = [
    [
      { label: 'STRATEGY',        value: strat },
      { label: 'GRADE',           value: g },
      { label: 'AVG AI SCORE',    value: `${Math.round(summary.average_score)}/100` },
      { label: 'DIVERSIFICATION', value: `${div}/10` },
    ],
    [
      { label: 'TOTAL BUDGET',    value: rupees(summary.total_budget) },
      { label: 'ALLOCATED',       value: `${rupees(summary.total_allocated)} (${deployed})` },
      { label: 'CASH REMAINING',  value: rupees(summary.remaining_cash) },
      { label: 'POSITIONS',       value: String(holdings.length) },
    ],
  ]

  for (const row of rows) {
    row.forEach((cell, ci) => {
      const x = MARGIN + ci * COL
      doc.setFont('NotoSans', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...GRAY)
      doc.text(cell.label, x, y)

      doc.setFont('NotoSans', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...BLACK)
      doc.text(cell.value, x, y + 5)
    })
    y += 14
  }

  y += 2

  // ── ALLOCATION BAR ─────────────────────────────────────────────────────────

  doc.setFont('NotoSans', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY)
  doc.text('ALLOCATION BREAKDOWN', MARGIN, y)
  y += 4

  const BAR_H = 5
  let bx = MARGIN
  const visHoldings = holdings.slice(0, 10)
  visHoldings.forEach((h, i) => {
    const pct = h.percentage_allocation ?? 0
    const segW = (pct / 100) * CW
    if (segW > 0) {
      doc.setFillColor(...PALETTE[i % PALETTE.length])
      doc.rect(bx, y, segW, BAR_H, 'F')
      bx += segW
    }
  })
  y += BAR_H + 4

  // Legend — wrap across lines as needed
  let lx = MARGIN
  let ly = y
  const LINE_H = 5
  visHoldings.forEach((h, i) => {
    const sym   = cleanSymbol(h.symbol)
    const pct   = (h.percentage_allocation ?? 0).toFixed(1)
    const label = `${sym} ${pct}%`
    // Approximate text width: ~1.7mm per char at 8pt
    const tw = label.length * 1.7 + 6
    if (lx + tw > PAGE_W - MARGIN) {
      lx = MARGIN
      ly += LINE_H
    }
    doc.setFillColor(...PALETTE[i % PALETTE.length])
    doc.rect(lx, ly - 2.8, 3, 3, 'F')
    doc.setFont('NotoSans', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(label, lx + 4, ly)
    lx += tw
  })
  y = ly + 7

  // ── HOLDINGS TABLE ─────────────────────────────────────────────────────────

  const tableRows = holdings.map((h, i) => [
    String(i + 1),
    cleanSymbol(h.symbol),
    shortenCompany(h.company),
    h.percentage_allocation != null ? `${h.percentage_allocation.toFixed(1)}%` : '—',
    h.investment_amount != null ? rupees(h.investment_amount) : '—',
    h.price != null ? rupees(h.price) : '—',
    h.stop_loss != null ? rupees(h.stop_loss) : '—',
    h.target_1 != null ? rupees(h.target_1) : '—',
    h.target_2 != null ? rupees(h.target_2) : '—',
    h.target_3 != null ? rupees(h.target_3) : '—',
    h.score != null ? String(Math.round(h.score)) : '—',
  ])

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['#', 'Symbol', 'Company', 'Alloc%', 'Amount', 'Entry', 'Stop Loss', 'T1', 'T2', 'T3', 'Score']],
    body: tableRows,
    // Column widths — total 171mm (1mm tolerance against 170mm usable).
    // Entry 12mm, Score 12mm; # 8mm so row numbers fit without overflow.
    columnStyles: {
      0:  { cellWidth: 8,  halign: 'center', valign: 'top' },
      1:  { cellWidth: 22, halign: 'left',   valign: 'top' },
      2:  { cellWidth: 24, halign: 'left',   valign: 'top' },
      3:  { cellWidth: 12, halign: 'right',  valign: 'top' },
      4:  { cellWidth: 18, halign: 'right',  valign: 'top' },
      5:  { cellWidth: 14, halign: 'right',  valign: 'top' },
      6:  { cellWidth: 16, halign: 'right',  valign: 'top' },
      7:  { cellWidth: 16, halign: 'right',  valign: 'top' },
      8:  { cellWidth: 16, halign: 'right',  valign: 'top' },
      9:  { cellWidth: 13, halign: 'right',  valign: 'top' },
      10: { cellWidth: 12, halign: 'right',  valign: 'top' },
    },
    headStyles: {
      fillColor:   BLUE,
      textColor:   [255, 255, 255] as RGB,
      fontStyle:   'bold',
      font:        'NotoSans',
      fontSize:    8,
      cellPadding: 2,
      valign:      'bottom',
    },
    bodyStyles: {
      fontSize:    8,
      font:        'NotoSans',
      textColor:   BLACK,
      cellPadding: 2,
      valign:      'top',
    },
    alternateRowStyles: {
      fillColor: FAINT,
    },
    didParseCell(data) {
      if (data.section !== 'body') return
      const v = data.cell.text[0]
      const isDash = v === '—'
      const col = data.column.index

      if (isDash) {
        data.cell.styles.textColor = GRAY
        return
      }
      if (col === 6)  data.cell.styles.textColor = RED
      if (col === 7 || col === 8 || col === 9) data.cell.styles.textColor = GREEN
      if (col === 10) data.cell.styles.textColor = BLUE
    },
  })

  // ── FOOTER ──────────────────────────────────────────────────────────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tableEndY: number = (doc as any).lastAutoTable?.finalY ?? y
  const fy = tableEndY + 8

  doc.setDrawColor(...LGRAY)
  doc.setLineWidth(0.3)
  doc.line(MARGIN, fy, PAGE_W - MARGIN, fy)

  doc.setFont('NotoSans', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...GRAY)

  doc.text(`Generated by SentiQuant AI · ${date}`, MARGIN, fy + 4)
  doc.text(
    'All outputs are AI-generated technical observations based on publicly available data. ' +
    'This is not a research report under SEBI Research Analyst Regulations 2014 and does not ' +
    'constitute investment advice under SEBI Investment Adviser Regulations 2013. ' +
    'SentiQuant is not a SEBI-registered entity.',
    MARGIN, fy + 8,
    { maxWidth: CW },
  )

  doc.save(`sentiquant-portfolio-${Date.now()}.pdf`)
}
